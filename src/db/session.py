"""Async Database Engine & Session Factory for PostgreSQL / Supabase (asyncpg)."""

import os
from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://postgres:postgres@localhost:5432/dev_db",
)

connect_args = {}
# Supavisor / PgBouncer Transaction Pooler (e.g. Supabase port 6543) does not support
# session-level prepared statements. Disable statement cache in asyncpg if connecting to pooler.
if (
    ":6543" in DATABASE_URL
    or "pooler.supabase.com" in DATABASE_URL
    or os.getenv("DB_DISABLE_STATEMENT_CACHE", "false").lower() == "true"
):
    connect_args["prepared_statement_cache_size"] = 0
    connect_args["statement_cache_size"] = 0

engine = create_async_engine(
    DATABASE_URL,
    echo=os.getenv("SQL_ECHO", "false").lower() == "true",
    pool_pre_ping=True,
    connect_args=connect_args,
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)


async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency providing an isolated AsyncSession per request."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
