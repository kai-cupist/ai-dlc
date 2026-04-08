"""Enum types for database models."""

import enum


class OrderStatus(str, enum.Enum):
    """Order status enum."""

    pending = "pending"
    preparing = "preparing"
    completed = "completed"


class SessionStatus(str, enum.Enum):
    """Table session status enum."""

    active = "active"
    completed = "completed"


class UserRole(str, enum.Enum):
    """User role enum."""

    admin = "admin"
    table = "table"
