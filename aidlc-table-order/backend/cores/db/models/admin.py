"""Admin model."""

import uuid
from datetime import datetime

from sqlalchemy import ForeignKey, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from cores.db.models.base import Base

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from cores.db.models.store import Store


class Admin(Base):
    """Admin (관리자) model."""

    __tablename__ = "admins"
    __table_args__ = (
        UniqueConstraint("store_id", "username", name="uq_admins_store_username"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    store_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("stores.id"), nullable=False
    )
    username: Mapped[str] = mapped_column(String(50), nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    login_attempts: Mapped[int] = mapped_column(nullable=False, default=0)
    locked_until: Mapped[datetime | None] = mapped_column(nullable=True)
    created_at: Mapped[datetime] = mapped_column(nullable=False, server_default=func.now())

    # Relationships
    store: Mapped["Store"] = relationship(back_populates="admins")
