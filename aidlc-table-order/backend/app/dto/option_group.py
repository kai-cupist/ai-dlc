"""OptionGroup DTOs — request/response models for C4: OptionGroup."""

from pydantic import BaseModel

from app.dto.menu import OptionItemResponse


class OptionItemCreateRequest(BaseModel):
    name: str
    extra_price: int = 0
    sort_order: int = 0


class OptionGroupCreateRequest(BaseModel):
    name: str
    is_required: bool = False
    items: list[OptionItemCreateRequest]


class OptionGroupUpdateRequest(BaseModel):
    name: str | None = None
    is_required: bool | None = None
    items: list[OptionItemCreateRequest] | None = None


class OptionGroupListResponse(BaseModel):
    id: str
    name: str
    is_required: bool
    items: list[OptionItemResponse]
