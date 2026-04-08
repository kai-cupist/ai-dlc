"""Auth service — C1: Authentication logic."""

from datetime import datetime, timezone

from fastapi import HTTPException, status
from jose import JWTError
from sqlalchemy.ext.asyncio import AsyncSession

from app.dto.auth import AuthResponse
from app.repositories.admin import AdminRepository
from app.repositories.table import TableRepository
from cores.config import settings
from cores.db.models.enums import UserRole
from cores.security.jwt import (
    create_access_token,
    create_refresh_token,
    verify_token,
)
from cores.security.password import verify_password


class AuthService:

    @staticmethod
    async def authenticate_admin(
        db: AsyncSession, store_id: str, username: str, password: str
    ) -> AuthResponse:
        admin = await AdminRepository.get_by_credentials(db, store_id, username)
        if admin is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials",
            )

        # Check account lock
        if admin.locked_until and admin.locked_until.replace(
            tzinfo=timezone.utc
        ) > datetime.now(timezone.utc):
            raise HTTPException(
                status_code=423,
                detail="Account is locked. Try again later.",
            )

        # Verify password
        if not verify_password(password, admin.password_hash):
            admin.login_attempts += 1
            if admin.login_attempts >= settings.LOGIN_MAX_ATTEMPTS:
                from datetime import timedelta

                admin.locked_until = datetime.now(timezone.utc) + timedelta(
                    minutes=settings.LOGIN_LOCKOUT_MINUTES
                )
            await db.flush()
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials",
            )

        # Reset login attempts on success
        admin.login_attempts = 0
        admin.locked_until = None
        await db.flush()

        access = create_access_token(
            subject=str(admin.id),
            role=UserRole.admin,
            store_id=store_id,
        )
        refresh = create_refresh_token(
            subject=str(admin.id),
            role=UserRole.admin,
            store_id=store_id,
        )
        return AuthResponse(access_token=access, refresh_token=refresh)

    @staticmethod
    async def authenticate_table(
        db: AsyncSession, store_id: str, table_number: int, password: str
    ) -> AuthResponse:
        table = await TableRepository.find_by_store_and_number(
            db, store_id, table_number
        )
        if table is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Table not found",
            )

        if not verify_password(password, table.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials",
            )

        access = create_access_token(
            subject=str(table.id),
            role=UserRole.table,
            store_id=store_id,
        )
        refresh = create_refresh_token(
            subject=str(table.id),
            role=UserRole.table,
            store_id=store_id,
        )
        return AuthResponse(access_token=access, refresh_token=refresh)

    @staticmethod
    async def refresh_access_token(
        db: AsyncSession, refresh_token: str
    ) -> AuthResponse:
        try:
            payload = verify_token(refresh_token)
        except JWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token",
            )

        if payload.token_type != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type",
            )

        access = create_access_token(
            subject=payload.sub,
            role=payload.role,
            store_id=payload.store_id,
        )
        refresh = create_refresh_token(
            subject=payload.sub,
            role=payload.role,
            store_id=payload.store_id,
        )
        return AuthResponse(access_token=access, refresh_token=refresh)
