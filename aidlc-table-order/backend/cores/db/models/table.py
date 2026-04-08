"""Table model."""

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from cores.db.models.base import Base

if TYPE_CHECKING:
    from cores.db.models.store import Store
    from cores.db.models.table_session import TableSession


class Table(Base):
    """Table (테이블) model. Note: SQL table name is 'tables' to avoid reserved word."""

    __tablename__ = "tables"
    __table_args__ = (
        UniqueConstraint("store_id", "table_number", name="uq_tables_store_table_number"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    store_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("stores.id"), nullable=False
    )
    table_number: Mapped[int] = mapped_column(nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(nullable=False, server_default=func.now())

    # Relationships
    store: Mapped["Store"] = relationship(back_populates="tables")
    sessions: Mapped[list["TableSession"]] = relationship(back_populates="table", lazy="selectin")
