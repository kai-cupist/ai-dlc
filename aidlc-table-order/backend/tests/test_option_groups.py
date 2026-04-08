"""Tests for OptionGroup endpoints (C4)."""

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


STORE_ID = str(uuid.uuid4())
ADMIN_ID = str(uuid.uuid4())


def _admin_token(store_id: str = STORE_ID) -> str:
    return create_access_token(subject=ADMIN_ID, role=UserRole.admin, store_id=store_id)


async def _create_store(db: AsyncSession, store_id: str = STORE_ID) -> Store:
    store = Store(id=uuid.UUID(store_id), name="Test Store")
    db.add(store)
    await db.flush()
    return store


async def _create_option_group(
    db: AsyncSession, store_id: str = STORE_ID, name: str = "Size", is_required: bool = False
) -> OptionGroup:
    og = OptionGroup(id=uuid.uuid4(), store_id=uuid.UUID(store_id), name=name, is_required=is_required)
    db.add(og)
    await db.flush()
    return og


async def _create_option_item(
    db: AsyncSession, group_id: uuid.UUID, name: str = "Large", extra_price: int = 2000
) -> OptionItem:
    oi = OptionItem(id=uuid.uuid4(), option_group_id=group_id, name=name, extra_price=extra_price)
    db.add(oi)
    await db.flush()
    return oi


async def _create_menu(db: AsyncSession, store_id: str = STORE_ID) -> Menu:
    cat = Category(id=uuid.uuid4(), store_id=uuid.UUID(store_id), name="Main", sort_order=0)
    db.add(cat)
    await db.flush()
    menu = Menu(
        id=uuid.uuid4(),
        store_id=uuid.UUID(store_id),
        category_id=cat.id,
        name="Burger",
        price=10000,
        sort_order=0,
    )
    db.add(menu)
    await db.flush()
    return menu


@pytest.mark.anyio
async def test_list_option_groups(client: AsyncClient, db_session: AsyncSession):
    await _create_store(db_session)
    og = await _create_option_group(db_session, name="Size")
    await _create_option_item(db_session, og.id, "Small", 0)
    await _create_option_item(db_session, og.id, "Large", 2000)
    await db_session.commit()

    resp = await client.get(
        "/api/option-groups/",
        headers={"Authorization": f"Bearer {_admin_token()}"},
    )
    assert resp.status_code == 200
    data = resp.json()["data"]
    assert len(data) == 1
    assert data[0]["name"] == "Size"
    assert len(data[0]["items"]) == 2


@pytest.mark.anyio
async def test_create_option_group_with_items(client: AsyncClient, db_session: AsyncSession):
    await _create_store(db_session)
    await db_session.commit()

    resp = await client.post(
        "/api/option-groups/",
        json={
            "name": "Sauce",
            "is_required": False,
            "items": [
                {"name": "Ketchup", "extra_price": 0, "sort_order": 0},
                {"name": "Mayo", "extra_price": 500, "sort_order": 1},
            ],
        },
        headers={"Authorization": f"Bearer {_admin_token()}"},
    )
    assert resp.status_code == 200
    data = resp.json()["data"]
    assert data["name"] == "Sauce"
    assert len(data["items"]) == 2


@pytest.mark.anyio
async def test_update_option_group(client: AsyncClient, db_session: AsyncSession):
    await _create_store(db_session)
    og = await _create_option_group(db_session, name="Old Name")
    await _create_option_item(db_session, og.id, "Item1", 100)
    await db_session.commit()

    resp = await client.put(
        f"/api/option-groups/{og.id}",
        json={"name": "New Name", "items": [{"name": "NewItem", "extra_price": 500}]},
        headers={"Authorization": f"Bearer {_admin_token()}"},
    )
    assert resp.status_code == 200
    data = resp.json()["data"]
    assert data["name"] == "New Name"
    assert len(data["items"]) == 1
    assert data["items"][0]["name"] == "NewItem"


@pytest.mark.anyio
async def test_delete_option_group(client: AsyncClient, db_session: AsyncSession):
    await _create_store(db_session)
    og = await _create_option_group(db_session, name="ToDelete")
    await db_session.commit()

    resp = await client.delete(
        f"/api/option-groups/{og.id}",
        headers={"Authorization": f"Bearer {_admin_token()}"},
    )
    assert resp.status_code == 200

    # Verify gone
    resp2 = await client.get(
        "/api/option-groups/",
        headers={"Authorization": f"Bearer {_admin_token()}"},
    )
    assert len(resp2.json()["data"]) == 0


@pytest.mark.anyio
async def test_link_option_to_menu(client: AsyncClient, db_session: AsyncSession):
    await _create_store(db_session)
    og = await _create_option_group(db_session)
    menu = await _create_menu(db_session)
    await db_session.commit()

    resp = await client.post(
        f"/api/option-groups/{og.id}/menus/{menu.id}",
        headers={"Authorization": f"Bearer {_admin_token()}"},
    )
    assert resp.status_code == 200


@pytest.mark.anyio
async def test_unlink_option_from_menu(client: AsyncClient, db_session: AsyncSession):
    await _create_store(db_session)
    og = await _create_option_group(db_session)
    menu = await _create_menu(db_session)
    mog = MenuOptionGroup(id=uuid.uuid4(), menu_id=menu.id, option_group_id=og.id)
    db_session.add(mog)
    await db_session.commit()

    resp = await client.delete(
        f"/api/option-groups/{og.id}/menus/{menu.id}",
        headers={"Authorization": f"Bearer {_admin_token()}"},
    )
    assert resp.status_code == 200


@pytest.mark.anyio
async def test_duplicate_link_rejected(client: AsyncClient, db_session: AsyncSession):
    await _create_store(db_session)
    og = await _create_option_group(db_session)
    menu = await _create_menu(db_session)
    mog = MenuOptionGroup(id=uuid.uuid4(), menu_id=menu.id, option_group_id=og.id)
    db_session.add(mog)
    await db_session.commit()

    resp = await client.post(
        f"/api/option-groups/{og.id}/menus/{menu.id}",
        headers={"Authorization": f"Bearer {_admin_token()}"},
    )
    assert resp.status_code == 409
