"""Order service — C5: Order business logic."""

import uuid as uuid_mod
from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload


def _to_uuid(val: str | uuid_mod.UUID) -> uuid_mod.UUID:
    if isinstance(val, uuid_mod.UUID):
        return val
    return uuid_mod.UUID(val)

from app.dto.order import (
    OrderItemOptionResponse,
    OrderItemRequest,
    OrderItemResponse,
    OrderResponse,
    PollingOrderPreview,
    PollingResponse,
    PollingTableInfo,
    ReceiptResponse,
    ReceiptRound,
)
from app.repositories.order import OrderRepository
from cores.db.models.enums import OrderStatus, SessionStatus
from cores.db.models.menu import Menu
from cores.db.models.menu_option_group import MenuOptionGroup
from cores.db.models.option_item import OptionItem
from cores.db.models.order import Order
from cores.db.models.table import Table
from cores.db.models.table_session import TableSession

ALLOWED_TRANSITIONS = {
    OrderStatus.pending: OrderStatus.preparing,
    OrderStatus.preparing: OrderStatus.completed,
}


def _order_to_response(order: Order) -> OrderResponse:
    items = []
    for oi in order.order_items:
        options = [
            OrderItemOptionResponse(
                option_group_name=opt.option_group_name,
                option_item_name=opt.option_item_name,
                extra_price=opt.extra_price,
            )
            for opt in oi.order_item_options
        ]
        items.append(
            OrderItemResponse(
                id=str(oi.id),
                menu_name=oi.menu_name,
                quantity=oi.quantity,
                unit_price=oi.unit_price,
                option_total_price=oi.option_total_price,
                subtotal=oi.subtotal,
                options=options,
            )
        )
    return OrderResponse(
        id=str(order.id),
        order_number=order.order_number,
        round=order.round,
        status=order.status.value,
        total_amount=order.total_amount,
        created_at=order.created_at,
        items=items,
    )


class OrderService:
    @staticmethod
    async def create_order(
        db: AsyncSession,
        table_id: str,
        store_id: str,
        items: list[OrderItemRequest],
    ) -> OrderResponse:
        if not items:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="At least one item is required",
            )

        # Get or create active session
        session = await OrderRepository.get_or_create_session(db, table_id, store_id)

        # Calculate round
        round_num = await OrderRepository.get_next_round(db, str(session.id))

        # Generate order number
        order_number = await OrderRepository.get_next_order_number(db, store_id)

        total_amount = 0
        items_data = []

        for item_req in items:
            # Validate menu
            result = await db.execute(
                select(Menu)
                .where(Menu.id == _to_uuid(item_req.menu_id))
                .options(
                    selectinload(Menu.menu_option_groups)
                    .selectinload(MenuOptionGroup.option_group)
                )
            )
            menu = result.scalar_one_or_none()
            if not menu:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Menu {item_req.menu_id} not found",
                )
            if not menu.is_available:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Menu '{menu.name}' is not available",
                )

            # Build set of valid option item IDs for this menu
            menu_option_group_map: dict[str, object] = {}  # og_id -> OptionGroup
            valid_option_item_ids: set[str] = set()
            for mog in menu.menu_option_groups:
                og = mog.option_group
                menu_option_group_map[str(og.id)] = og
                for oi in og.option_items:
                    valid_option_item_ids.add(str(oi.id))

            # Validate options
            selected_option_group_ids: set[str] = set()
            option_extra_total = 0
            option_snapshots = []

            for opt_req in item_req.options:
                # Find the option item
                oi_result = await db.execute(
                    select(OptionItem).where(OptionItem.id == _to_uuid(opt_req.option_item_id))
                )
                option_item = oi_result.scalar_one_or_none()
                if not option_item:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Option item {opt_req.option_item_id} not found",
                    )
                if str(option_item.id) not in valid_option_item_ids:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Option item '{option_item.name}' is not linked to menu '{menu.name}'",
                    )

                # Find the option group for this item
                og_id = str(option_item.option_group_id)
                selected_option_group_ids.add(og_id)
                option_extra_total += option_item.extra_price

                og = menu_option_group_map[og_id]
                option_snapshots.append({
                    "option_group_name": og.name,
                    "option_item_name": option_item.name,
                    "extra_price": option_item.extra_price,
                })

            # Check required option groups
            for og_id, og in menu_option_group_map.items():
                if og.is_required and og_id not in selected_option_group_ids:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Required option group '{og.name}' must have at least one selection",
                    )

            # Server-side amount calculation
            subtotal = (menu.price + option_extra_total) * item_req.quantity
            total_amount += subtotal

            items_data.append({
                "menu_id": str(menu.id),
                "menu_name": menu.name,
                "quantity": item_req.quantity,
                "unit_price": menu.price,
                "option_total_price": option_extra_total,
                "subtotal": subtotal,
                "options": option_snapshots,
            })

        order = await OrderRepository.create_order(
            db,
            store_id=store_id,
            table_id=table_id,
            session_id=str(session.id),
            order_number=order_number,
            round_num=round_num,
            total_amount=total_amount,
            items_data=items_data,
        )

        return _order_to_response(order)

    @staticmethod
    async def get_session_orders(
        db: AsyncSession, table_id: str, store_id: str
    ) -> list[OrderResponse]:
        session = await OrderRepository.get_active_session(db, table_id)
        if not session:
            return []
        orders = await OrderRepository.find_by_session(db, str(session.id))
        return [_order_to_response(o) for o in orders]

    @staticmethod
    async def update_order_status(
        db: AsyncSession, order_id: str, store_id: str, new_status: str
    ) -> OrderResponse:
        order = await OrderRepository.find_by_id(db, order_id)
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found",
            )

        try:
            target_status = OrderStatus(new_status)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status: {new_status}",
            )

        allowed_next = ALLOWED_TRANSITIONS.get(order.status)
        if allowed_next != target_status:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot transition from {order.status.value} to {new_status}",
            )

        order = await OrderRepository.update_status(db, order, target_status)
        return _order_to_response(order)

    @staticmethod
    async def delete_order(
        db: AsyncSession, order_id: str, store_id: str
    ) -> None:
        order = await OrderRepository.find_by_id(db, order_id)
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found",
            )
        await OrderRepository.delete(db, order)

    @staticmethod
    async def get_polling_data(
        db: AsyncSession, store_id: str, since: datetime | None = None
    ) -> PollingResponse:
        # Get all active sessions for the store's tables
        result = await db.execute(
            select(TableSession)
            .join(Table, TableSession.table_id == Table.id)
            .where(
                Table.store_id == store_id,
                TableSession.status == SessionStatus.active,
            )
            .options(selectinload(TableSession.table))
        )
        sessions = list(result.scalars().all())

        tables_info = []
        for sess in sessions:
            orders = await OrderRepository.find_by_session(db, str(sess.id))
            total = sum(o.total_amount for o in orders)
            recent = []
            for o in orders[-3:]:
                for oi in o.order_items:
                    recent.append(PollingOrderPreview(
                        menu_name=oi.menu_name, quantity=oi.quantity
                    ))

            has_new = False
            if since:
                has_new = any(
                    o.created_at and o.created_at.replace(tzinfo=timezone.utc) > since.replace(tzinfo=timezone.utc)
                    for o in orders
                )

            tables_info.append(PollingTableInfo(
                table_id=str(sess.table_id),
                table_number=sess.table.table_number,
                total_amount=total,
                recent_orders=recent,
                has_new=has_new,
            ))

        return PollingResponse(
            tables=tables_info,
            polled_at=datetime.now(timezone.utc),
        )

    @staticmethod
    async def get_receipt(
        db: AsyncSession, table_id: str, store_id: str
    ) -> ReceiptResponse:
        session = await OrderRepository.get_active_session(db, table_id)
        if not session:
            return ReceiptResponse(rounds=[], grand_total=0)

        orders = await OrderRepository.find_by_session(db, str(session.id))

        rounds_map: dict[int, list[OrderResponse]] = {}
        grand_total = 0
        for o in orders:
            resp = _order_to_response(o)
            grand_total += o.total_amount
            if o.round not in rounds_map:
                rounds_map[o.round] = []
            rounds_map[o.round].append(resp)

        rounds = [
            ReceiptRound(round=r, orders=ords)
            for r, ords in sorted(rounds_map.items())
        ]

        return ReceiptResponse(rounds=rounds, grand_total=grand_total)

    @staticmethod
    async def archive_orders(
        db: AsyncSession, session_id: str
    ) -> int:
        raise NotImplementedError
