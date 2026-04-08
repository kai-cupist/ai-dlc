"""JWT token creation and verification using python-jose with HS256."""

from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt
from pydantic import BaseModel

from cores.config import settings
from cores.db.models.enums import UserRole

ALGORITHM = "HS256"


class TokenPayload(BaseModel):
    """Decoded JWT token payload."""

    sub: str  # subject (admin_id or table_id)
    role: UserRole
    store_id: str
    exp: datetime
    iat: datetime
    token_type: str = "access"


def create_access_token(
    subject: str,
    role: UserRole,
    store_id: str,
    extra_claims: dict | None = None,
    expires_delta: timedelta | None = None,
) -> str:
    """Create an access JWT token.

    Args:
        subject: The user identifier (admin_id or table_id).
        role: The user role (admin or table).
        store_id: The store identifier.
        extra_claims: Optional additional claims to include.
        expires_delta: Optional custom expiration delta.

    Returns:
        Encoded JWT token string.
    """
    now = datetime.now(timezone.utc)
    if expires_delta is None:
        expires_delta = timedelta(hours=settings.JWT_EXPIRY_HOURS)

    payload = {
        "sub": str(subject),
        "role": role.value,
        "store_id": str(store_id),
        "exp": now + expires_delta,
        "iat": now,
        "token_type": "access",
    }
    if extra_claims:
        payload.update(extra_claims)

    return jwt.encode(payload, settings.SECRET_KEY, algorithm=ALGORITHM)


def create_refresh_token(
    subject: str,
    role: UserRole,
    store_id: str,
) -> str:
    """Create a refresh JWT token with a longer expiration (7 days).

    Args:
        subject: The user identifier (admin_id or table_id).
        role: The user role (admin or table).
        store_id: The store identifier.

    Returns:
        Encoded JWT refresh token string.
    """
    now = datetime.now(timezone.utc)
    expires_delta = timedelta(days=7)

    payload = {
        "sub": str(subject),
        "role": role.value,
        "store_id": str(store_id),
        "exp": now + expires_delta,
        "iat": now,
        "token_type": "refresh",
    }

    return jwt.encode(payload, settings.SECRET_KEY, algorithm=ALGORITHM)


def verify_token(token: str) -> TokenPayload:
    """Verify and decode a JWT token.

    Args:
        token: The JWT token string.

    Returns:
        TokenPayload with decoded claims.

    Raises:
        JWTError: If the token is invalid, expired, or has invalid claims.
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        return TokenPayload(
            sub=payload["sub"],
            role=UserRole(payload["role"]),
            store_id=payload["store_id"],
            exp=datetime.fromtimestamp(payload["exp"], tz=timezone.utc),
            iat=datetime.fromtimestamp(payload["iat"], tz=timezone.utc),
            token_type=payload.get("token_type", "access"),
        )
    except (JWTError, KeyError, ValueError) as e:
        raise JWTError(f"Invalid token: {e}") from e
