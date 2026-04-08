"""OptionGroup model."""

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from cores.db.models.base import Base

if TYPE_CHECKING:
    from cores.db.models.menu_option_group import MenuOptionGroup
    from cores.db.models.option_item import OptionItem
    from cores.db.models.store import Store


class OptionGroup(Base):
    """OptionGroup (옵션 그룹) model."""

    __tablename__ = "option_groups"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    store_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("stores.id"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(50), nullable=False)
    is_required: Mapped[bool] = mapped_column(nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(nullable=False, server_default=func.now())

    # Relationships
    store: Mapped["Store"] = relationship(back_populates="option_groups")
    option_items: Mapped[list["OptionItem"]] = relationship(
        back_populates="option_group", lazy="selectin", cascade="all, delete-orphan"
    )
    menu_option_groups: Mapped[list["MenuOptionGroup"]] = relationship(
        back_populates="option_group", lazy="selectin", cascade="all, delete-orphan"
    )
