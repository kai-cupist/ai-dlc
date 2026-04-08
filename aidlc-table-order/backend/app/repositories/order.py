"""Order repository."""

import uuid as uuid_mod
from datetime import date

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from cores.db.models.enums import OrderStatus, SessionStatus
from cores.db.models.order import Order
from cores.db.models.order_item import OrderItem
from cores.db.models.order_item_option import OrderItemOption
from cores.db.models.table_session import TableSession


def _to_uuid(val: str | uuid_mod.UUID) -> uuid_mod.UUID:
    if isinstance(val, uuid_mod.UUID):
        return val
    return uuid_mod.UUID(val)


class OrderRepository:
    @staticmethod
    async def get_or_create_session(
        db: AsyncSession, table_id: str, store_id: str
    ) -> TableSession:
        result = await db.execute(
            select(TableSession).where(
                TableSession.table_id == _to_uuid(table_id),
                TableSession.status == SessionStatus.active,
            )
        )
        session = result.scalar_one_or_none()
        if session:
            return session
        session = TableSession(
            id=uuid_mod.uuid4(),
            table_id=_to_uuid(table_id),
            store_id=_to_uuid(store_id),
            status=SessionStatus.active,
        )
        db.add(session)
        await db.flush()
        return session

    @staticmethod
    async def get_next_round(db: AsyncSession, session_id: str) -> int:
        result = await db.execute(
            select(func.max(Order.round)).where(
                Order.session_id == _to_uuid(session_id)
            )
        )
        max_round = result.scalar()
        return (max_round or 0) + 1

    @staticmethod
    async def get_next_order_number(db: AsyncSession, store_id: str) -> str:
        today = date.today()
        date_prefix = today.strftime("%Y%m%d")
        result = await db.execute(
            select(func.count(Order.id)).where(
                Order.store_id == _to_uuid(store_id),
                Order.order_number.like(f"{date_prefix}-%"),
            )
        )
        count = result.scalar() or 0
        return f"{date_prefix}-{count + 1:04d}"

    @staticmethod
    async def create_order(
        db: AsyncSession,
        store_id: str,
        table_id: str,
        session_id: str,
        order_number: str,
        round_num: int,
        total_amount: int,
        items_data: list[dict],
    ) -> Order:
        order = Order(
            id=uuid_mod.uuid4(),
            store_id=_to_uuid(store_id),
            table_id=_to_uuid(table_id),
            session_id=_to_uuid(session_id),
            order_number=order_number,
            round=round_num,
            status=OrderStatus.pending,
            total_amount=total_amount,
        )
        db.add(order)
        await db.flush()

        for item_data in items_data:
            options_data = item_data.pop("options", [])
            # Convert menu_id to UUID
            if "menu_id" in item_data:
                item_data["menu_id"] = _to_uuid(item_data["menu_id"])
            order_item = OrderItem(
                id=uuid_mod.uuid4(),
                order_id=order.id,
                **item_data,
            )
            db.add(order_item)
            await db.flush()

            for opt_data in options_data:
                order_item_option = OrderItemOption(
                    id=uuid_mod.uuid4(),
                    order_item_id=order_item.id,
                    **opt_data,
                )
                db.add(order_item_option)
            await db.flush()

        # Reload with relationships
        result = await db.execute(
            select(Order)
            .where(Order.id == order.id)
            .options(
                selectinload(Order.order_items).selectinload(OrderItem.order_item_options)
            )
        )
        return result.scalar_one()

    @staticmethod
    async def find_by_session(db: AsyncSession, session_id: str) -> list[Order]:
        result = await db.execute(
            select(Order)
            .where(Order.session_id == _to_uuid(session_id))
            .options(
                selectinload(Order.order_items).selectinload(OrderItem.order_item_options)
            )
            .order_by(Order.round)
        )
        return list(result.scalars().all())

    @staticmethod
    async def find_by_id(db: AsyncSession, order_id: str) -> Order | None:
        result = await db.execute(
            select(Order)
            .where(Order.id == _to_uuid(order_id))
            .options(
                selectinload(Order.order_items).selectinload(OrderItem.order_item_options)
            )
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def update_status(db: AsyncSession, order: Order, new_status: OrderStatus) -> Order:
        order.status = new_status
        await db.flush()
        return order

    @staticmethod
    async def delete(db: AsyncSession, order: Order) -> None:
        await db.delete(order)
        await db.flush()

    @staticmethod
    async def get_active_session(db: AsyncSession, table_id: str) -> TableSession | None:
        result = await db.execute(
            select(TableSession).where(
                TableSession.table_id == _to_uuid(table_id),
                TableSession.status == SessionStatus.active,
            )
        )
        return result.scalar_one_or_none()
