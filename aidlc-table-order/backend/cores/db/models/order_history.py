"""OrderHistory model."""

import uuid
from datetime import datetime

from sqlalchemy import Index, String, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from cores.db.models.base import Base


class OrderHistory(Base):
    """OrderHistory (주문 이력) model with JSONB snapshot."""

    __tablename__ = "order_history"
    __table_args__ = (
        Index("ix_order_history_table_archived", "table_id", "archived_at"),
        Index("ix_order_history_store_archived", "store_id", "archived_at"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    original_order_id: Mapped[uuid.UUID] = mapped_column(nullable=False)
    store_id: Mapped[uuid.UUID] = mapped_column(nullable=False)
    table_id: Mapped[uuid.UUID] = mapped_column(nullable=False)
    session_id: Mapped[uuid.UUID] = mapped_column(nullable=False)
    order_number: Mapped[str] = mapped_column(String(20), nullable=False)
    round: Mapped[int] = mapped_column(nullable=False)
    total_amount: Mapped[int] = mapped_column(nullable=False)
    items_snapshot: Mapped[dict] = mapped_column(JSONB, nullable=False)
    ordered_at: Mapped[datetime] = mapped_column(nullable=False)
    archived_at: Mapped[datetime] = mapped_column(nullable=False, server_default=func.now())
