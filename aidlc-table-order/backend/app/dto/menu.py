"""Menu DTOs — request/response models for C4: Menu."""

from pydantic import BaseModel


class CategoryResponse(BaseModel):
    id: str
    name: str
    sort_order: int


class MenuResponse(BaseModel):
    id: str
    name: str
    price: int
    description: str | None = None
    image_url: str | None = None
    sort_order: int
    is_popular: bool
    is_available: bool
    category_id: str


class OptionItemResponse(BaseModel):
    id: str
    name: str
    extra_price: int
    sort_order: int


class OptionGroupResponse(BaseModel):
    id: str
    name: str
    is_required: bool
    items: list[OptionItemResponse]


class MenuDetailResponse(BaseModel):
    id: str
    name: str
    price: int
    description: str | None = None
    image_url: str | None = None
    sort_order: int
    is_popular: bool
    is_available: bool
    category_id: str
    option_groups: list[OptionGroupResponse]


class MenuCreateRequest(BaseModel):
    category_id: str
    name: str
    price: int
    description: str | None = None
    image_url: str | None = None
    is_popular: bool = False
    is_available: bool = True


class MenuUpdateRequest(BaseModel):
    category_id: str | None = None
    name: str | None = None
    price: int | None = None
    description: str | None = None
    image_url: str | None = None
    is_popular: bool | None = None
    is_available: bool | None = None


class MenuReorderRequest(BaseModel):
    menu_ids: list[str]
