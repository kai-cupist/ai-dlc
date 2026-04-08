"""Menu service — C4: Menu + OptionGroup business logic."""

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.dto.menu import (
    CategoryResponse,
    MenuCreateRequest,
    MenuDetailResponse,
    MenuResponse,
    MenuUpdateRequest,
    OptionGroupResponse,
    OptionItemResponse,
)
from app.dto.option_group import (
    OptionGroupCreateRequest,
    OptionGroupListResponse,
    OptionGroupUpdateRequest,
)
from app.repositories.category import CategoryRepository
from app.repositories.menu import MenuRepository
from app.repositories.option_group import OptionGroupRepository


class MenuService:
    @staticmethod
    async def get_categories(
        db: AsyncSession, store_id: str
    ) -> list[CategoryResponse]:
        cats = await CategoryRepository.find_by_store(db, store_id)
        return [
            CategoryResponse(
                id=str(c.id),
                name=c.name,
                sort_order=c.sort_order,
            )
            for c in cats
        ]

    @staticmethod
    async def get_menus_by_store(
        db: AsyncSession, store_id: str, category_id: str | None = None
    ) -> list[MenuResponse]:
        menus = await MenuRepository.find_by_store(db, store_id, category_id)
        return [
            MenuResponse(
                id=str(m.id),
                name=m.name,
                price=m.price,
                description=m.description,
                image_url=m.image_url,
                sort_order=m.sort_order,
                is_popular=m.is_popular,
                is_available=m.is_available,
                category_id=str(m.category_id),
            )
            for m in menus
        ]

    @staticmethod
    async def get_menu_detail(
        db: AsyncSession, menu_id: str
    ) -> MenuDetailResponse:
        menu = await MenuRepository.find_by_id_with_options(db, menu_id)
        if not menu:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Menu not found",
            )
        option_groups = []
        for mog in menu.menu_option_groups:
            og = mog.option_group
            items = [
                OptionItemResponse(
                    id=str(oi.id),
                    name=oi.name,
                    extra_price=oi.extra_price,
                    sort_order=oi.sort_order,
                )
                for oi in sorted(og.option_items, key=lambda x: x.sort_order)
            ]
            option_groups.append(
                OptionGroupResponse(
                    id=str(og.id),
                    name=og.name,
                    is_required=og.is_required,
                    items=items,
                )
            )
        return MenuDetailResponse(
            id=str(menu.id),
            name=menu.name,
            price=menu.price,
            description=menu.description,
            image_url=menu.image_url,
            sort_order=menu.sort_order,
            is_popular=menu.is_popular,
            is_available=menu.is_available,
            category_id=str(menu.category_id),
            option_groups=option_groups,
        )

    @staticmethod
    async def create_menu(
        db: AsyncSession, store_id: str, data: MenuCreateRequest
    ) -> MenuResponse:
        menu = await MenuRepository.create(db, store_id, data.model_dump())
        return MenuResponse(
            id=str(menu.id),
            name=menu.name,
            price=menu.price,
            description=menu.description,
            image_url=menu.image_url,
            sort_order=menu.sort_order,
            is_popular=menu.is_popular,
            is_available=menu.is_available,
            category_id=str(menu.category_id),
        )

    @staticmethod
    async def update_menu(
        db: AsyncSession, menu_id: str, store_id: str, data: MenuUpdateRequest
    ) -> MenuResponse:
        menu = await MenuRepository.find_by_id(db, menu_id)
        if not menu:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Menu not found",
            )
        update_data = {k: v for k, v in data.model_dump().items() if v is not None}
        menu = await MenuRepository.update(db, menu, update_data)
        return MenuResponse(
            id=str(menu.id),
            name=menu.name,
            price=menu.price,
            description=menu.description,
            image_url=menu.image_url,
            sort_order=menu.sort_order,
            is_popular=menu.is_popular,
            is_available=menu.is_available,
            category_id=str(menu.category_id),
        )

    @staticmethod
    async def delete_menu(
        db: AsyncSession, menu_id: str, store_id: str
    ) -> None:
        menu = await MenuRepository.find_by_id(db, menu_id)
        if not menu:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Menu not found",
            )
        await MenuRepository.delete(db, menu)

    @staticmethod
    async def reorder_menus(
        db: AsyncSession, store_id: str, menu_ids: list[str]
    ) -> None:
        await MenuRepository.update_sort_orders(db, menu_ids)

    # --- OptionGroup methods ---

    @staticmethod
    async def get_option_groups(
        db: AsyncSession, store_id: str
    ) -> list[OptionGroupListResponse]:
        groups = await OptionGroupRepository.find_by_store(db, store_id)
        return [
            OptionGroupListResponse(
                id=str(g.id),
                name=g.name,
                is_required=g.is_required,
                items=[
                    OptionItemResponse(
                        id=str(oi.id),
                        name=oi.name,
                        extra_price=oi.extra_price,
                        sort_order=oi.sort_order,
                    )
                    for oi in sorted(g.option_items, key=lambda x: x.sort_order)
                ],
            )
            for g in groups
        ]

    @staticmethod
    async def create_option_group(
        db: AsyncSession, store_id: str, data: OptionGroupCreateRequest
    ) -> OptionGroupListResponse:
        items_data = [item.model_dump() for item in data.items]
        group = await OptionGroupRepository.create(
            db, store_id, data.name, data.is_required, items_data
        )
        return OptionGroupListResponse(
            id=str(group.id),
            name=group.name,
            is_required=group.is_required,
            items=[
                OptionItemResponse(
                    id=str(oi.id),
                    name=oi.name,
                    extra_price=oi.extra_price,
                    sort_order=oi.sort_order,
                )
                for oi in sorted(group.option_items, key=lambda x: x.sort_order)
            ],
        )

    @staticmethod
    async def update_option_group(
        db: AsyncSession, group_id: str, store_id: str, data: OptionGroupUpdateRequest
    ) -> OptionGroupListResponse:
        group = await OptionGroupRepository.find_by_id(db, group_id)
        if not group:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Option group not found",
            )
        items_data = [item.model_dump() for item in data.items] if data.items is not None else None
        group = await OptionGroupRepository.update(
            db, group, data.name, data.is_required, items_data
        )
        return OptionGroupListResponse(
            id=str(group.id),
            name=group.name,
            is_required=group.is_required,
            items=[
                OptionItemResponse(
                    id=str(oi.id),
                    name=oi.name,
                    extra_price=oi.extra_price,
                    sort_order=oi.sort_order,
                )
                for oi in sorted(group.option_items, key=lambda x: x.sort_order)
            ],
        )

    @staticmethod
    async def delete_option_group(
        db: AsyncSession, group_id: str, store_id: str
    ) -> None:
        group = await OptionGroupRepository.find_by_id(db, group_id)
        if not group:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Option group not found",
            )
        await OptionGroupRepository.delete(db, group)

    @staticmethod
    async def link_option_to_menu(
        db: AsyncSession, group_id: str, menu_id: str, store_id: str
    ) -> None:
        await OptionGroupRepository.link_to_menu(db, group_id, menu_id)

    @staticmethod
    async def unlink_option_from_menu(
        db: AsyncSession, group_id: str, menu_id: str, store_id: str
    ) -> None:
        await OptionGroupRepository.unlink_from_menu(db, group_id, menu_id)
