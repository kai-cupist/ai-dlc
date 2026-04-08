"""SQLAlchemy models package. Import all models here so Alembic can discover them."""

from cores.db.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from cores.db.models.enums import OrderStatus, SessionStatus, UserRole
from cores.db.models.store import Store
from cores.db.models.admin import Admin
from cores.db.models.table import Table
from cores.db.models.table_session import TableSession
from cores.db.models.category import Category
from cores.db.models.menu import Menu
from cores.db.models.option_group import OptionGroup
from cores.db.models.option_item import OptionItem
from cores.db.models.menu_option_group import MenuOptionGroup
from cores.db.models.order import Order
from cores.db.models.order_item import OrderItem
from cores.db.models.order_item_option import OrderItemOption
from cores.db.models.order_history import OrderHistory

__all__ = [
    "Base",
    "TimestampMixin",
    "UUIDPrimaryKeyMixin",
    "OrderStatus",
    "SessionStatus",
    "UserRole",
    "Store",
    "Admin",
    "Table",
    "TableSession",
    "Category",
    "Menu",
    "OptionGroup",
    "OptionItem",
    "MenuOptionGroup",
    "Order",
    "OrderItem",
    "OrderItemOption",
    "OrderHistory",
]
