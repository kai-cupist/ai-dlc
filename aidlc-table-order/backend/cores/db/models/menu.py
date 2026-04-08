"""Menu model."""

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Index, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from cores.db.models.base import Base

if TYPE_CHECKING:
    from cores.db.models.category import Category
    from cores.db.models.menu_option_group import MenuOptionGroup
    from cores.db.models.store import Store


class Menu(Base):
    """Menu (메뉴) model."""

    __tablename__ = "menus"
    __table_args__ = (
        Index("ix_menus_store_category_sort", "store_id", "category_id", "sort_order"),
        Index("ix_menus_store_is_popular", "store_id", "is_popular"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    store_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("stores.id"), nullable=False
    )
    category_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("categories.id"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    price: Mapped[int] = mapped_column(nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    sort_order: Mapped[int] = mapped_column(nullable=False, default=0)
    is_popular: Mapped[bool] = mapped_column(nullable=False, default=False)
    is_available: Mapped[bool] = mapped_column(nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        nullable=False, server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    store: Mapped["Store"] = relationship(back_populates="menus")
    category: Mapped["Category"] = relationship(back_populates="menus")
    menu_option_groups: Mapped[list["MenuOptionGroup"]] = relationship(
        back_populates="menu", lazy="selectin", cascade="all, delete-orphan"
    )
