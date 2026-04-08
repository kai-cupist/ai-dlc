"""OptionGroup router — C4: Option Group endpoints."""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.dto import ApiResponse
from app.dto.option_group import (
    OptionGroupCreateRequest,
    OptionGroupListResponse,
    OptionGroupUpdateRequest,
)
from app.services.menu import MenuService
from cores.db.session import get_db_session
from cores.security.deps import require_admin
from cores.security.jwt import TokenPayload

router = APIRouter()


@router.get("/", response_model=ApiResponse[list[OptionGroupListResponse]])
async def list_option_groups(
    current_user: TokenPayload = Depends(require_admin),
    db: AsyncSession = Depends(get_db_session),
) -> ApiResponse[list[OptionGroupListResponse]]:
    """List option groups (admin only)."""
    result = await MenuService.get_option_groups(db, current_user.store_id)
    return ApiResponse(data=result)


@router.post("/", response_model=ApiResponse[OptionGroupListResponse])
async def create_option_group(
    body: OptionGroupCreateRequest,
    current_user: TokenPayload = Depends(require_admin),
    db: AsyncSession = Depends(get_db_session),
) -> ApiResponse[OptionGroupListResponse]:
    """Create an option group with items (admin only)."""
    result = await MenuService.create_option_group(
        db, current_user.store_id, body
    )
    return ApiResponse(data=result)


@router.put("/{group_id}", response_model=ApiResponse[OptionGroupListResponse])
async def update_option_group(
    group_id: str,
    body: OptionGroupUpdateRequest,
    current_user: TokenPayload = Depends(require_admin),
    db: AsyncSession = Depends(get_db_session),
) -> ApiResponse[OptionGroupListResponse]:
    """Update an option group (admin only)."""
    result = await MenuService.update_option_group(
        db, group_id, current_user.store_id, body
    )
    return ApiResponse(data=result)


@router.delete("/{group_id}", response_model=ApiResponse[dict])
async def delete_option_group(
    group_id: str,
    current_user: TokenPayload = Depends(require_admin),
    db: AsyncSession = Depends(get_db_session),
) -> ApiResponse[dict]:
    """Delete an option group (admin only)."""
    await MenuService.delete_option_group(db, group_id, current_user.store_id)
    return ApiResponse(data={"deleted": True})


@router.post("/{group_id}/menus/{menu_id}", response_model=ApiResponse[dict])
async def link_option_to_menu(
    group_id: str,
    menu_id: str,
    current_user: TokenPayload = Depends(require_admin),
    db: AsyncSession = Depends(get_db_session),
) -> ApiResponse[dict]:
    """Link an option group to a menu (admin only)."""
    await MenuService.link_option_to_menu(
        db, group_id, menu_id, current_user.store_id
    )
    return ApiResponse(data={"linked": True})


@router.delete("/{group_id}/menus/{menu_id}", response_model=ApiResponse[dict])
async def unlink_option_from_menu(
    group_id: str,
    menu_id: str,
    current_user: TokenPayload = Depends(require_admin),
    db: AsyncSession = Depends(get_db_session),
) -> ApiResponse[dict]:
    """Unlink an option group from a menu (admin only)."""
    await MenuService.unlink_option_from_menu(
        db, group_id, menu_id, current_user.store_id
    )
    return ApiResponse(data={"unlinked": True})
