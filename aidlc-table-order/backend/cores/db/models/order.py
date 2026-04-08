"""Order model."""

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Enum, ForeignKey, Index, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from cores.db.models.base import Base
from cores.db.models.enums import OrderStatus

if TYPE_CHECKING:
    from cores.db.models.order_item import OrderItem
    from cores.db.models.table_session import TableSession


class Order(Base):
    """Order (주문) model."""

    __tablename__ = "orders"
    __table_args__ = (
        Index("ix_orders_session_round", "session_id", "round"),
        Index("ix_orders_store_updated_at", "store_id", "updated_at"),
        Index("ix_orders_store_created_at", "store_id", "created_at"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    store_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("stores.id"), nullable=False
    )
    table_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("tables.id"), nullable=False
    )
    session_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("table_sessions.id"), nullable=False
    )
    order_number: Mapped[str] = mapped_column(String(20), nullable=False, unique=True)
    round: Mapped[int] = mapped_column(nullable=False)
    status: Mapped[OrderStatus] = mapped_column(
        Enum(OrderStatus, name="order_status"),
        nullable=False,
        default=OrderStatus.pending,
    )
    total_amount: Mapped[int] = mapped_column(nullable=False)
    created_at: Mapped[datetime] = mapped_column(nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        nullable=False, server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    session: Mapped["TableSession"] = relationship(back_populates="orders")
    order_items: Mapped[list["OrderItem"]] = relationship(
        back_populates="order", lazy="selectin", cascade="all, delete-orphan"
    )
