"""Tests for Recommendation endpoints (C6)."""

import uuid

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from cores.db.models.category import Category
from cores.db.models.menu import Menu
from cores.db.models.order_history import OrderHistory
from cores.db.models.store import Store
from cores.db.models.table import Table
from cores.db.models.enums import UserRole
from cores.security.jwt import create_access_token

from datetime import datetime, timezone

STORE_ID = str(uuid.uuid4())
TABLE_UUID = uuid.uuid4()
TABLE_ID = str(TABLE_UUID)
ADMIN_ID = str(uuid.uuid4())


def _admin_token(store_id: str = STORE_ID) -> str:
    return create_access_token(subject=ADMIN_ID, role=UserRole.admin, store_id=store_id)


def _table_token(table_id: str = TABLE_ID, store_id: str = STORE_ID) -> str:
    return create_access_token(subject=table_id, role=UserRole.table, store_id=store_id)


async def _seed(db: AsyncSession) -> list[Menu]:
    store = Store(id=uuid.UUID(STORE_ID), name="Test Store")
    db.add(store)
    await db.flush()
    table = Table(
        id=TABLE_UUID,
        store_id=uuid.UUID(STORE_ID),
        table_number=1,
        password_hash="fakehash",
    )
    db.add(table)
    await db.flush()

    cat = Category(id=uuid.uuid4(), store_id=uuid.UUID(STORE_ID), name="Main", sort_order=0)
    db.add(cat)
    await db.flush()

    menus = []
    for name, price in [("Burger", 10000), ("Pizza", 12000), ("Pasta", 11000), ("Salad", 8000), ("Soup", 7000), ("Steak", 25000)]:
        m = Menu(
            id=uuid.uuid4(),
            store_id=uuid.UUID(STORE_ID),
            category_id=cat.id,
            name=name,
            price=price,
            sort_order=0,
            is_available=True,
        )
        db.add(m)
        menus.append(m)
    await db.flush()
    return menus


@pytest.mark.anyio
async def test_recommendations_with_history(client: AsyncClient, db_session: AsyncSession):
    menus = await _seed(db_session)
    burger, pizza, pasta, salad, soup, steak = menus

    # Create order history where Burger was ordered with Pizza and Pasta
    for co_menu in [pizza, pasta]:
        oh = OrderHistory(
            id=uuid.uuid4(),
            original_order_id=uuid.uuid4(),
            store_id=uuid.UUID(STORE_ID),
            table_id=TABLE_UUID,
            session_id=uuid.uuid4(),
            order_number="20260408-0001",
            round=1,
            total_amount=22000,
            items_snapshot={
                "items": [
                    {"menu_id": str(burger.id), "menu_name": "Burger", "quantity": 1},
                    {"menu_id": str(co_menu.id), "menu_name": co_menu.name, "quantity": 1},
                ]
            },
            ordered_at=datetime.now(timezone.utc),
        )
        db_session.add(oh)
    await db_session.commit()

    resp = await client.post(
        "/api/recommendations/",
        json={"menu_ids": [str(burger.id)]},
        headers={"Authorization": f"Bearer {_table_token()}"},
    )
    assert resp.status_code == 200
    data = resp.json()["data"]
    rec_names = [r["name"] for r in data["recommendations"]]
    # Pizza and Pasta should be recommended (co-ordered with Burger)
    assert "Pizza" in rec_names or "Pasta" in rec_names
    # Burger should NOT be in recommendations (already in cart)
    assert "Burger" not in rec_names


@pytest.mark.anyio
async def test_recommendations_fallback_random(client: AsyncClient, db_session: AsyncSession):
    menus = await _seed(db_session)
    burger = menus[0]
    await db_session.commit()

    # No order history, should fallback to random
    resp = await client.post(
        "/api/recommendations/",
        json={"menu_ids": [str(burger.id)]},
        headers={"Authorization": f"Bearer {_table_token()}"},
    )
    assert resp.status_code == 200
    data = resp.json()["data"]
    assert len(data["recommendations"]) <= 5
    rec_ids = [r["id"] for r in data["recommendations"]]
    assert str(burger.id) not in rec_ids


@pytest.mark.anyio
async def test_recommendations_excludes_cart_items(client: AsyncClient, db_session: AsyncSession):
    menus = await _seed(db_session)
    burger, pizza, pasta = menus[0], menus[1], menus[2]
    await db_session.commit()

    resp = await client.post(
        "/api/recommendations/",
        json={"menu_ids": [str(burger.id), str(pizza.id), str(pasta.id)]},
        headers={"Authorization": f"Bearer {_table_token()}"},
    )
    assert resp.status_code == 200
    rec_ids = [r["id"] for r in resp.json()["data"]["recommendations"]]
    assert str(burger.id) not in rec_ids
    assert str(pizza.id) not in rec_ids
    assert str(pasta.id) not in rec_ids


@pytest.mark.anyio
async def test_recommendations_requires_table(client: AsyncClient, db_session: AsyncSession):
    menus = await _seed(db_session)
    await db_session.commit()

    resp = await client.post(
        "/api/recommendations/",
        json={"menu_ids": [str(menus[0].id)]},
        headers={"Authorization": f"Bearer {_admin_token()}"},
    )
    assert resp.status_code == 403
