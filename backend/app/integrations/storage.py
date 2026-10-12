import uuid
from pathlib import Path

import httpx
from fastapi import UploadFile

from app.config import settings

LOCAL_MEDIA_ROOT = Path(__file__).resolve().parents[2] / "media" / "venues"


async def store_venue_image(venue_id: str, image: UploadFile) -> tuple[str, str]:
    extension = Path(image.filename or "image").suffix.lower()
    if extension not in {".jpg", ".jpeg", ".png", ".webp"}:
        raise ValueError("Only JPG, PNG, and WebP images are supported.")

    image_id = str(uuid.uuid4())
    storage_key = f"{venue_id}/{image_id}{extension}"
    content = await image.read()

    if settings.supabase_url and settings.supabase_service_role_key:
        url = f"{settings.supabase_url.rstrip('/')}/storage/v1/object/{settings.supabase_storage_bucket}/{storage_key}"
        headers = {
            "Authorization": f"Bearer {settings.supabase_service_role_key}",
            "apikey": settings.supabase_service_role_key,
            "Content-Type": image.content_type or "application/octet-stream",
            "x-upsert": "true",
        }
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(url, content=content, headers=headers)
            if response.is_error:
                raise RuntimeError(f"Supabase Storage upload failed: HTTP {response.status_code}")
        public_url = f"{settings.supabase_url.rstrip('/')}/storage/v1/object/public/{settings.supabase_storage_bucket}/{storage_key}"
        return storage_key, public_url

    target = LOCAL_MEDIA_ROOT / storage_key
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(content)
    return storage_key, f"/media/venues/{storage_key}"