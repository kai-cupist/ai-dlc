"""OptionItem model."""

import uuid
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from cores.db.models.base import Base

if TYPE_CHECKING:
    from cores.db.models.option_group import OptionGroup


class OptionItem(Base):
    """OptionItem (옵션 항목) model."""

    __tablename__ = "option_items"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    option_group_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("option_groups.id"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(50), nullable=False)
    extra_price: Mapped[int] = mapped_column(nullable=False, default=0)
    sort_order: Mapped[int] = mapped_column(nullable=False, default=0)

    # Relationships
    option_group: Mapped["OptionGroup"] = relationship(back_populates="option_items")
