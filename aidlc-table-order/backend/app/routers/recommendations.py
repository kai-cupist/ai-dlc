"""Recommendation router — C6: Recommendation endpoints."""

from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.dto import ApiResponse
from app.dto.recommendation import RecommendationRequest, RecommendationResponse
from app.services.recommendation import RecommendationService
from cores.db.session import get_db_session
from cores.security.deps import require_table
from cores.security.jwt import TokenPayload

router = APIRouter()


@router.post("/", response_model=ApiResponse[RecommendationResponse])
async def get_recommendations(
    body: RecommendationRequest,
    request: Request,
    current_user: TokenPayload = Depends(require_table),
    db: AsyncSession = Depends(get_db_session),
) -> ApiResponse[RecommendationResponse]:
    """Get menu recommendations based on cart items (table only)."""
    result = await RecommendationService.get_recommendations(
        db, body.menu_ids, current_user.store_id
    )
    return ApiResponse(data=result)
