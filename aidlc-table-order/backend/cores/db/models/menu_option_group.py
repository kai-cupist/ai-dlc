"""MenuOptionGroup association model."""

import uuid
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from cores.db.models.base import Base

if TYPE_CHECKING:
    from cores.db.models.menu import Menu
    from cores.db.models.option_group import OptionGroup


class MenuOptionGroup(Base):
    """MenuOptionGroup (메뉴-옵션 연결) association model."""

    __tablename__ = "menu_option_groups"
    __table_args__ = (
        UniqueConstraint("menu_id", "option_group_id", name="uq_menu_option_groups_menu_option"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    menu_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("menus.id"), nullable=False
    )
    option_group_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("option_groups.id"), nullable=False
    )

    # Relationships
    menu: Mapped["Menu"] = relationship(back_populates="menu_option_groups")
    option_group: Mapped["OptionGroup"] = relationship(back_populates="menu_option_groups")
