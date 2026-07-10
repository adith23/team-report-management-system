"""
Application configuration module.

Uses Pydantic Settings for type-safe, environment-driven configuration.
All settings are loaded from environment variables or a .env file.
Sensitive defaults are intentionally omitted to force explicit configuration.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Central application configuration.

    Loads from environment variables with .env file fallback.
    All fields are validated at startup — misconfiguration fails fast.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    # ── Application ──────────────────────────────────────────────
    APP_NAME: str = "Team Report Management System"
    APP_ENV: str = "development"
    DEBUG: bool = True

    # ── Database ─────────────────────────────────────────────────
    DATABASE_URL: str
    """
    Async PostgreSQL connection string.
    Format: postgresql+asyncpg://user:password@host:port/dbname
    """

    # ── JWT Authentication ───────────────────────────────────────
    JWT_SECRET_KEY: str
    """Secret key for signing JWT tokens. Must be changed in production."""
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

    # ── CORS ─────────────────────────────────────────────────────
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
    ]

    # ── Admin Bootstrap ──────────────────────────────────────────
    ADMIN_BOOTSTRAP_EMAIL: str = "admin@company.com"
    """
    Email address that automatically receives MANAGER role on registration.
    Used to solve the bootstrap problem — the first admin in the system.
    """

    # ── AI (Optional) ────────────────────────────────────────────
    OPENAI_API_KEY: str | None = None
    GEMINI_API_KEY: str | None = None
    PINECONE_API_KEY: str | None = None
    PINECONE_INDEX_NAME: str = "team-reports"

    @property
    def is_production(self) -> bool:
        """Check if running in production environment."""
        return self.APP_ENV == "production"

    @property
    def database_url_sync(self) -> str:
        """
        Synchronous database URL for Alembic migrations.

        Converts 'postgresql+asyncpg://' to 'postgresql+psycopg2://'
        since Alembic's autogenerate needs a sync driver.
        """
        return self.DATABASE_URL.replace(
            "postgresql+asyncpg://", "postgresql+psycopg2://"
        )


# Singleton settings instance — imported throughout the application.
# Validated once at module import time.
settings = Settings()
