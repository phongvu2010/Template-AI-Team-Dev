"""FastAPI Application Entrypoint (`backend/app/main.py`)."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.api.v1.router import api_router


def create_app() -> FastAPI:
    """Create and configure the FastAPI application instance."""
    app = FastAPI(
        title="AI Team Dev API",
        version="1.0.0",
        description="Backend API built by Antigravity 2.0 Multi-Agent Dev Team",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/health", tags=["system"])
    async def health_check() -> dict[str, str]:
        return {"status": "ok"}

    # Central API v1 router
    app.include_router(api_router, prefix="/api/v1")

    return app



app = create_app()
