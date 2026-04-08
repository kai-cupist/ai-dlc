"""Table service — C3: Table management and session lifecycle."""

import json
from datetime import date, datetime, timezone
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dto.table import (
    OrderHistoryItem,
    TableCompleteResponse,
    TableResponse,
    TableSessionInfo,
)
from app.repositories.table import TableRepository
from app.repositories.table_session import TableSessionRepository
from cores.db.models.enums import SessionStatus
from cores.db.models.order import Order
from cores.db.models.order_history import OrderHistory
from cores.db.models.order_item import OrderItem
from cores.db.models.order_item_option import OrderItemOption
from cores.db.models.table_session import TableSession


class TableService:

    @staticmethod
    async def get_tables(
        db: AsyncSession, store_id: str
    ) -> list[TableResponse]:
        tables = await TableRepository.find_by_store(db, store_id)
        result = []
        for t in tables:
            session_info = None
            # Find active session for this table
            active = await TableSessionRepository.get_active_session(db, str(t.id))
            if active:
                # Calculate total amount from orders
                stmt = select(Order).where(Order.session_id == active.id)
                orders_result = await db.execute(stmt)
                orders = orders_result.scalars().all()
                total = sum(o.total_amount for o in orders)
                session_info = TableSessionInfo(
                    id=str(active.id),
                    status=active.status.value,
                    started_at=active.started_at,
                    total_amount=total,
                )
            result.append(
                TableResponse(
                    id=str(t.id),
                    table_number=t.table_number,
                    session=session_info,
                )
            )
        return result

    @staticmethod
    async def complete_table_session(
        db: AsyncSession, table_id: str, store_id: str
    ) -> TableCompleteResponse:
        session = await TableSessionRepository.get_active_session(db, table_id)
        if session is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No active session found",
            )

        # Get all orders for this session
        stmt = select(Order).where(Order.session_id == session.id)
        result = await db.execute(stmt)
        orders = list(result.scalars().all())

        # Archive each order
        for order in orders:
            # Build items snapshot
            items_data = []
            for item in order.order_items:
                options_data = []
                for opt in item.order_item_options:
                    options_data.append({
                        "option_group_name": opt.option_group_name,
                        "option_item_name": opt.option_item_name,
                        "extra_price": opt.extra_price,
                    })
                items_data.append({
                    "menu_name": item.menu_name,
                    "quantity": item.quantity,
                    "unit_price": item.unit_price,
                    "option_total_price": item.option_total_price,
                    "subtotal": item.subtotal,
                    "options": options_data,
                })

            history = OrderHistory(
                original_order_id=order.id,
                store_id=order.store_id,
                table_id=order.table_id,
                session_id=session.id,
                order_number=order.order_number,
                round=order.round,
                total_amount=order.total_amount,
                items_snapshot=items_data,
                ordered_at=order.created_at,
            )
            db.add(history)

        # Delete order item options, order items, then orders
        for order in orders:
            for item in order.order_items:
                await db.execute(
                    delete(OrderItemOption).where(
                        OrderItemOption.order_item_id == item.id
                    )
                )
            await db.execute(
                delete(OrderItem).where(OrderItem.order_id == order.id)
            )
        await db.execute(
            delete(Order).where(Order.session_id == session.id)
        )

        # Close session
        await TableSessionRepository.close_session(db, session)
        await db.flush()

        return TableCompleteResponse(
            message="Session completed successfully",
            archived_orders=len(orders),
        )

    @staticmethod
    async def get_order_history(
        db: AsyncSession,
        table_id: str,
        date_from: date | None,
        date_to: date | None,
    ) -> list[OrderHistoryItem]:
        stmt = select(OrderHistory).where(
            OrderHistory.table_id == UUID(table_id)
        )

        if date_from:
            start = datetime(date_from.year, date_from.month, date_from.day, tzinfo=timezone.utc)
            stmt = stmt.where(OrderHistory.archived_at >= start)

        if date_to:
            end = datetime(date_to.year, date_to.month, date_to.day, 23, 59, 59, tzinfo=timezone.utc)
            stmt = stmt.where(OrderHistory.archived_at <= end)

        stmt = stmt.order_by(OrderHistory.archived_at.desc())
        result = await db.execute(stmt)
        rows = result.scalars().all()

        return [
            OrderHistoryItem(
                id=str(h.id),
                original_order_id=str(h.original_order_id),
                order_number=h.order_number,
                round=h.round,
                total_amount=h.total_amount,
                items_snapshot=h.items_snapshot if isinstance(h.items_snapshot, dict) else {"items": h.items_snapshot},
                ordered_at=h.ordered_at,
                archived_at=h.archived_at,
            )
            for h in rows
        ]
