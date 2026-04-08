"""Auth router — C1: Authentication endpoints."""

from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.dto import ApiResponse
from app.dto.auth import (
    AdminLoginRequest,
    AuthResponse,
    TableAutoLoginRequest,
    TableSetupRequest,
    TokenRefreshRequest,
)
from app.services.auth import AuthService
from cores.db.session import get_db_session

router = APIRouter()



@router.post("/admin/login", response_model=ApiResponse[AuthResponse])
async def admin_login(
    body: AdminLoginRequest,
    request: Request,
    db: AsyncSession = Depends(get_db_session),
) -> ApiResponse[AuthResponse]:
    """Admin login with store_id, username, password."""
    result = await AuthService.authenticate_admin(
        db, body.store_id, body.username, body.password
    )
    return ApiResponse(data=result)


@router.post("/table/setup", response_model=ApiResponse[AuthResponse])
async def table_setup(
    body: TableSetupRequest,
    request: Request,
    db: AsyncSession = Depends(get_db_session),
) -> ApiResponse[AuthResponse]:
    """Table initial setup — creates credentials and returns tokens."""
    result = await AuthService.authenticate_table(
        db, body.store_id, body.table_number, body.password
    )
    return ApiResponse(data=result)


@router.post("/table/auto-login", response_model=ApiResponse[AuthResponse])
async def table_auto_login(
    body: TableAutoLoginRequest,
    request: Request,
    db: AsyncSession = Depends(get_db_session),
) -> ApiResponse[AuthResponse]:
    """Table auto-login with store_id, table_number, password."""
    result = await AuthService.authenticate_table(
        db, body.store_id, body.table_number, body.password
    )
    return ApiResponse(data=result)


@router.post("/token/refresh", response_model=ApiResponse[AuthResponse])
async def token_refresh(
    body: TokenRefreshRequest,
    db: AsyncSession = Depends(get_db_session),
) -> ApiResponse[AuthResponse]:
    """Refresh access token using refresh token."""
    result = await AuthService.refresh_access_token(db, body.refresh_token)
    return ApiResponse(data=result)
