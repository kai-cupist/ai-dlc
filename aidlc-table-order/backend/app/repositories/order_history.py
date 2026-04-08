"""OrderHistory repository."""

import uuid as uuid_mod

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from cores.db.models.order_history import OrderHistory


def _to_uuid(val: str | uuid_mod.UUID) -> uuid_mod.UUID:
    if isinstance(val, uuid_mod.UUID):
        return val
    return uuid_mod.UUID(val)


class OrderHistoryRepository:
    @staticmethod
    async def find_by_store(db: AsyncSession, store_id: str) -> list[OrderHistory]:
        result = await db.execute(
            select(OrderHistory)
            .where(OrderHistory.store_id == _to_uuid(store_id))
            .order_by(OrderHistory.archived_at.desc())
        )
        return list(result.scalars().all())

    @staticmethod
    async def find_co_ordered_menu_ids(
        db: AsyncSession, menu_ids: list[str], store_id: str
    ) -> list[tuple[str, int]]:
        """Find menu IDs that were co-ordered with the given menu_ids.

        Returns list of (menu_id, count) sorted by count desc.
        """
        histories = await db.execute(
            select(OrderHistory).where(OrderHistory.store_id == _to_uuid(store_id))
        )
        all_histories = list(histories.scalars().all())

        co_order_counts: dict[str, int] = {}
        menu_id_set = set(menu_ids)

        for oh in all_histories:
            snapshot = oh.items_snapshot
            if not snapshot or "items" not in snapshot:
                continue
            items = snapshot["items"]
            item_menu_ids = {item.get("menu_id") for item in items if item.get("menu_id")}

            # Check if any of our cart menu_ids are in this order
            if not item_menu_ids.intersection(menu_id_set):
                continue

            # Count co-ordered menus (excluding cart items)
            for mid in item_menu_ids:
                if mid not in menu_id_set:
                    co_order_counts[mid] = co_order_counts.get(mid, 0) + 1

        # Sort by count descending
        sorted_items = sorted(co_order_counts.items(), key=lambda x: x[1], reverse=True)
        return sorted_items
