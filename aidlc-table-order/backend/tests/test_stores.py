"""Tests for Store endpoints (C2)."""

import uuid

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from cores.db.models.enums import UserRole
from cores.db.models.store import Store
from cores.security.jwt import create_access_token


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
async def _create_store(db: AsyncSession) -> Store:
    store = Store(id=uuid.uuid4(), name="My Store", default_prep_time_minutes=10)
    db.add(store)
    await db.commit()
    await db.refresh(store)
    return store


# ---------------------------------------------------------------------------
# GET /api/stores/{store_id}
# ---------------------------------------------------------------------------
@pytest.mark.anyio
async def test_get_store_success(client: AsyncClient, db_session: AsyncSession):
    store = await _create_store(db_session)
    token = create_access_token(
        subject=str(uuid.uuid4()),
        role=UserRole.admin,
        store_id=str(store.id),
    )

    resp = await client.get(
        f"/api/stores/{store.id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["success"] is True
    assert body["data"]["id"] == str(store.id)
    assert body["data"]["name"] == "My Store"
    assert body["data"]["default_prep_time_minutes"] == 10


@pytest.mark.anyio
async def test_get_store_not_found(client: AsyncClient, db_session: AsyncSession):
    token = create_access_token(
        subject=str(uuid.uuid4()),
        role=UserRole.admin,
        store_id=str(uuid.uuid4()),
    )

    resp = await client.get(
        f"/api/stores/{uuid.uuid4()}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 404


@pytest.mark.anyio
async def test_get_store_unauthorized(client: AsyncClient, db_session: AsyncSession):
    store = await _create_store(db_session)

    resp = await client.get(f"/api/stores/{store.id}")
    assert resp.status_code == 401
