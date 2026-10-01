"""System smoke tests verifying API and in-memory async SQLite database fixtures."""

import pytest
from httpx import AsyncClient
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession


@pytest.mark.asyncio
async def test_health_check_endpoint(async_client: AsyncClient) -> None:
    """Verify FastAPI /health endpoint returns 200 OK and expected payload."""
    response = await async_client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


@pytest.mark.asyncio
async def test_in_memory_db_session(async_db_session: AsyncSession) -> None:
    """Verify async SQLite fallback session can execute SQL queries."""
    result = await async_db_session.execute(text("SELECT 1 AS num"))
    row = result.scalar_one()
    assert row == 1
