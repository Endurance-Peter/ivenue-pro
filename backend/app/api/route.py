from fastapi import APIRouter

from app.api.auth.routes import router as auth_router
from app.api.venues.routes import router as venues_router

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(auth_router)
api_router.include_router(venues_router)
