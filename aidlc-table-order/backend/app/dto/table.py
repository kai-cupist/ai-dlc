"""Table DTOs for request/response models."""

from datetime import datetime

from pydantic import BaseModel


class TableSessionInfo(BaseModel):
    """Active session info embedded in table response."""

    id: str
    status: str
    started_at: datetime
    total_amount: int = 0


class TableResponse(BaseModel):
    """Table info response."""

    id: str
    table_number: int
    session: TableSessionInfo | None = None


class TableCompleteResponse(BaseModel):
    """Table session complete response."""

    message: str
    archived_orders: int


class OrderHistoryItem(BaseModel):
    """Order history item response."""

    id: str
    original_order_id: str
    order_number: str
    round: int
    total_amount: int
    items_snapshot: dict
    ordered_at: datetime
    archived_at: datetime
