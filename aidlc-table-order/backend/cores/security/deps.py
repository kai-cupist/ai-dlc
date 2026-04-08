"""FastAPI dependency functions for authentication and authorization."""

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError

from cores.db.models.enums import UserRole
from cores.security.jwt import TokenPayload, verify_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/admin/login")


async def get_current_user(
    token: str = Depends(oauth2_scheme),
) -> TokenPayload:
    """Verify JWT token and return the decoded payload.

    Args:
        token: The Bearer token extracted from the Authorization header.

    Returns:
        TokenPayload with the decoded JWT claims.

    Raises:
        HTTPException: 401 if the token is invalid or expired.
    """
    try:
        payload = verify_token(token)
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return payload


async def require_admin(
    current_user: TokenPayload = Depends(get_current_user),
) -> TokenPayload:
    """Require that the current user has the admin role.

    Args:
        current_user: The decoded JWT payload from get_current_user.

    Returns:
        TokenPayload if the user is an admin.

    Raises:
        HTTPException: 403 if the user is not an admin.
    """
    if current_user.role != UserRole.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return current_user


async def require_table(
    current_user: TokenPayload = Depends(get_current_user),
) -> TokenPayload:
    """Require that the current user has the table role.

    Args:
        current_user: The decoded JWT payload from get_current_user.

    Returns:
        TokenPayload if the user is a table.

    Raises:
        HTTPException: 403 if the user is not a table.
    """
    if current_user.role != UserRole.table:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Table access required",
        )
    return current_user
