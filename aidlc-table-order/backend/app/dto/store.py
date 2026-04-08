"""Store DTOs for request/response models."""

from datetime import datetime

from pydantic import BaseModel


class StoreResponse(BaseModel):
    """Store info response."""

    id: str
    name: str
    default_prep_time_minutes: int
    created_at: datetime
    updated_at: datetime
