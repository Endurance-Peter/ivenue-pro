from fastapi import Depends, FastAPI
from sqlalchemy.ext.asyncio import AsyncSession

from .config import get_settings
from .database import get_db

settings = get_settings()


def create_app() -> FastAPI:
    app = FastAPI(title="iVenue API", version="0.1.0")

    @app.get("/health")
    async def health_check() -> dict[str, str]:
        return {
            "status": "ok",
            "service": "ivenue-api",
            "environment": settings.app_env,
        }

    @app.get("/")
    async def root() -> dict[str, str]:
        return {"message": "iVenue API is running"}

    @app.get("/db-check")
    async def db_check(db: AsyncSession = Depends(get_db)) -> dict[str, str]:
        await db.execute("SELECT 1")
        return {"status": "ok", "database": "connected"}

    return app


app = create_app()
