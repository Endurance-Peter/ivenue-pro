import logging
from contextlib import asynccontextmanager
from collections.abc import AsyncIterator

from fastapi import Depends, FastAPI
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.route import api_router
from app.config import settings
from app.core.middleware import register_exception_handlers, register_middleware
from app.database import Base, async_engine, get_db

logging.basicConfig(level=logging.INFO)


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    async with async_engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all)
    try:
        yield
    finally:
        await async_engine.dispose()


def create_app() -> FastAPI:
    app = FastAPI(title=settings.project_name, version="0.1.0", lifespan=lifespan)
    register_exception_handlers(app)
    register_middleware(app)
    app.include_router(api_router)

    @app.get("/health", tags=["System"])
    async def health(db: AsyncSession = Depends(get_db)) -> dict[str, str]:
        await db.execute(text("SELECT 1"))
        return {"status": "ok", "database": "connected", "environment": settings.app_env}

    return app


app = create_app()
