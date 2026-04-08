"""TableSession model."""

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Enum, ForeignKey, Index, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from cores.db.models.base import Base
from cores.db.models.enums import SessionStatus

if TYPE_CHECKING:
    from cores.db.models.order import Order
    from cores.db.models.table import Table


class TableSession(Base):
    """TableSession (테이블 세션) model."""

    __tablename__ = "table_sessions"
    __table_args__ = (
        Index("ix_table_sessions_table_status", "table_id", "status"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    table_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("tables.id"), nullable=False
    )
    store_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("stores.id"), nullable=False
    )
    status: Mapped[SessionStatus] = mapped_column(
        Enum(SessionStatus, name="session_status"),
        nullable=False,
        default=SessionStatus.active,
    )
    started_at: Mapped[datetime] = mapped_column(nullable=False, server_default=func.now())
    completed_at: Mapped[datetime | None] = mapped_column(nullable=True)

    # Relationships
    table: Mapped["Table"] = relationship(back_populates="sessions")
    orders: Mapped[list["Order"]] = relationship(back_populates="session", lazy="selectin")
