import httpx

from app.config import settings
from app.core.exceptions import ProviderDeliveryException


async def send_sms(*, phone: str, message: str) -> None:
    if not settings.termii_api_key:
        return

    payload = {
        "api_key": settings.termii_api_key,
        "to": phone,
        "from": settings.termii_sender_id,
        "sms": message,
        "type": "plain",
        "channel": "generic",
    }
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.post(settings.termii_api_url, json=payload)
            response.raise_for_status()
    except (httpx.HTTPError, httpx.TimeoutException) as error:
        raise ProviderDeliveryException() from error