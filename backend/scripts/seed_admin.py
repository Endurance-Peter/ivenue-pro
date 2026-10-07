import asyncio
import os

from sqlalchemy import select

from app.database import AsyncSessionLocal, Base, async_engine
from app.models.user import User


async def seed_admin() -> None:
    phone = os.environ.get("ADMIN_PHONE")
    email = os.environ.get("ADMIN_EMAIL")
    full_name = os.environ.get("ADMIN_NAME")
    role = os.environ.get("ADMIN_ROLE", "super_admin")

    if not phone or not email or not full_name:
        raise RuntimeError("ADMIN_PHONE, ADMIN_EMAIL, and ADMIN_NAME must be set before seeding an admin.")
    if role not in {"admin", "super_admin"}:
        raise ValueError("ADMIN_ROLE must be admin or super_admin.")

    async with async_engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        user = await session.scalar(select(User).where(User.phone == phone))
        if user is None:
            user = User(phone=phone, email=email, full_name=full_name, role=role, is_verified=True)
            session.add(user)
        else:
            user.email = email
            user.full_name = full_name
            user.role = role
            user.is_verified = True
        await session.commit()

    print(f"Seeded {role} account for {email}.")


if __name__ == "__main__":
    asyncio.run(seed_admin())