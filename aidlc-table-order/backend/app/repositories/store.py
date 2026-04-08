"""Store repository."""

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from cores.db.models.store import Store


class StoreRepository:

    @staticmethod
    async def find_by_id(db: AsyncSession, store_id: str) -> Store | None:
        stmt = select(Store).where(Store.id == UUID(store_id))
        result = await db.execute(stmt)
        return result.scalar_one_or_none()
