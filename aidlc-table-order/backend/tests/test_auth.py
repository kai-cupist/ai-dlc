"""Tests for Auth endpoints (C1)."""

import uuid
from datetime import datetime, timedelta, timezone

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from cores.db.models.admin import Admin
from cores.db.models.store import Store
from cores.db.models.table import Table
from cores.security.jwt import create_refresh_token, verify_token
from cores.security.password import hash_password


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
async def _create_store(db: AsyncSession) -> Store:
    store = Store(id=uuid.uuid4(), name="Test Store", default_prep_time_minutes=15)
    db.add(store)
    await db.commit()
    await db.refresh(store)
    return store


async def _create_admin(
    db: AsyncSession,
    store: Store,
    username: str = "admin1",
    password: str = "password123",
    login_attempts: int = 0,
    locked_until: datetime | None = None,
) -> Admin:
    admin = Admin(
        id=uuid.uuid4(),
        store_id=store.id,
        username=username,
        password_hash=hash_password(password),
        login_attempts=login_attempts,
        locked_until=locked_until,
    )
    db.add(admin)
    await db.commit()
    await db.refresh(admin)
    return admin


async def _create_table(
    db: AsyncSession,
    store: Store,
    table_number: int = 1,
    password: str = "table123",
) -> Table:
    table = Table(
        id=uuid.uuid4(),
        store_id=store.id,
        table_number=table_number,
        password_hash=hash_password(password),
    )
    db.add(table)
    await db.commit()
    await db.refresh(table)
    return table


# ---------------------------------------------------------------------------
# Admin Login
# ---------------------------------------------------------------------------
@pytest.mark.anyio
async def test_admin_login_success(client: AsyncClient, db_session: AsyncSession):
    store = await _create_store(db_session)
    await _create_admin(db_session, store)

    resp = await client.post(
        "/api/auth/admin/login",
        json={
            "store_id": str(store.id),
            "username": "admin1",
            "password": "password123",
        },
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["success"] is True
    assert "access_token" in body["data"]
    assert "refresh_token" in body["data"]
    assert body["data"]["token_type"] == "bearer"

    # Verify token payload
    payload = verify_token(body["data"]["access_token"])
    assert payload.role.value == "admin"
    assert payload.store_id == str(store.id)


@pytest.mark.anyio
async def test_admin_login_wrong_password(client: AsyncClient, db_session: AsyncSession):
    store = await _create_store(db_session)
    await _create_admin(db_session, store)

    resp = await client.post(
        "/api/auth/admin/login",
        json={
            "store_id": str(store.id),
            "username": "admin1",
            "password": "wrong_password",
        },
    )
    assert resp.status_code == 401


@pytest.mark.anyio
async def test_admin_login_account_locked(client: AsyncClient, db_session: AsyncSession):
    store = await _create_store(db_session)
    await _create_admin(
        db_session,
        store,
        login_attempts=5,
        locked_until=datetime.now(timezone.utc) + timedelta(minutes=10),
    )

    resp = await client.post(
        "/api/auth/admin/login",
        json={
            "store_id": str(store.id),
            "username": "admin1",
            "password": "password123",
        },
    )
    assert resp.status_code == 423  # Locked


@pytest.mark.anyio
async def test_admin_login_attempts_reset_on_success(
    client: AsyncClient, db_session: AsyncSession
):
    store = await _create_store(db_session)
    await _create_admin(db_session, store, login_attempts=3)

    # Successful login should reset attempts
    resp = await client.post(
        "/api/auth/admin/login",
        json={
            "store_id": str(store.id),
            "username": "admin1",
            "password": "password123",
        },
    )
    assert resp.status_code == 200

    # Verify attempts were reset by checking a wrong password doesn't lock
    resp2 = await client.post(
        "/api/auth/admin/login",
        json={
            "store_id": str(store.id),
            "username": "admin1",
            "password": "wrong",
        },
    )
    assert resp2.status_code == 401
    # Should NOT be locked (only 1 failed attempt after reset)


# ---------------------------------------------------------------------------
# Table Auth
# ---------------------------------------------------------------------------
@pytest.mark.anyio
async def test_table_setup_success(client: AsyncClient, db_session: AsyncSession):
    store = await _create_store(db_session)
    await _create_table(db_session, store)

    resp = await client.post(
        "/api/auth/table/setup",
        json={
            "store_id": str(store.id),
            "table_number": 1,
            "password": "table123",
        },
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["success"] is True
    assert "access_token" in body["data"]
    assert "refresh_token" in body["data"]

    payload = verify_token(body["data"]["access_token"])
    assert payload.role.value == "table"


@pytest.mark.anyio
async def test_table_auto_login_success(client: AsyncClient, db_session: AsyncSession):
    store = await _create_store(db_session)
    await _create_table(db_session, store)

    resp = await client.post(
        "/api/auth/table/auto-login",
        json={
            "store_id": str(store.id),
            "table_number": 1,
            "password": "table123",
        },
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["success"] is True
    assert "access_token" in body["data"]


@pytest.mark.anyio
async def test_table_auto_login_wrong_password(
    client: AsyncClient, db_session: AsyncSession
):
    store = await _create_store(db_session)
    await _create_table(db_session, store)

    resp = await client.post(
        "/api/auth/table/auto-login",
        json={
            "store_id": str(store.id),
            "table_number": 1,
            "password": "wrong",
        },
    )
    assert resp.status_code == 401


# ---------------------------------------------------------------------------
# Token Refresh
# ---------------------------------------------------------------------------
@pytest.mark.anyio
async def test_token_refresh_success(client: AsyncClient, db_session: AsyncSession):
    from cores.db.models.enums import UserRole

    store = await _create_store(db_session)
    admin = await _create_admin(db_session, store)

    refresh = create_refresh_token(
        subject=str(admin.id),
        role=UserRole.admin,
        store_id=str(store.id),
    )

    resp = await client.post(
        "/api/auth/token/refresh",
        json={"refresh_token": refresh},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["success"] is True
    assert "access_token" in body["data"]
    assert "refresh_token" in body["data"]


@pytest.mark.anyio
async def test_token_refresh_invalid_token(client: AsyncClient, db_session: AsyncSession):
    resp = await client.post(
        "/api/auth/token/refresh",
        json={"refresh_token": "invalid.token.here"},
    )
    assert resp.status_code == 401
