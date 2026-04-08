"""Category model."""

import uuid
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from cores.db.models.base import Base

if TYPE_CHECKING:
    from cores.db.models.menu import Menu
    from cores.db.models.store import Store


class Category(Base):
    """Category (카테고리) model."""

    __tablename__ = "categories"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    store_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("stores.id"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(50), nullable=False)
    sort_order: Mapped[int] = mapped_column(nullable=False, default=0)

    # Relationships
    store: Mapped["Store"] = relationship(back_populates="categories")
    menus: Mapped[list["Menu"]] = relationship(back_populates="category", lazy="selectin")
