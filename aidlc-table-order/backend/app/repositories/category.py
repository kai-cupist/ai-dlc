"""Category repository."""

import uuid as uuid_mod

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from cores.db.models.category import Category


def _to_uuid(val: str | uuid_mod.UUID) -> uuid_mod.UUID:
    if isinstance(val, uuid_mod.UUID):
        return val
    return uuid_mod.UUID(val)


class CategoryRepository:
    @staticmethod
    async def find_by_store(db: AsyncSession, store_id: str) -> list[Category]:
        result = await db.execute(
            select(Category)
            .where(Category.store_id == _to_uuid(store_id))
            .order_by(Category.sort_order)
        )
        return list(result.scalars().all())
