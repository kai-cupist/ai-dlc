"""Tests for Menu + Category endpoints (C4)."""

import uuid

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from cores.db.models.category import Category
from cores.db.models.menu import Menu
from cores.db.models.menu_option_group import MenuOptionGroup
from cores.db.models.option_group import OptionGroup
from cores.db.models.option_item import OptionItem
from cores.db.models.store import Store
from cores.db.models.enums import UserRole
from cores.security.jwt import create_access_token


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
STORE_ID = str(uuid.uuid4())
ADMIN_ID = str(uuid.uuid4())
TABLE_ID = str(uuid.uuid4())


def _admin_token(store_id: str = STORE_ID) -> str:
    return create_access_token(subject=ADMIN_ID, role=UserRole.admin, store_id=store_id)


def _table_token(store_id: str = STORE_ID) -> str:
    return create_access_token(subject=TABLE_ID, role=UserRole.table, store_id=store_id)


async def _create_store(db: AsyncSession, store_id: str = STORE_ID) -> Store:
    store = Store(id=uuid.UUID(store_id), name="Test Store")
    db.add(store)
    await db.flush()
    return store


async def _create_category(
    db: AsyncSession, store_id: str = STORE_ID, name: str = "Main", sort_order: int = 0
) -> Category:
    cat = Category(id=uuid.uuid4(), store_id=uuid.UUID(store_id), name=name, sort_order=sort_order)
    db.add(cat)
    await db.flush()
    return cat


async def _create_menu(
    db: AsyncSession,
    store_id: str,
    category_id: uuid.UUID,
    name: str = "Burger",
    price: int = 10000,
    sort_order: int = 0,
    is_popular: bool = False,
    is_available: bool = True,
) -> Menu:
    menu = Menu(
        id=uuid.uuid4(),
        store_id=uuid.UUID(store_id),
        category_id=category_id,
        name=name,
        price=price,
        sort_order=sort_order,
        is_popular=is_popular,
        is_available=is_available,
    )
    db.add(menu)
    await db.flush()
    return menu


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------
@pytest.mark.anyio
async def test_list_categories(client: AsyncClient, db_session: AsyncSession):
    await _create_store(db_session)
    cat1 = await _create_category(db_session, name="Appetizer", sort_order=0)
    cat2 = await _create_category(db_session, name="Main", sort_order=1)
    await db_session.commit()

    resp = await client.get(
        "/api/menus/categories",
        headers={"Authorization": f"Bearer {_admin_token()}"},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["success"] is True
    cats = body["data"]
    assert len(cats) == 2
    assert cats[0]["name"] == "Appetizer"
    assert cats[1]["name"] == "Main"


@pytest.mark.anyio
async def test_list_menus(client: AsyncClient, db_session: AsyncSession):
    await _create_store(db_session)
    cat = await _create_category(db_session)
    await _create_menu(db_session, STORE_ID, cat.id, "Burger", 10000, sort_order=0)
    await _create_menu(db_session, STORE_ID, cat.id, "Pizza", 12000, sort_order=1)
    await db_session.commit()

    resp = await client.get(
        "/api/menus/",
        headers={"Authorization": f"Bearer {_admin_token()}"},
    )
    assert resp.status_code == 200
    data = resp.json()["data"]
    assert len(data) == 2
    assert data[0]["name"] == "Burger"
    assert data[1]["name"] == "Pizza"


@pytest.mark.anyio
async def test_list_menus_popular_first(client: AsyncClient, db_session: AsyncSession):
    await _create_store(db_session)
    cat = await _create_category(db_session)
    await _create_menu(db_session, STORE_ID, cat.id, "Normal", 8000, sort_order=0, is_popular=False)
    await _create_menu(db_session, STORE_ID, cat.id, "Popular", 15000, sort_order=1, is_popular=True)
    await db_session.commit()

    resp = await client.get(
        "/api/menus/",
        headers={"Authorization": f"Bearer {_admin_token()}"},
    )
    assert resp.status_code == 200
    data = resp.json()["data"]
    assert data[0]["name"] == "Popular"
    assert data[0]["is_popular"] is True


@pytest.mark.anyio
async def test_get_menu_detail_with_options(client: AsyncClient, db_session: AsyncSession):
    await _create_store(db_session)
    cat = await _create_category(db_session)
    menu = await _create_menu(db_session, STORE_ID, cat.id, "Burger", 10000)

    og = OptionGroup(id=uuid.uuid4(), store_id=uuid.UUID(STORE_ID), name="Size", is_required=True)
    db_session.add(og)
    await db_session.flush()
    oi = OptionItem(id=uuid.uuid4(), option_group_id=og.id, name="Large", extra_price=2000, sort_order=0)
    db_session.add(oi)
    await db_session.flush()
    mog = MenuOptionGroup(id=uuid.uuid4(), menu_id=menu.id, option_group_id=og.id)
    db_session.add(mog)
    await db_session.commit()

    resp = await client.get(
        f"/api/menus/{menu.id}",
        headers={"Authorization": f"Bearer {_admin_token()}"},
    )
    assert resp.status_code == 200
    detail = resp.json()["data"]
    assert detail["name"] == "Burger"
    assert len(detail["option_groups"]) == 1
    assert detail["option_groups"][0]["name"] == "Size"
    assert detail["option_groups"][0]["is_required"] is True
    assert len(detail["option_groups"][0]["items"]) == 1
    assert detail["option_groups"][0]["items"][0]["name"] == "Large"


@pytest.mark.anyio
async def test_create_menu(client: AsyncClient, db_session: AsyncSession):
    await _create_store(db_session)
    cat = await _create_category(db_session)
    await db_session.commit()

    resp = await client.post(
        "/api/menus/",
        json={
            "category_id": str(cat.id),
            "name": "New Burger",
            "price": 11000,
        },
        headers={"Authorization": f"Bearer {_admin_token()}"},
    )
    assert resp.status_code == 200
    data = resp.json()["data"]
    assert data["name"] == "New Burger"
    assert data["price"] == 11000
    assert data["is_available"] is True


@pytest.mark.anyio
async def test_create_menu_requires_admin(client: AsyncClient, db_session: AsyncSession):
    await _create_store(db_session)
    cat = await _create_category(db_session)
    await db_session.commit()

    resp = await client.post(
        "/api/menus/",
        json={
            "category_id": str(cat.id),
            "name": "New Burger",
            "price": 11000,
        },
        headers={"Authorization": f"Bearer {_table_token()}"},
    )
    assert resp.status_code == 403


@pytest.mark.anyio
async def test_update_menu(client: AsyncClient, db_session: AsyncSession):
    await _create_store(db_session)
    cat = await _create_category(db_session)
    menu = await _create_menu(db_session, STORE_ID, cat.id, "Old Name", 9000)
    await db_session.commit()

    resp = await client.put(
        f"/api/menus/{menu.id}",
        json={"name": "New Name", "price": 12000},
        headers={"Authorization": f"Bearer {_admin_token()}"},
    )
    assert resp.status_code == 200
    data = resp.json()["data"]
    assert data["name"] == "New Name"
    assert data["price"] == 12000


@pytest.mark.anyio
async def test_delete_menu(client: AsyncClient, db_session: AsyncSession):
    await _create_store(db_session)
    cat = await _create_category(db_session)
    menu = await _create_menu(db_session, STORE_ID, cat.id, "ToDelete", 5000)

    og = OptionGroup(id=uuid.uuid4(), store_id=uuid.UUID(STORE_ID), name="Size")
    db_session.add(og)
    await db_session.flush()
    mog = MenuOptionGroup(id=uuid.uuid4(), menu_id=menu.id, option_group_id=og.id)
    db_session.add(mog)
    await db_session.commit()

    resp = await client.delete(
        f"/api/menus/{menu.id}",
        headers={"Authorization": f"Bearer {_admin_token()}"},
    )
    assert resp.status_code == 200

    # Verify menu is gone
    resp2 = await client.get(
        f"/api/menus/{menu.id}",
        headers={"Authorization": f"Bearer {_admin_token()}"},
    )
    assert resp2.status_code == 404


@pytest.mark.anyio
async def test_reorder_menus(client: AsyncClient, db_session: AsyncSession):
    await _create_store(db_session)
    cat = await _create_category(db_session)
    m1 = await _create_menu(db_session, STORE_ID, cat.id, "A", 1000, sort_order=0)
    m2 = await _create_menu(db_session, STORE_ID, cat.id, "B", 2000, sort_order=1)
    m3 = await _create_menu(db_session, STORE_ID, cat.id, "C", 3000, sort_order=2)
    await db_session.commit()

    # Reorder: C, A, B
    resp = await client.put(
        "/api/menus/order",
        json={"menu_ids": [str(m3.id), str(m1.id), str(m2.id)]},
        headers={"Authorization": f"Bearer {_admin_token()}"},
    )
    assert resp.status_code == 200

    # Verify new order
    resp2 = await client.get(
        "/api/menus/",
        headers={"Authorization": f"Bearer {_admin_token()}"},
    )
    data = resp2.json()["data"]
    names = [d["name"] for d in data]
    assert names == ["C", "A", "B"]
