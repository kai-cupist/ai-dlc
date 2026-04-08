"""Table repository."""

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from cores.db.models.table import Table


class TableRepository:

    @staticmethod
    async def find_by_store(db: AsyncSession, store_id: str) -> list[Table]:
        stmt = select(Table).where(Table.store_id == UUID(store_id)).order_by(Table.table_number)
        result = await db.execute(stmt)
        return list(result.scalars().all())

    @staticmethod
    async def find_by_store_and_number(
        db: AsyncSession, store_id: str, table_number: int
    ) -> Table | None:
        stmt = select(Table).where(
            Table.store_id == UUID(store_id),
            Table.table_number == table_number,
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()
