"""Shared test fixtures for pytest.

Uses SQLite + aiosqlite for in-memory test DB (no Docker required).
"""

import uuid
from collections.abc import AsyncGenerator

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from cores.db.models import Base
from cores.db.models.enums import UserRole
from cores.security.jwt import create_access_token


# ---------------------------------------------------------------------------
# Test database engine (SQLite in-memory)
# ---------------------------------------------------------------------------
TEST_DATABASE_URL = "sqlite+aiosqlite://"

test_engine = create_async_engine(
    TEST_DATABASE_URL,
    echo=False,
)

TestSessionFactory = async_sessionmaker(
    test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------
@pytest.fixture(autouse=True)
async def setup_database() -> AsyncGenerator[None, None]:
    """Create all tables before each test and drop them after."""
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest.fixture
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """Yield an async database session for tests."""
    async with TestSessionFactory() as session:
        yield session


@pytest.fixture
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """Yield an httpx AsyncClient wired to the FastAPI app.

    Overrides the get_db_session dependency to use the test session.
    """
    from app.main import app
    from cores.db.session import get_db_session

    async def override_get_db_session() -> AsyncGenerator[AsyncSession, None]:
        yield db_session

    app.dependency_overrides[get_db_session] = override_get_db_session

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

    app.dependency_overrides.clear()


@pytest.fixture
def admin_token() -> str:
    """Pre-generated JWT token with role=admin for testing."""
    return create_access_token(
        subject=str(uuid.uuid4()),
        role=UserRole.admin,
        store_id=str(uuid.uuid4()),
    )


@pytest.fixture
def table_token() -> str:
    """Pre-generated JWT token with role=table for testing."""
    return create_access_token(
        subject=str(uuid.uuid4()),
        role=UserRole.table,
        store_id=str(uuid.uuid4()),
    )
