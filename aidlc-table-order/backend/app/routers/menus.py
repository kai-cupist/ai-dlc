"""Menu router — C4: Menu endpoints."""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.dto import ApiResponse
from app.dto.menu import (
    CategoryResponse,
    MenuCreateRequest,
    MenuDetailResponse,
    MenuReorderRequest,
    MenuResponse,
    MenuUpdateRequest,
)
from app.services.menu import MenuService
from cores.db.session import get_db_session
from cores.security.deps import get_current_user, require_admin
from cores.security.jwt import TokenPayload

router = APIRouter()


@router.get("/categories", response_model=ApiResponse[list[CategoryResponse]])
async def list_categories(
    current_user: TokenPayload = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> ApiResponse[list[CategoryResponse]]:
    """List categories for the store."""
    result = await MenuService.get_categories(db, current_user.store_id)
    return ApiResponse(data=result)


@router.get("/", response_model=ApiResponse[list[MenuResponse]])
async def list_menus(
    category_id: str | None = None,
    current_user: TokenPayload = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> ApiResponse[list[MenuResponse]]:
    """List menus by category (popular first)."""
    result = await MenuService.get_menus_by_store(
        db, current_user.store_id, category_id
    )
    return ApiResponse(data=result)


@router.get("/{menu_id}", response_model=ApiResponse[MenuDetailResponse])
async def get_menu_detail(
    menu_id: str,
    current_user: TokenPayload = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> ApiResponse[MenuDetailResponse]:
    """Get menu detail with option groups."""
    result = await MenuService.get_menu_detail(db, menu_id)
    return ApiResponse(data=result)


@router.post("/", response_model=ApiResponse[MenuResponse])
async def create_menu(
    body: MenuCreateRequest,
    current_user: TokenPayload = Depends(require_admin),
    db: AsyncSession = Depends(get_db_session),
) -> ApiResponse[MenuResponse]:
    """Create a new menu (admin only)."""
    result = await MenuService.create_menu(db, current_user.store_id, body)
    return ApiResponse(data=result)


@router.put("/{menu_id}", response_model=ApiResponse[MenuResponse])
async def update_menu(
    menu_id: str,
    body: MenuUpdateRequest,
    current_user: TokenPayload = Depends(require_admin),
    db: AsyncSession = Depends(get_db_session),
) -> ApiResponse[MenuResponse]:
    """Update a menu (admin only)."""
    result = await MenuService.update_menu(
        db, menu_id, current_user.store_id, body
    )
    return ApiResponse(data=result)


@router.delete("/{menu_id}", response_model=ApiResponse[dict])
async def delete_menu(
    menu_id: str,
    current_user: TokenPayload = Depends(require_admin),
    db: AsyncSession = Depends(get_db_session),
) -> ApiResponse[dict]:
    """Delete a menu (admin only)."""
    await MenuService.delete_menu(db, menu_id, current_user.store_id)
    return ApiResponse(data={"deleted": True})


@router.put("/order", response_model=ApiResponse[dict])
async def reorder_menus(
    body: MenuReorderRequest,
    current_user: TokenPayload = Depends(require_admin),
    db: AsyncSession = Depends(get_db_session),
) -> ApiResponse[dict]:
    """Reorder menus (admin only)."""
    await MenuService.reorder_menus(db, current_user.store_id, body.menu_ids)
    return ApiResponse(data={"reordered": True})
