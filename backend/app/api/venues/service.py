from fastapi import UploadFile
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.authorization import ForbiddenException, Permission, require_permission
from app.models.user import User
from app.models.venue import Venue
from app.models.venue_image import VenueImage
from app.integrations.storage import store_venue_image


async def list_published_venues(db: AsyncSession) -> list[Venue]:
    result = await db.scalars(select(Venue).where(Venue.status == "published").order_by(Venue.created_at.desc()))
    return list(result.all())


async def list_host_venues(host: User, db: AsyncSession) -> list[Venue]:
    query = select(Venue).order_by(Venue.created_at.desc())
    if host.role not in {"admin", "super_admin"}:
        query = query.where(Venue.host_id == host.id)
    result = await db.scalars(query)
    return list(result.all())


async def create_venue(payload, host: User, db: AsyncSession) -> Venue:
    if host.role not in {"admin", "super_admin"}:
        require_permission(host, Permission.MANAGE_OWN_VENUES)
    venue = Venue(host_id=host.id, **payload.model_dump(), status="published")
    db.add(venue)
    await db.commit()
    await db.refresh(venue)
    return venue


async def add_venue_image(venue_id: str, image: UploadFile, host: User, db: AsyncSession) -> VenueImage:
    venue = await db.get(Venue, venue_id)
    if venue is None:
        raise ForbiddenException("Venue was not found.")
    if venue.host_id != host.id and host.role not in {"admin", "super_admin"}:
        raise ForbiddenException("You can only manage your own venues.")

    storage_key, public_url = await store_venue_image(venue_id, image)

    image_record = VenueImage(
        id=storage_key.split("/")[-1].split(".")[0],
        venue_id=venue_id,
        storage_key=storage_key,
        url=public_url,
        is_cover=False,
        sort_order=0,
    )
    db.add(image_record)
    await db.commit()
    await db.refresh(image_record)
    return image_record


async def attach_images(venues: list[Venue], db: AsyncSession) -> list[Venue]:
    for venue in venues:
        venue.images = list(await db.scalars(select(VenueImage).where(VenueImage.venue_id == venue.id).order_by(VenueImage.sort_order)))
    return venues
