"""Password hashing and verification using bcrypt directly.

Note: passlib's bcrypt backend has compatibility issues with bcrypt>=4.1,
so we use the bcrypt library directly for reliable operation.
"""

import bcrypt


def hash_password(plain: str) -> str:
    """Hash a plain-text password using bcrypt.

    Args:
        plain: The plain-text password to hash.

    Returns:
        The bcrypt hashed password string.
    """
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(plain.encode("utf-8"), salt)
    return hashed.decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    """Verify a plain-text password against a bcrypt hash.

    Args:
        plain: The plain-text password to verify.
        hashed: The bcrypt hashed password to compare against.

    Returns:
        True if the password matches, False otherwise.
    """
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
