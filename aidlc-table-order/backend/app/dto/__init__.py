"""Generic API response wrappers and common DTOs."""

from typing import Generic, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class ErrorDetail(BaseModel):
    """Error detail structure."""

    code: str
    message: str
    details: dict | None = None


class ApiResponse(BaseModel, Generic[T]):
    """Generic API response wrapper.

    Example:
        {"success": true, "data": {...}, "error": null}
    """

    success: bool = True
    data: T | None = None
    error: ErrorDetail | None = None


class ErrorResponse(BaseModel):
    """Error response wrapper.

    Example:
        {"success": false, "data": null, "error": {"code": "NOT_FOUND", "message": "..."}}
    """

    success: bool = False
    data: None = None
    error: ErrorDetail


class PaginatedData(BaseModel, Generic[T]):
    """Paginated data structure."""

    items: list[T]
    total: int
    page: int
    page_size: int
    total_pages: int


class PaginatedResponse(BaseModel, Generic[T]):
    """Paginated API response wrapper."""

    success: bool = True
    data: PaginatedData[T] | None = None
    error: ErrorDetail | None = None
