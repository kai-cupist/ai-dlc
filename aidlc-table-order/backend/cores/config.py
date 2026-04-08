"""Application configuration using Pydantic BaseSettings."""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables or .env file."""

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/tableorder"

    # Security
    SECRET_KEY: str = "change-me-in-production"

    # JWT
    JWT_EXPIRY_HOURS: int = 16

    # AWS
    AWS_S3_BUCKET: str = "table-order-images"
    AWS_REGION: str = "ap-northeast-2"

    # DB Pool
    DB_POOL_SIZE: int = 10
    DB_MAX_OVERFLOW: int = 40

    # CORS
    CORS_ORIGINS: list[str] = []

    # Logging
    LOG_LEVEL: str = "INFO"

    # Popular Menu
    POPULAR_MENU_CACHE_TTL: int = 300
    POPULAR_MENU_TOP_PERCENT: int = 20
    POPULAR_MENU_DAYS: int = 30

    # Login Security
    LOGIN_MAX_ATTEMPTS: int = 5
    LOGIN_LOCKOUT_MINUTES: int = 15

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
