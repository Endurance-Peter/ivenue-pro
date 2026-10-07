from pathlib import Path

import httpx
from jinja2 import Environment, FileSystemLoader, select_autoescape

from app.config import settings

TEMPLATE_DIR = Path(__file__).resolve().parents[1] / "templates" / "email"
templates = Environment(loader=FileSystemLoader(TEMPLATE_DIR), autoescape=select_autoescape(["html", "xml"]))


async def send_email(*, to: str, subject: str, template_name: str, context: dict[str, object]) -> None:
    if not settings.resend_api_key:
        return

    html = templates.get_template(template_name).render(**context)
    payload = {"from": settings.resend_from_email, "to": [to], "subject": subject, "html": html}
    headers = {"Authorization": f"Bearer {settings.resend_api_key}", "Content-Type": "application/json"}
    async with httpx.AsyncClient(timeout=10) as client:
        response = await client.post(settings.resend_api_url, json=payload, headers=headers)
        response.raise_for_status()


async def send_welcome_email(*, to: str, name: str) -> None:
    await send_email(to=to, subject="Welcome to iVenue", template_name="welcome.html", context={"name": name})


async def send_password_reset_email(*, to: str, name: str, reset_url: str) -> None:
    await send_email(to=to, subject="Reset your iVenue password", template_name="password_reset.html", context={"name": name, "reset_url": reset_url})