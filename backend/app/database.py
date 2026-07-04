import logging
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base

from app.config import settings

logger = logging.getLogger("ivenue_database")

# Create High-Performance Asynchronous Database Engine with Connection Pooling
async_engine = create_async_engine(
    settings.async_database_url, # Consuming your adjusted property safely
    echo=False,
    pool_size=20,
    max_overflow=10,
    pool_timeout=30.0,
    pool_recycle=1800,
)

# Instantiate Asynchronous Session Factory
AsyncSessionLocal = async_sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    autoflush=False,
    autocommit=False,
    expire_on_commit=False,
)

Base = declarative_base()


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency provider function managing the relational session lifecycle per API request.
    Yields an active database session and guarantees safe pool reclamation when done.
    """
    session: AsyncSession = AsyncSessionLocal()
    try:
        yield session
    except Exception as e:
        logger.error(f"Database session exception encountered. Rolling back context. Error: {str(e)}")
        await session.rollback()
        raise
    finally:
        await session.close()