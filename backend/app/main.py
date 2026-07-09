"""
FastAPI application factory and entry point.

Responsibilities:
- Create and configure the FastAPI application instance.
- Register middleware (CORS, request logging).
- Register global exception handlers.
- Mount all API routers under the /api/v1 prefix.
- Manage application lifespan (startup/shutdown events).

Run with:
    uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
"""

import logging
from contextlib import asynccontextmanager
from collections.abc import AsyncIterator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.config import settings
from app.core.database import engine
from app.core.exceptions import AppException, app_exception_handler
from app.middleware.request_logging import RequestLoggingMiddleware

logger = logging.getLogger(__name__)


# ── Lifespan ─────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:  # noqa: ARG001
    """
    Application lifespan manager.

    Startup:
        - Verify database connectivity with a test query.
        - Log successful startup.

    Shutdown:
        - Dispose the database engine (close all pooled connections).
    """
    # ── Startup ──────────────────────────────────────────────
    logger.info("Starting %s...", settings.APP_NAME)
    try:
        async with engine.begin() as conn:
            await conn.execute(text("SELECT 1"))
        logger.info("Database connection verified successfully.")
    except Exception:
        logger.exception("Failed to connect to the database.")
        raise

    yield

    # ── Shutdown ─────────────────────────────────────────────
    logger.info("Shutting down %s...", settings.APP_NAME)
    await engine.dispose()
    logger.info("Database connections closed.")


# ── App Factory ──────────────────────────────────────────────────
def create_app() -> FastAPI:
    """
    FastAPI application factory.

    Creates and fully configures the application instance with:
    - Metadata (title, version, docs URL)
    - CORS middleware
    - Global exception handlers
    - API routers mounted under the /api/v1 prefix
    """
    app = FastAPI(
        title=settings.APP_NAME,
        version="1.0.0",
        description=(
            "REST API for the Weekly Report Generator & Team Dashboard. "
            "Supports role-based access control with Team Member and Manager roles."
        ),
        lifespan=lifespan,
        docs_url="/docs" if settings.DEBUG else None,
        redoc_url="/redoc" if settings.DEBUG else None,
    )

    # ── CORS Middleware ──────────────────────────────────────
    # allow_credentials=True is REQUIRED for HttpOnly cookie auth.
    # The browser must include cookies in cross-origin requests.
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ── Request Logging Middleware ────────────────────────────
    app.add_middleware(RequestLoggingMiddleware)

    # ── Exception Handlers ───────────────────────────────────
    app.add_exception_handler(AppException, app_exception_handler)

    # ── API Routers ──────────────────────────────────────────
    from app.routers import (
        auth_router,
        user_router,
        report_router,
        project_router,
        dashboard_router,
        ai_router,
    )

    # Mount API routers under prefix /api/v1
    app.include_router(auth_router, prefix="/api/v1")
    app.include_router(user_router, prefix="/api/v1")
    app.include_router(report_router, prefix="/api/v1")
    app.include_router(project_router, prefix="/api/v1")
    app.include_router(dashboard_router, prefix="/api/v1")
    app.include_router(ai_router, prefix="/api/v1")

    # ── Health Check ─────────────────────────────────────────
    @app.get(
        "/health",
        tags=["Health"],
        summary="Health check endpoint",
        response_model=dict,
    )
    async def health_check() -> dict:
        """
        Basic health check — confirms the API is running.

        Returns application name, version, and environment.
        """
        return {
            "status": "healthy",
            "app": settings.APP_NAME,
            "version": "1.0.0",
            "environment": settings.APP_ENV,
        }

    return app


# ── Application Instance ─────────────────────────────────────────
# This is the ASGI application that uvicorn serves.
app = create_app()
