"""Admin repository."""

from datetime import datetime, timedelta, timezone
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from cores.db.models.admin import Admin


class AdminRepository:

    @staticmethod
    async def get_by_credentials(
        db: AsyncSession, store_id: str, username: str
    ) -> Admin | None:
        stmt = select(Admin).where(
            Admin.store_id == UUID(store_id),
            Admin.username == username,
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    @staticmethod
    async def increment_login_attempts(db: AsyncSession, admin: Admin) -> None:
        admin.login_attempts += 1
        await db.flush()

    @staticmethod
    async def reset_login_attempts(db: AsyncSession, admin: Admin) -> None:
        admin.login_attempts = 0
        admin.locked_until = None
        await db.flush()

    @staticmethod
    async def lock_account(db: AsyncSession, admin: Admin, minutes: int) -> None:
        admin.locked_until = datetime.now(timezone.utc) + timedelta(minutes=minutes)
        await db.flush()
