"""Structured logging setup with structlog."""

import logging
import re
import uuid

import structlog

# Patterns to mask in log output
_PII_PATTERNS = [
    (re.compile(r'("password"\s*:\s*)"[^"]*"'), r'\1"***"'),
    (re.compile(r'("password_hash"\s*:\s*)"[^"]*"'), r'\1"***"'),
    (re.compile(r'("token"\s*:\s*)"[^"]*"'), r'\1"***"'),
    (re.compile(r'("access_token"\s*:\s*)"[^"]*"'), r'\1"***"'),
    (re.compile(r'("refresh_token"\s*:\s*)"[^"]*"'), r'\1"***"'),
    (re.compile(r'("secret"\s*:\s*)"[^"]*"'), r'\1"***"'),
    (re.compile(r'("authorization"\s*:\s*)"[^"]*"', re.IGNORECASE), r'\1"***"'),
]


def pii_masking_processor(
    logger: logging.Logger, method_name: str, event_dict: dict
) -> dict:
    """Mask sensitive fields like passwords and tokens in log output."""
    for key, value in list(event_dict.items()):
        if isinstance(value, str):
            for pattern, replacement in _PII_PATTERNS:
                value = pattern.sub(replacement, value)
            event_dict[key] = value
        if key in ("password", "password_hash", "token", "access_token", "refresh_token", "secret"):
            event_dict[key] = "***"
    return event_dict


def generate_request_id() -> str:
    """Generate a unique request ID."""
    return str(uuid.uuid4())


def setup_logging(log_level: str = "INFO") -> None:
    """Configure structlog with JSON output, timestamps, and PII masking."""
    structlog.configure(
        processors=[
            structlog.contextvars.merge_contextvars,
            structlog.stdlib.filter_by_level,
            structlog.stdlib.add_logger_name,
            structlog.stdlib.add_log_level,
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.StackInfoRenderer(),
            structlog.processors.format_exc_info,
            pii_masking_processor,
            structlog.processors.UnicodeDecoder(),
            structlog.processors.JSONRenderer(),
        ],
        wrapper_class=structlog.stdlib.BoundLogger,
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
        cache_logger_on_first_use=True,
    )

    logging.basicConfig(
        format="%(message)s",
        level=getattr(logging, log_level.upper(), logging.INFO),
    )


def get_logger(name: str | None = None) -> structlog.stdlib.BoundLogger:
    """Get a structlog logger instance."""
    return structlog.get_logger(name)
