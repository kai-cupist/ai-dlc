"""Menu repository."""

import uuid as uuid_mod

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from cores.db.models.menu import Menu
from cores.db.models.menu_option_group import MenuOptionGroup


def _to_uuid(val: str | uuid_mod.UUID) -> uuid_mod.UUID:
    if isinstance(val, uuid_mod.UUID):
        return val
    return uuid_mod.UUID(val)


class MenuRepository:
    @staticmethod
    async def find_by_store(
        db: AsyncSession, store_id: str, category_id: str | None = None
    ) -> list[Menu]:
        stmt = select(Menu).where(Menu.store_id == _to_uuid(store_id))
        if category_id:
            stmt = stmt.where(Menu.category_id == _to_uuid(category_id))
        stmt = stmt.order_by(Menu.is_popular.desc(), Menu.sort_order)
        result = await db.execute(stmt)
        return list(result.scalars().all())

    @staticmethod
    async def find_by_id(db: AsyncSession, menu_id: str) -> Menu | None:
        result = await db.execute(select(Menu).where(Menu.id == _to_uuid(menu_id)))
        return result.scalar_one_or_none()

    @staticmethod
    async def find_by_id_with_options(db: AsyncSession, menu_id: str) -> Menu | None:
        result = await db.execute(
            select(Menu)
            .where(Menu.id == _to_uuid(menu_id))
            .options(
                selectinload(Menu.menu_option_groups)
                .selectinload(MenuOptionGroup.option_group)
            )
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def create(db: AsyncSession, store_id: str, data: dict) -> Menu:
        create_data = dict(data)
        if "category_id" in create_data:
            create_data["category_id"] = _to_uuid(create_data["category_id"])
        menu = Menu(
            id=uuid_mod.uuid4(),
            store_id=_to_uuid(store_id),
            **create_data,
        )
        db.add(menu)
        await db.flush()
        return menu

    @staticmethod
    async def update(db: AsyncSession, menu: Menu, data: dict) -> Menu:
        for key, value in data.items():
            if value is not None:
                if key == "category_id":
                    value = _to_uuid(value)
                setattr(menu, key, value)
        await db.flush()
        return menu

    @staticmethod
    async def delete(db: AsyncSession, menu: Menu) -> None:
        await db.delete(menu)
        await db.flush()

    @staticmethod
    async def update_sort_orders(db: AsyncSession, menu_ids: list[str]) -> None:
        for idx, menu_id in enumerate(menu_ids):
            result = await db.execute(select(Menu).where(Menu.id == _to_uuid(menu_id)))
            menu = result.scalar_one_or_none()
            if menu:
                menu.sort_order = idx
        await db.flush()
