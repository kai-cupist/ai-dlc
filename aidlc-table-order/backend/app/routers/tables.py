"""Tables router — C3: Table management endpoints."""

from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.dto import ApiResponse
from app.dto.table import OrderHistoryItem, TableCompleteResponse, TableResponse
from app.services.table import TableService
from cores.db.session import get_db_session
from cores.security.deps import get_current_user, require_admin
from cores.security.jwt import TokenPayload

router = APIRouter()


@router.get("/", response_model=ApiResponse[list[TableResponse]])
async def list_tables(
    current_user: TokenPayload = Depends(require_admin),
    db: AsyncSession = Depends(get_db_session),
) -> ApiResponse[list[TableResponse]]:
    """List all tables with session info. Requires admin role."""
    result = await TableService.get_tables(db, current_user.store_id)
    return ApiResponse(data=result)


@router.post("/{table_id}/complete", response_model=ApiResponse[TableCompleteResponse])
async def complete_table_session(
    table_id: str,
    current_user: TokenPayload = Depends(require_admin),
    db: AsyncSession = Depends(get_db_session),
) -> ApiResponse[TableCompleteResponse]:
    """Complete a table session — archive orders and close. Requires admin role."""
    result = await TableService.complete_table_session(
        db, table_id, current_user.store_id
    )
    return ApiResponse(data=result)


@router.get("/{table_id}/history", response_model=ApiResponse[list[OrderHistoryItem]])
async def get_order_history(
    table_id: str,
    date_from: date | None = Query(None),
    date_to: date | None = Query(None),
    current_user: TokenPayload = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> ApiResponse[list[OrderHistoryItem]]:
    """Get order history for a table. Any authenticated user."""
    result = await TableService.get_order_history(db, table_id, date_from, date_to)
    return ApiResponse(data=result)
