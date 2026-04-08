"""Recommendation service — C6: Recommendation business logic."""

import random
import uuid as uuid_mod

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dto.recommendation import RecommendationResponse, RecommendedMenu
from app.repositories.order_history import OrderHistoryRepository
from cores.db.models.menu import Menu


def _to_uuid(val: str | uuid_mod.UUID) -> uuid_mod.UUID:
    if isinstance(val, uuid_mod.UUID):
        return val
    return uuid_mod.UUID(val)


class RecommendationService:
    @staticmethod
    async def get_recommendations(
        db: AsyncSession, menu_ids: list[str], store_id: str
    ) -> RecommendationResponse:
        menu_id_set = set(menu_ids)

        # Try history-based recommendations
        co_ordered = await OrderHistoryRepository.find_co_ordered_menu_ids(
            db, menu_ids, store_id
        )

        recommended_menu_ids = [mid for mid, _ in co_ordered[:5]]

        if not recommended_menu_ids:
            # Fallback: random available menus excluding cart items
            result = await db.execute(
                select(Menu).where(
                    Menu.store_id == _to_uuid(store_id),
                    Menu.is_available == True,
                )
            )
            all_menus = list(result.scalars().all())
            candidates = [m for m in all_menus if str(m.id) not in menu_id_set]
            random.shuffle(candidates)
            selected = candidates[:5]
            return RecommendationResponse(
                recommendations=[
                    RecommendedMenu(
                        id=str(m.id),
                        name=m.name,
                        price=m.price,
                        image_url=m.image_url,
                    )
                    for m in selected
                ]
            )

        # Load recommended menu details
        uuid_ids = [_to_uuid(mid) for mid in recommended_menu_ids]
        result = await db.execute(
            select(Menu).where(
                Menu.id.in_(uuid_ids),
                Menu.is_available == True,
            )
        )
        menus = {str(m.id): m for m in result.scalars().all()}

        recommendations = []
        for mid in recommended_menu_ids:
            if mid in menus:
                m = menus[mid]
                recommendations.append(
                    RecommendedMenu(
                        id=str(m.id),
                        name=m.name,
                        price=m.price,
                        image_url=m.image_url,
                    )
                )

        return RecommendationResponse(recommendations=recommendations)
