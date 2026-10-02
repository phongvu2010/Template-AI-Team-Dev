"""API v1 Router aggregator (`backend/app/api/v1/router.py`).

Central router mounting all feature-specific sub-routers for API v1.
backend-dev should register feature endpoints here.
"""

from fastapi import APIRouter

api_router = APIRouter()

# Example registration pattern for backend-dev:
# from backend.app.api.v1.endpoints import items
# api_router.include_router(items.router, prefix="/items", tags=["items"])
