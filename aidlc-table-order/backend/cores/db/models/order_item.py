"""OrderItem model."""

import uuid
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from cores.db.models.base import Base

if TYPE_CHECKING:
    from cores.db.models.order import Order
    from cores.db.models.order_item_option import OrderItemOption


class OrderItem(Base):
    """OrderItem (주문 항목) model."""

    __tablename__ = "order_items"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    order_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("orders.id"), nullable=False
    )
    menu_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("menus.id"), nullable=False
    )
    menu_name: Mapped[str] = mapped_column(String(100), nullable=False)
    quantity: Mapped[int] = mapped_column(nullable=False)
    unit_price: Mapped[int] = mapped_column(nullable=False)
    option_total_price: Mapped[int] = mapped_column(nullable=False, default=0)
    subtotal: Mapped[int] = mapped_column(nullable=False)

    # Relationships
    order: Mapped["Order"] = relationship(back_populates="order_items")
    order_item_options: Mapped[list["OrderItemOption"]] = relationship(
        back_populates="order_item", lazy="selectin", cascade="all, delete-orphan"
    )
