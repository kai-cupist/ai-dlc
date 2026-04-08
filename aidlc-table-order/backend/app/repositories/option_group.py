"""OptionGroup repository."""

import uuid as uuid_mod

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from cores.db.models.menu_option_group import MenuOptionGroup
from cores.db.models.option_group import OptionGroup
from cores.db.models.option_item import OptionItem


def _to_uuid(val: str | uuid_mod.UUID) -> uuid_mod.UUID:
    if isinstance(val, uuid_mod.UUID):
        return val
    return uuid_mod.UUID(val)


class OptionGroupRepository:
    @staticmethod
    async def find_by_store(db: AsyncSession, store_id: str) -> list[OptionGroup]:
        result = await db.execute(
            select(OptionGroup)
            .where(OptionGroup.store_id == _to_uuid(store_id))
            .options(selectinload(OptionGroup.option_items))
        )
        return list(result.scalars().all())

    @staticmethod
    async def find_by_id(db: AsyncSession, group_id: str) -> OptionGroup | None:
        result = await db.execute(
            select(OptionGroup)
            .where(OptionGroup.id == _to_uuid(group_id))
            .options(selectinload(OptionGroup.option_items))
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def create(
        db: AsyncSession, store_id: str, name: str, is_required: bool, items_data: list[dict]
    ) -> OptionGroup:
        og = OptionGroup(
            id=uuid_mod.uuid4(),
            store_id=_to_uuid(store_id),
            name=name,
            is_required=is_required,
        )
        db.add(og)
        await db.flush()
        for item_data in items_data:
            oi = OptionItem(
                id=uuid_mod.uuid4(),
                option_group_id=og.id,
                **item_data,
            )
            db.add(oi)
        await db.flush()
        return await OptionGroupRepository.find_by_id(db, str(og.id))

    @staticmethod
    async def update(
        db: AsyncSession,
        group: OptionGroup,
        name: str | None,
        is_required: bool | None,
        items_data: list[dict] | None,
    ) -> OptionGroup:
        if name is not None:
            group.name = name
        if is_required is not None:
            group.is_required = is_required
        if items_data is not None:
            for item in list(group.option_items):
                await db.delete(item)
            await db.flush()
            for item_data in items_data:
                oi = OptionItem(
                    id=uuid_mod.uuid4(),
                    option_group_id=group.id,
                    **item_data,
                )
                db.add(oi)
        await db.flush()
        # Expire to force reload of relationships
        await db.refresh(group, ["option_items"])
        return group

    @staticmethod
    async def delete(db: AsyncSession, group: OptionGroup) -> None:
        await db.delete(group)
        await db.flush()

    @staticmethod
    async def link_to_menu(db: AsyncSession, group_id: str, menu_id: str) -> None:
        result = await db.execute(
            select(MenuOptionGroup).where(
                MenuOptionGroup.menu_id == _to_uuid(menu_id),
                MenuOptionGroup.option_group_id == _to_uuid(group_id),
            )
        )
        existing = result.scalar_one_or_none()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Option group already linked to this menu",
            )
        mog = MenuOptionGroup(
            id=uuid_mod.uuid4(),
            menu_id=_to_uuid(menu_id),
            option_group_id=_to_uuid(group_id),
        )
        db.add(mog)
        await db.flush()

    @staticmethod
    async def unlink_from_menu(db: AsyncSession, group_id: str, menu_id: str) -> None:
        result = await db.execute(
            select(MenuOptionGroup).where(
                MenuOptionGroup.menu_id == _to_uuid(menu_id),
                MenuOptionGroup.option_group_id == _to_uuid(group_id),
            )
        )
        mog = result.scalar_one_or_none()
        if mog:
            await db.delete(mog)
            await db.flush()
