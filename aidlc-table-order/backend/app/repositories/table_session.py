"""TableSession repository."""

from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from cores.db.models.enums import SessionStatus
from cores.db.models.table_session import TableSession


class TableSessionRepository:

    @staticmethod
    async def get_active_session(
        db: AsyncSession, table_id: str
    ) -> TableSession | None:
        stmt = select(TableSession).where(
            TableSession.table_id == UUID(table_id),
            TableSession.status == SessionStatus.active,
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    @staticmethod
    async def close_session(db: AsyncSession, session: TableSession) -> None:
        session.status = SessionStatus.completed
        session.completed_at = datetime.now(timezone.utc)
        await db.flush()

    @staticmethod
    async def create_session(
        db: AsyncSession, table_id: str, store_id: str
    ) -> TableSession:
        session = TableSession(
            table_id=UUID(table_id),
            store_id=UUID(store_id),
            status=SessionStatus.active,
        )
        db.add(session)
        await db.flush()
        await db.refresh(session)
        return session
