"""Store service — C2: Store info logic."""

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.dto.store import StoreResponse
from app.repositories.store import StoreRepository


class StoreService:

    @staticmethod
    async def get_store(db: AsyncSession, store_id: str) -> StoreResponse:
        store = await StoreRepository.find_by_id(db, store_id)
        if store is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Store not found",
            )
        return StoreResponse(
            id=str(store.id),
            name=store.name,
            default_prep_time_minutes=store.default_prep_time_minutes,
            created_at=store.created_at,
            updated_at=store.updated_at,
        )
