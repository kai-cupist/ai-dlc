"""Stores router — C2: Store info endpoints."""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.dto import ApiResponse
from app.dto.store import StoreResponse
from app.services.store import StoreService
from cores.db.session import get_db_session
from cores.security.deps import get_current_user
from cores.security.jwt import TokenPayload

router = APIRouter()


@router.get("/{store_id}", response_model=ApiResponse[StoreResponse])
async def get_store(
    store_id: str,
    current_user: TokenPayload = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> ApiResponse[StoreResponse]:
    """Get store info by ID. Requires any authenticated user."""
    result = await StoreService.get_store(db, store_id)
    return ApiResponse(data=result)
