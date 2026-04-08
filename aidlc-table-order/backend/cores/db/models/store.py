"""Store model."""

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from cores.db.models.base import Base

if TYPE_CHECKING:
    from cores.db.models.admin import Admin
    from cores.db.models.category import Category
    from cores.db.models.menu import Menu
    from cores.db.models.option_group import OptionGroup
    from cores.db.models.table import Table


class Store(Base):
    """Store (매장) model."""

    __tablename__ = "stores"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    default_prep_time_minutes: Mapped[int] = mapped_column(nullable=False, default=15)
    created_at: Mapped[datetime] = mapped_column(nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        nullable=False, server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    admins: Mapped[list["Admin"]] = relationship(back_populates="store", lazy="selectin")
    tables: Mapped[list["Table"]] = relationship(back_populates="store", lazy="selectin")
    categories: Mapped[list["Category"]] = relationship(back_populates="store", lazy="selectin")
    menus: Mapped[list["Menu"]] = relationship(back_populates="store", lazy="selectin")
    option_groups: Mapped[list["OptionGroup"]] = relationship(
        back_populates="store", lazy="selectin"
    )
