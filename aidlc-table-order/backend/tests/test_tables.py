"""Tests for Table endpoints (C3)."""

import json
import uuid
from datetime import datetime, timezone

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from cores.db.models.enums import OrderStatus, SessionStatus, UserRole
from cores.db.models.order import Order
from cores.db.models.order_history import OrderHistory
from cores.db.models.order_item import OrderItem
from cores.db.models.store import Store
from cores.db.models.table import Table
from cores.db.models.table_session import TableSession
from cores.db.models.menu import Menu
from cores.db.models.category import Category
from cores.security.jwt import create_access_token
from cores.security.password import hash_password


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
async def _setup_store_and_tables(
    db: AsyncSession, num_tables: int = 3
) -> tuple[Store, list[Table]]:
    store = Store(id=uuid.uuid4(), name="Test Store", default_prep_time_minutes=15)
    db.add(store)
    await db.flush()

    tables = []
    for i in range(1, num_tables + 1):
        t = Table(
            id=uuid.uuid4(),
            store_id=store.id,
            table_number=i,
            password_hash=hash_password("pass"),
        )
        db.add(t)
        tables.append(t)

    await db.commit()
    for t in tables:
        await db.refresh(t)
    await db.refresh(store)
    return store, tables


async def _create_session_with_orders(
    db: AsyncSession, store: Store, table: Table, num_orders: int = 2
) -> tuple[TableSession, list[Order]]:
    session = TableSession(
        id=uuid.uuid4(),
        table_id=table.id,
        store_id=store.id,
        status=SessionStatus.active,
    )
    db.add(session)
    await db.flush()

    # Need a category and menu for order_items foreign key
    cat = Category(id=uuid.uuid4(), store_id=store.id, name="Cat", sort_order=0)
    db.add(cat)
    await db.flush()

    menu = Menu(
        id=uuid.uuid4(),
        store_id=store.id,
        category_id=cat.id,
        name="Test Menu",
        price=10000,
        sort_order=0,
        is_available=True,
        is_popular=False,
    )
    db.add(menu)
    await db.flush()

    orders = []
    for i in range(1, num_orders + 1):
        order = Order(
            id=uuid.uuid4(),
            store_id=store.id,
            table_id=table.id,
            session_id=session.id,
            order_number=f"20260408-{i:04d}",
            round=i,
            status=OrderStatus.completed,
            total_amount=10000 * i,
        )
        db.add(order)
        await db.flush()

        item = OrderItem(
            id=uuid.uuid4(),
            order_id=order.id,
            menu_id=menu.id,
            menu_name="Test Menu",
            quantity=i,
            unit_price=10000,
            option_total_price=0,
            subtotal=10000 * i,
        )
        db.add(item)
        orders.append(order)

    await db.commit()
    await db.refresh(session)
    return session, orders


def _admin_token(store_id: str) -> str:
    return create_access_token(
        subject=str(uuid.uuid4()),
        role=UserRole.admin,
        store_id=store_id,
    )


def _table_token(store_id: str) -> str:
    return create_access_token(
        subject=str(uuid.uuid4()),
        role=UserRole.table,
        store_id=store_id,
    )


# ---------------------------------------------------------------------------
# GET /api/tables/
# ---------------------------------------------------------------------------
@pytest.mark.anyio
async def test_list_tables(client: AsyncClient, db_session: AsyncSession):
    store, tables = await _setup_store_and_tables(db_session, 3)
    token = _admin_token(str(store.id))

    resp = await client.get(
        "/api/tables/",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["success"] is True
    assert len(body["data"]) == 3


@pytest.mark.anyio
async def test_list_tables_requires_admin(client: AsyncClient, db_session: AsyncSession):
    store, _ = await _setup_store_and_tables(db_session, 1)
    token = _table_token(str(store.id))

    resp = await client.get(
        "/api/tables/",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 403


# ---------------------------------------------------------------------------
# POST /api/tables/{table_id}/complete
# ---------------------------------------------------------------------------
@pytest.mark.anyio
async def test_complete_session(client: AsyncClient, db_session: AsyncSession):
    store, tables = await _setup_store_and_tables(db_session, 1)
    session, orders = await _create_session_with_orders(db_session, store, tables[0], 2)
    token = _admin_token(str(store.id))

    resp = await client.post(
        f"/api/tables/{tables[0].id}/complete",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["success"] is True
    assert body["data"]["archived_orders"] == 2


@pytest.mark.anyio
async def test_complete_session_no_active_session(
    client: AsyncClient, db_session: AsyncSession
):
    store, tables = await _setup_store_and_tables(db_session, 1)
    token = _admin_token(str(store.id))

    resp = await client.post(
        f"/api/tables/{tables[0].id}/complete",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 404


# ---------------------------------------------------------------------------
# GET /api/tables/{table_id}/history
# ---------------------------------------------------------------------------
@pytest.mark.anyio
async def test_get_order_history(client: AsyncClient, db_session: AsyncSession):
    store, tables = await _setup_store_and_tables(db_session, 1)
    token = _admin_token(str(store.id))

    # Create order history records directly
    now = datetime.now(timezone.utc)
    for i in range(3):
        h = OrderHistory(
            id=uuid.uuid4(),
            original_order_id=uuid.uuid4(),
            store_id=store.id,
            table_id=tables[0].id,
            session_id=uuid.uuid4(),
            order_number=f"20260408-{i + 1:04d}",
            round=i + 1,
            total_amount=10000 * (i + 1),
            items_snapshot={"items": []},
            ordered_at=now,
            archived_at=now,
        )
        db_session.add(h)
    await db_session.commit()

    resp = await client.get(
        f"/api/tables/{tables[0].id}/history",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["success"] is True
    assert len(body["data"]) == 3


@pytest.mark.anyio
async def test_get_order_history_date_filter(
    client: AsyncClient, db_session: AsyncSession
):
    store, tables = await _setup_store_and_tables(db_session, 1)
    token = _admin_token(str(store.id))

    # Create history records with different dates
    dates = [
        datetime(2026, 4, 1, tzinfo=timezone.utc),
        datetime(2026, 4, 5, tzinfo=timezone.utc),
        datetime(2026, 4, 10, tzinfo=timezone.utc),
    ]
    for i, dt in enumerate(dates):
        h = OrderHistory(
            id=uuid.uuid4(),
            original_order_id=uuid.uuid4(),
            store_id=store.id,
            table_id=tables[0].id,
            session_id=uuid.uuid4(),
            order_number=f"20260401-{i + 1:04d}",
            round=i + 1,
            total_amount=10000,
            items_snapshot={"items": []},
            ordered_at=dt,
            archived_at=dt,
        )
        db_session.add(h)
    await db_session.commit()

    # Filter: only April 3 to April 7
    resp = await client.get(
        f"/api/tables/{tables[0].id}/history",
        params={"date_from": "2026-04-03", "date_to": "2026-04-07"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["success"] is True
    assert len(body["data"]) == 1  # Only the April 5th record
