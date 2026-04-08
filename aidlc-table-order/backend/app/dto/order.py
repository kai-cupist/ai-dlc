"""Order DTOs — request/response models for C5: Order."""

from datetime import datetime

from pydantic import BaseModel


class OrderItemOptionRequest(BaseModel):
    option_item_id: str


class OrderItemRequest(BaseModel):
    menu_id: str
    quantity: int
    options: list[OrderItemOptionRequest] = []


class OrderCreateRequest(BaseModel):
    items: list[OrderItemRequest]


class OrderItemOptionResponse(BaseModel):
    option_group_name: str
    option_item_name: str
    extra_price: int


class OrderItemResponse(BaseModel):
    id: str
    menu_name: str
    quantity: int
    unit_price: int
    option_total_price: int
    subtotal: int
    options: list[OrderItemOptionResponse]


class OrderResponse(BaseModel):
    id: str
    order_number: str
    round: int
    status: str
    total_amount: int
    created_at: datetime
    items: list[OrderItemResponse]


class OrderStatusUpdateRequest(BaseModel):
    status: str


class PollingOrderPreview(BaseModel):
    menu_name: str
    quantity: int


class PollingTableInfo(BaseModel):
    table_id: str
    table_number: int
    total_amount: int
    recent_orders: list[PollingOrderPreview]
    has_new: bool


class PollingResponse(BaseModel):
    tables: list[PollingTableInfo]
    polled_at: datetime


class ReceiptRound(BaseModel):
    round: int
    orders: list[OrderResponse]


class ReceiptResponse(BaseModel):
    rounds: list[ReceiptRound]
    grand_total: int
