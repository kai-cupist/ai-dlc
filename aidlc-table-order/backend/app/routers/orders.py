"""Order router — C5: Order endpoints."""

from datetime import datetime

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.dto import ApiResponse
from app.dto.order import (
    OrderCreateRequest,
    OrderResponse,
    OrderStatusUpdateRequest,
    PollingResponse,
    ReceiptResponse,
)
from app.services.order import OrderService
from cores.db.session import get_db_session
from cores.security.deps import get_current_user, require_admin, require_table
from cores.security.jwt import TokenPayload

router = APIRouter()


@router.post("/", response_model=ApiResponse[OrderResponse])
async def create_order(
    body: OrderCreateRequest,
    current_user: TokenPayload = Depends(require_table),
    db: AsyncSession = Depends(get_db_session),
) -> ApiResponse[OrderResponse]:
    """Create a new order (table only)."""
    result = await OrderService.create_order(
        db,
        table_id=current_user.sub,
        store_id=current_user.store_id,
        items=body.items,
    )
    return ApiResponse(data=result)


@router.get("/", response_model=ApiResponse[list[OrderResponse]])
async def list_session_orders(
    current_user: TokenPayload = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> ApiResponse[list[OrderResponse]]:
    """List orders for current session."""
    result = await OrderService.get_session_orders(
        db,
        table_id=current_user.sub,
        store_id=current_user.store_id,
    )
    return ApiResponse(data=result)


@router.patch("/{order_id}/status", response_model=ApiResponse[OrderResponse])
async def update_order_status(
    order_id: str,
    body: OrderStatusUpdateRequest,
    current_user: TokenPayload = Depends(require_admin),
    db: AsyncSession = Depends(get_db_session),
) -> ApiResponse[OrderResponse]:
    """Update order status (admin only)."""
    result = await OrderService.update_order_status(
        db, order_id, current_user.store_id, body.status
    )
    return ApiResponse(data=result)


@router.delete("/{order_id}", response_model=ApiResponse[dict])
async def delete_order(
    order_id: str,
    current_user: TokenPayload = Depends(require_admin),
    db: AsyncSession = Depends(get_db_session),
) -> ApiResponse[dict]:
    """Delete an order (admin only)."""
    await OrderService.delete_order(db, order_id, current_user.store_id)
    return ApiResponse(data={"deleted": True})


@router.get("/polling", response_model=ApiResponse[PollingResponse])
async def get_polling_data(
    since: datetime | None = Query(None),
    current_user: TokenPayload = Depends(require_admin),
    db: AsyncSession = Depends(get_db_session),
) -> ApiResponse[PollingResponse]:
    """Get polling data for admin dashboard."""
    result = await OrderService.get_polling_data(
        db, current_user.store_id, since
    )
    return ApiResponse(data=result)


@router.get("/receipt", response_model=ApiResponse[ReceiptResponse])
async def get_receipt(
    current_user: TokenPayload = Depends(require_table),
    db: AsyncSession = Depends(get_db_session),
) -> ApiResponse[ReceiptResponse]:
    """Get receipt for current session (table only)."""
    result = await OrderService.get_receipt(
        db,
        table_id=current_user.sub,
        store_id=current_user.store_id,
    )
    return ApiResponse(data=result)
