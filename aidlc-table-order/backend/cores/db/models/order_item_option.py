"""OrderItemOption model."""

import uuid
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from cores.db.models.base import Base

if TYPE_CHECKING:
    from cores.db.models.order_item import OrderItem


class OrderItemOption(Base):
    """OrderItemOption (주문 항목 옵션) model."""

    __tablename__ = "order_item_options"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    order_item_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("order_items.id"), nullable=False
    )
    option_group_name: Mapped[str] = mapped_column(String(50), nullable=False)
    option_item_name: Mapped[str] = mapped_column(String(50), nullable=False)
    extra_price: Mapped[int] = mapped_column(nullable=False)

    # Relationships
    order_item: Mapped["OrderItem"] = relationship(back_populates="order_item_options")
