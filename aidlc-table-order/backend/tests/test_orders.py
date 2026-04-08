"""Tests for Order endpoints (C5)."""

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
from cores.db.models.table import Table
from cores.db.models.table_session import TableSession
from cores.db.models.enums import SessionStatus, UserRole
from cores.security.jwt import create_access_token


STORE_ID = str(uuid.uuid4())
TABLE_UUID = uuid.uuid4()
TABLE_ID = str(TABLE_UUID)
ADMIN_ID = str(uuid.uuid4())


def _admin_token(store_id: str = STORE_ID) -> str:
    return create_access_token(subject=ADMIN_ID, role=UserRole.admin, store_id=store_id)


def _table_token(table_id: str = TABLE_ID, store_id: str = STORE_ID) -> str:
    return create_access_token(subject=table_id, role=UserRole.table, store_id=store_id)


async def _seed_store_and_table(db: AsyncSession) -> tuple[Store, Table]:
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
    return store, table


async def _create_menu_with_options(
    db: AsyncSession,
    name: str = "Burger",
    price: int = 10000,
    is_available: bool = True,
    required_option: bool = False,
) -> tuple[Menu, OptionGroup | None, OptionItem | None]:
    cat_id = uuid.uuid4()
    cat = Category(id=cat_id, store_id=uuid.UUID(STORE_ID), name="Main", sort_order=0)
    db.add(cat)
    await db.flush()

    menu = Menu(
        id=uuid.uuid4(),
        store_id=uuid.UUID(STORE_ID),
        category_id=cat_id,
        name=name,
        price=price,
        sort_order=0,
        is_available=is_available,
    )
    db.add(menu)
    await db.flush()

    og = None
    oi = None
    if required_option:
        og = OptionGroup(
            id=uuid.uuid4(),
            store_id=uuid.UUID(STORE_ID),
            name="Size",
            is_required=True,
        )
        db.add(og)
        await db.flush()
        oi = OptionItem(
            id=uuid.uuid4(), option_group_id=og.id, name="Large", extra_price=2000
        )
        db.add(oi)
        await db.flush()
        mog = MenuOptionGroup(id=uuid.uuid4(), menu_id=menu.id, option_group_id=og.id)
        db.add(mog)
        await db.flush()

    return menu, og, oi


@pytest.mark.anyio
async def test_create_order_success(client: AsyncClient, db_session: AsyncSession):
    await _seed_store_and_table(db_session)
    menu, _, _ = await _create_menu_with_options(db_session, "Burger", 10000)
    await db_session.commit()

    resp = await client.post(
        "/api/orders/",
        json={"items": [{"menu_id": str(menu.id), "quantity": 2}]},
        headers={"Authorization": f"Bearer {_table_token()}"},
    )
    assert resp.status_code == 200
    data = resp.json()["data"]
    assert data["round"] == 1
    assert data["total_amount"] == 20000
    assert data["status"] == "pending"
    # Order number format: YYYYMMDD-NNNN
    assert "-" in data["order_number"]
    assert len(data["order_number"].split("-")[1]) == 4


@pytest.mark.anyio
async def test_create_order_auto_creates_session(client: AsyncClient, db_session: AsyncSession):
    """No active session -> auto-created."""
    await _seed_store_and_table(db_session)
    menu, _, _ = await _create_menu_with_options(db_session, "Burger", 10000)
    await db_session.commit()

    resp = await client.post(
        "/api/orders/",
        json={"items": [{"menu_id": str(menu.id), "quantity": 1}]},
        headers={"Authorization": f"Bearer {_table_token()}"},
    )
    assert resp.status_code == 200
    assert resp.json()["data"]["round"] == 1


@pytest.mark.anyio
async def test_create_order_second_round(client: AsyncClient, db_session: AsyncSession):
    await _seed_store_and_table(db_session)
    menu, _, _ = await _create_menu_with_options(db_session, "Burger", 10000)
    await db_session.commit()

    # First order
    resp1 = await client.post(
        "/api/orders/",
        json={"items": [{"menu_id": str(menu.id), "quantity": 1}]},
        headers={"Authorization": f"Bearer {_table_token()}"},
    )
    assert resp1.json()["data"]["round"] == 1

    # Second order
    resp2 = await client.post(
        "/api/orders/",
        json={"items": [{"menu_id": str(menu.id), "quantity": 1}]},
        headers={"Authorization": f"Bearer {_table_token()}"},
    )
    assert resp2.json()["data"]["round"] == 2


@pytest.mark.anyio
async def test_create_order_unavailable_menu(client: AsyncClient, db_session: AsyncSession):
    await _seed_store_and_table(db_session)
    menu, _, _ = await _create_menu_with_options(
        db_session, "Unavailable", 5000, is_available=False
    )
    await db_session.commit()

    resp = await client.post(
        "/api/orders/",
        json={"items": [{"menu_id": str(menu.id), "quantity": 1}]},
        headers={"Authorization": f"Bearer {_table_token()}"},
    )
    assert resp.status_code == 400


@pytest.mark.anyio
async def test_create_order_required_option_missing(client: AsyncClient, db_session: AsyncSession):
    await _seed_store_and_table(db_session)
    menu, og, oi = await _create_menu_with_options(
        db_session, "Burger", 10000, required_option=True
    )
    await db_session.commit()

    # No options provided for a required group
    resp = await client.post(
        "/api/orders/",
        json={"items": [{"menu_id": str(menu.id), "quantity": 1}]},
        headers={"Authorization": f"Bearer {_table_token()}"},
    )
    assert resp.status_code == 400


@pytest.mark.anyio
async def test_create_order_invalid_option(client: AsyncClient, db_session: AsyncSession):
    await _seed_store_and_table(db_session)
    menu, _, _ = await _create_menu_with_options(db_session, "Burger", 10000)
    # Create an unrelated option item
    og2 = OptionGroup(id=uuid.uuid4(), store_id=uuid.UUID(STORE_ID), name="Other")
    db_session.add(og2)
    await db_session.flush()
    oi2 = OptionItem(id=uuid.uuid4(), option_group_id=og2.id, name="Fake", extra_price=999)
    db_session.add(oi2)
    await db_session.commit()

    resp = await client.post(
        "/api/orders/",
        json={
            "items": [
                {
                    "menu_id": str(menu.id),
                    "quantity": 1,
                    "options": [{"option_item_id": str(oi2.id)}],
                }
            ]
        },
        headers={"Authorization": f"Bearer {_table_token()}"},
    )
    assert resp.status_code == 400


@pytest.mark.anyio
async def test_create_order_server_calculates_amount(client: AsyncClient, db_session: AsyncSession):
    await _seed_store_and_table(db_session)
    menu, og, oi = await _create_menu_with_options(
        db_session, "Burger", 10000, required_option=True
    )
    await db_session.commit()

    resp = await client.post(
        "/api/orders/",
        json={
            "items": [
                {
                    "menu_id": str(menu.id),
                    "quantity": 2,
                    "options": [{"option_item_id": str(oi.id)}],
                }
            ]
        },
        headers={"Authorization": f"Bearer {_table_token()}"},
    )
    assert resp.status_code == 200
    data = resp.json()["data"]
    # (10000 + 2000) * 2 = 24000
    assert data["total_amount"] == 24000
    assert data["items"][0]["unit_price"] == 10000
    assert data["items"][0]["option_total_price"] == 2000
    assert data["items"][0]["subtotal"] == 24000


@pytest.mark.anyio
async def test_list_session_orders(client: AsyncClient, db_session: AsyncSession):
    await _seed_store_and_table(db_session)
    menu, _, _ = await _create_menu_with_options(db_session, "Burger", 10000)
    await db_session.commit()

    # Create two orders
    await client.post(
        "/api/orders/",
        json={"items": [{"menu_id": str(menu.id), "quantity": 1}]},
        headers={"Authorization": f"Bearer {_table_token()}"},
    )
    await client.post(
        "/api/orders/",
        json={"items": [{"menu_id": str(menu.id), "quantity": 2}]},
        headers={"Authorization": f"Bearer {_table_token()}"},
    )

    resp = await client.get(
        "/api/orders/",
        headers={"Authorization": f"Bearer {_table_token()}"},
    )
    assert resp.status_code == 200
    data = resp.json()["data"]
    assert len(data) == 2


@pytest.mark.anyio
async def test_update_order_status_pending_to_preparing(
    client: AsyncClient, db_session: AsyncSession
):
    await _seed_store_and_table(db_session)
    menu, _, _ = await _create_menu_with_options(db_session, "Burger", 10000)
    await db_session.commit()

    create_resp = await client.post(
        "/api/orders/",
        json={"items": [{"menu_id": str(menu.id), "quantity": 1}]},
        headers={"Authorization": f"Bearer {_table_token()}"},
    )
    order_id = create_resp.json()["data"]["id"]

    resp = await client.patch(
        f"/api/orders/{order_id}/status",
        json={"status": "preparing"},
        headers={"Authorization": f"Bearer {_admin_token()}"},
    )
    assert resp.status_code == 200
    assert resp.json()["data"]["status"] == "preparing"


@pytest.mark.anyio
async def test_update_order_status_skip_not_allowed(
    client: AsyncClient, db_session: AsyncSession
):
    """pending -> completed is not allowed (skip)."""
    await _seed_store_and_table(db_session)
    menu, _, _ = await _create_menu_with_options(db_session, "Burger", 10000)
    await db_session.commit()

    create_resp = await client.post(
        "/api/orders/",
        json={"items": [{"menu_id": str(menu.id), "quantity": 1}]},
        headers={"Authorization": f"Bearer {_table_token()}"},
    )
    order_id = create_resp.json()["data"]["id"]

    resp = await client.patch(
        f"/api/orders/{order_id}/status",
        json={"status": "completed"},
        headers={"Authorization": f"Bearer {_admin_token()}"},
    )
    assert resp.status_code == 400


@pytest.mark.anyio
async def test_update_order_status_reverse_not_allowed(
    client: AsyncClient, db_session: AsyncSession
):
    """preparing -> pending is not allowed (reverse)."""
    await _seed_store_and_table(db_session)
    menu, _, _ = await _create_menu_with_options(db_session, "Burger", 10000)
    await db_session.commit()

    create_resp = await client.post(
        "/api/orders/",
        json={"items": [{"menu_id": str(menu.id), "quantity": 1}]},
        headers={"Authorization": f"Bearer {_table_token()}"},
    )
    order_id = create_resp.json()["data"]["id"]

    # pending -> preparing
    await client.patch(
        f"/api/orders/{order_id}/status",
        json={"status": "preparing"},
        headers={"Authorization": f"Bearer {_admin_token()}"},
    )

    # preparing -> pending (should fail)
    resp = await client.patch(
        f"/api/orders/{order_id}/status",
        json={"status": "pending"},
        headers={"Authorization": f"Bearer {_admin_token()}"},
    )
    assert resp.status_code == 400


@pytest.mark.anyio
async def test_delete_order(client: AsyncClient, db_session: AsyncSession):
    await _seed_store_and_table(db_session)
    menu, _, _ = await _create_menu_with_options(db_session, "Burger", 10000)
    await db_session.commit()

    create_resp = await client.post(
        "/api/orders/",
        json={"items": [{"menu_id": str(menu.id), "quantity": 1}]},
        headers={"Authorization": f"Bearer {_table_token()}"},
    )
    order_id = create_resp.json()["data"]["id"]

    resp = await client.delete(
        f"/api/orders/{order_id}",
        headers={"Authorization": f"Bearer {_admin_token()}"},
    )
    assert resp.status_code == 200


@pytest.mark.anyio
async def test_get_receipt(client: AsyncClient, db_session: AsyncSession):
    await _seed_store_and_table(db_session)
    menu, _, _ = await _create_menu_with_options(db_session, "Burger", 10000)
    await db_session.commit()

    # Create two orders (two rounds)
    await client.post(
        "/api/orders/",
        json={"items": [{"menu_id": str(menu.id), "quantity": 1}]},
        headers={"Authorization": f"Bearer {_table_token()}"},
    )
    await client.post(
        "/api/orders/",
        json={"items": [{"menu_id": str(menu.id), "quantity": 2}]},
        headers={"Authorization": f"Bearer {_table_token()}"},
    )

    resp = await client.get(
        "/api/orders/receipt",
        headers={"Authorization": f"Bearer {_table_token()}"},
    )
    assert resp.status_code == 200
    data = resp.json()["data"]
    assert len(data["rounds"]) == 2
    assert data["grand_total"] == 30000  # 10000 + 20000
