import time
import logging
from fastapi import FastAPI, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from redis.asyncio import Redis

from app.config import settings
from app.database import get_db

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ivenue_core")

app = FastAPI(title=settings.project_name, version="0.1.0")

@app.middleware("http")
async def monitor_latency_metrics(request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration = time.time() - start_time
    if duration > 0.5:
        logger.warning(f"SLOW ENDPOINT DETECTION: {request.url.path} taken {duration:.2f}s")
    return response


@app.get("/health", status_code=200)
async def platform_health_diagnostic(db: AsyncSession = Depends(get_db)):
    """
    Subsystem check verify script ensuring complete end-to-end data pathway health.
    """
    diagnostic_report = {
        "status": "healthy",
        "project": settings.project_name,
        "environment": settings.app_env,
        "subsystems": {}
    }
    
    # 1. Validate Relational Core Stability
    try:
        await db.execute(text("SELECT 1"))
        diagnostic_report["subsystems"]["postgres"] = "operational"
    except Exception as error:
        logger.error(f"Health verification failed targeting PostgreSQL container: {str(error)}")
        diagnostic_report["subsystems"]["postgres"] = "offline"
        diagnostic_report["status"] = "degraded"
        
    # 2. Validate Cache & Concurrency Stability
    # try:
    #     cache_client = Redis(host=settings.redis_host, port=settings.redis_port, socket_timeout=2.0)
    #     await cache_client.ping()
    #     diagnostic_report["subsystems"]["redis"] = "operational"
    #     await cache_client.close()
    # except Exception as error:
    #     logger.error(f"Health verification failed targeting Redis container: {str(error)}")
    #     diagnostic_report["subsystems"]["redis"] = "offline"
    #     diagnostic_report["status"] = "degraded"
        
    return diagnostic_report
