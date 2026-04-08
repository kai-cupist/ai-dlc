"""Auth DTOs for request/response models."""

from pydantic import BaseModel


class AdminLoginRequest(BaseModel):
    """Admin login request."""

    store_id: str
    username: str
    password: str


class TableSetupRequest(BaseModel):
    """Table initial setup request."""

    store_id: str
    table_number: int
    password: str


class TableAutoLoginRequest(BaseModel):
    """Table auto-login request."""

    store_id: str
    table_number: int
    password: str


class TokenRefreshRequest(BaseModel):
    """Token refresh request."""

    refresh_token: str


class AuthResponse(BaseModel):
    """Auth response with tokens."""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"
