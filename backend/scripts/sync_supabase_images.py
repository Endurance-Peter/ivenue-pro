"""Attach existing Supabase Storage objects to existing iVenue venues.

Expected object layout:
    <venue_id>/<image-file>

The script does not copy or delete files. It only creates missing VenueImage
metadata rows so the existing venue API can return the image URLs.
"""

import asyncio
import sys
from pathlib import PurePosixPath
from pathlib import Path

import httpx
from sqlalchemy import select

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from app.config import settings
from app.database import AsyncSessionLocal
from app.models.venue import Venue
from app.models.venue_image import VenueImage


async def list_storage_objects() -> list[dict[str, object]]:
    if not settings.supabase_url or not settings.supabase_service_role_key:
        raise RuntimeError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured.")

    url = f"{settings.supabase_url.rstrip('/')}/storage/v1/object/list/{settings.supabase_storage_bucket}"
    headers = {
        "apikey": settings.supabase_service_role_key,
        "Authorization": f"Bearer {settings.supabase_service_role_key}",
    }
    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.post(url, headers=headers, json={"prefix": "", "limit": 1000, "offset": 0})
        response.raise_for_status()
        return response.json()


async def sync_images() -> None:
    objects = await list_storage_objects()
    async with AsyncSessionLocal() as session:
        venues = {venue.id: venue for venue in (await session.scalars(select(Venue))).all()}
        attached = 0

        for storage_object in objects:
            name = storage_object.get("name")
            if not isinstance(name, str):
                continue
            path = PurePosixPath(name)
            if len(path.parts) < 2 or path.suffix.lower() not in {".jpg", ".jpeg", ".png", ".webp"}:
                continue

            venue_id = path.parts[0]
            if venue_id not in venues:
                continue

            existing = await session.scalar(select(VenueImage).where(VenueImage.storage_key == name))
            if existing:
                continue

            image_id = path.stem
            public_url = f"{settings.supabase_url.rstrip('/')}/storage/v1/object/public/{settings.supabase_storage_bucket}/{name}"
            session.add(VenueImage(id=image_id, venue_id=venue_id, storage_key=name, url=public_url, is_cover=attached == 0, sort_order=attached))
            attached += 1

        await session.commit()

    print(f"Attached {attached} Supabase image(s) to existing venues.")


if __name__ == "__main__":
    asyncio.run(sync_images())
