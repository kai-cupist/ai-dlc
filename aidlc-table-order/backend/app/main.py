"""FastAPI application entry point with middleware stack and health check."""

import time
import uuid
from contextlib import asynccontextmanager
from collections.abc import AsyncGenerator

import structlog
from fastapi import FastAPI, Request, Response, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address
from sqlalchemy import text
from starlette.middleware.base import BaseHTTPMiddleware

from app.dto import ErrorDetail, ErrorResponse
from cores.config import settings
from cores.db.session import async_session_factory, engine
from cores.logging import get_logger, setup_logging

logger = get_logger(__name__)

# Rate limiter setup
limiter = Limiter(key_func=get_remote_address)


# ---------------------------------------------------------------------------
# Lifespan
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan context manager for startup/shutdown."""
    setup_logging(settings.LOG_LEVEL)
    logger.info("Application starting up", version="0.1.0")
    yield
    await engine.dispose()
    logger.info("Application shut down")


# ---------------------------------------------------------------------------
# App instance
# ---------------------------------------------------------------------------
app = FastAPI(
    title="테이블오더 API",
    version="0.1.0",
    lifespan=lifespan,
)

app.state.limiter = limiter


# ---------------------------------------------------------------------------
# Middleware Stack (order matters: first added = outermost)
# Execution order: CORS -> SecurityHeaders -> RequestLogger -> RateLimit -> GlobalErrorHandler
# FastAPI applies middleware in reverse registration order (last added runs first),
# so we register in reverse: ErrorHandler first, then RateLimit, Logger, SecurityHeaders, CORS.
# ---------------------------------------------------------------------------


# --- 5. GlobalErrorHandler (exception handlers) ---
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    """Handle Pydantic validation errors -> 422."""
    error_response = ErrorResponse(
        error=ErrorDetail(
            code="VALIDATION_ERROR",
            message="Request validation failed",
            details={"errors": exc.errors()},
        )
    )
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=error_response.model_dump(),
    )


from fastapi import HTTPException


@app.exception_handler(HTTPException)
async def http_exception_handler(
    request: Request, exc: HTTPException
) -> JSONResponse:
    """Handle HTTPException -> appropriate status code."""
    error_response = ErrorResponse(
        error=ErrorDetail(
            code="HTTP_ERROR",
            message=str(exc.detail),
        )
    )
    return JSONResponse(
        status_code=exc.status_code,
        content=error_response.model_dump(),
    )


@app.exception_handler(Exception)
async def generic_exception_handler(
    request: Request, exc: Exception
) -> JSONResponse:
    """Handle unhandled exceptions -> 500."""
    logger.error("Unhandled exception", exc_info=exc, path=str(request.url))
    error_response = ErrorResponse(
        error=ErrorDetail(
            code="INTERNAL_ERROR",
            message="An unexpected error occurred",
        )
    )
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=error_response.model_dump(),
    )


# --- 4. RateLimitMiddleware (slowapi) ---
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


# --- 3. RequestLoggerMiddleware ---
class RequestLoggerMiddleware(BaseHTTPMiddleware):
    """Log every request with method, path, status, duration, and request_id."""

    async def dispatch(self, request: Request, call_next) -> Response:  # type: ignore[override]
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id

        structlog.contextvars.clear_contextvars()
        structlog.contextvars.bind_contextvars(request_id=request_id)

        start_time = time.perf_counter()
        response = await call_next(request)
        duration_ms = round((time.perf_counter() - start_time) * 1000, 2)

        log_level = "warning" if duration_ms > 500 else "info"
        getattr(logger, log_level)(
            "Request completed",
            method=request.method,
            path=str(request.url.path),
            status_code=response.status_code,
            duration_ms=duration_ms,
            request_id=request_id,
        )

        response.headers["X-Request-ID"] = request_id
        return response


# --- 2. SecurityHeadersMiddleware ---
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Inject security headers per P-SEC-05."""

    async def dispatch(self, request: Request, call_next) -> Response:  # type: ignore[override]
        response = await call_next(request)
        response.headers["Content-Security-Policy"] = "default-src 'self'"
        response.headers["Strict-Transport-Security"] = (
            "max-age=31536000; includeSubDomains"
        )
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        return response


# Register middleware in reverse order so execution order is:
# CORS -> SecurityHeaders -> RequestLogger -> (RateLimit via exception handler)
app.add_middleware(RequestLoggerMiddleware)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Health Check
# ---------------------------------------------------------------------------
@app.get("/api/health", tags=["health"])
async def health_check() -> dict:
    """Health check endpoint — verifies DB connectivity."""
    try:
        async with async_session_factory() as session:
            await session.execute(text("SELECT 1"))
        return {"status": "healthy", "db": "connected"}
    except Exception:
        return JSONResponse(  # type: ignore[return-value]
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"status": "unhealthy", "db": "disconnected"},
        )


# ---------------------------------------------------------------------------
# Router Includes (uncomment as routers are implemented)
# ---------------------------------------------------------------------------
from app.routers import auth, stores, tables
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(stores.router, prefix="/api/stores", tags=["stores"])
app.include_router(tables.router, prefix="/api/tables", tags=["tables"])
from app.routers import menus, option_groups, orders, recommendations
app.include_router(menus.router, prefix="/api/menus", tags=["menus"])
app.include_router(option_groups.router, prefix="/api/option-groups", tags=["option-groups"])
app.include_router(orders.router, prefix="/api/orders", tags=["orders"])
app.include_router(recommendations.router, prefix="/api/recommendations", tags=["recommendations"])
