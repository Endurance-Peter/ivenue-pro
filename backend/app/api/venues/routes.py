from fastapi import APIRouter, Depends, File, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.venues.schema import VenueCreateRequest, VenueImageResponse, VenueResponse
from app.api.venues.service import add_venue_image, attach_images, create_venue, list_host_venues, list_published_venues
from app.core.security import get_current_user
from app.database import get_db
from app.models.user import User

router = APIRouter(prefix="/venues", tags=["Venues"])


@router.get("", response_model=list[VenueResponse])
async def published_venues(db: AsyncSession = Depends(get_db)) -> list[VenueResponse]:
    venues = await list_published_venues(db)
    return [VenueResponse.model_validate(venue) for venue in await attach_images(venues, db)]


@router.get("/mine", response_model=list[VenueResponse])
async def my_venues(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[VenueResponse]:
    venues = await list_host_venues(current_user, db)
    return [VenueResponse.model_validate(venue) for venue in await attach_images(venues, db)]


@router.post("", response_model=VenueResponse, status_code=status.HTTP_201_CREATED)
async def create_host_venue(
    payload: VenueCreateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> VenueResponse:
    venue = await create_venue(payload, current_user, db)
    venue.images = []
    return VenueResponse.model_validate(venue)


@router.post("/{venue_id}/images", response_model=VenueImageResponse, status_code=status.HTTP_201_CREATED)
async def upload_venue_image(
    venue_id: str,
    image: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> VenueImageResponse:
    record = await add_venue_image(venue_id, image, current_user, db)
    return VenueImageResponse.model_validate(record)
