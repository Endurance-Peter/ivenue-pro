import asyncio

from sqlalchemy import select
from pwdlib import PasswordHash

from app.config import settings
from app.database import AsyncSessionLocal
from app.models.user import User


async def seed_admin() -> None:
    phone = settings.admin_phone
    email = settings.admin_email
    full_name = settings.admin_name
    role = settings.admin_role
    password = settings.admin_password

    if not phone or not email or not full_name or not password:
        raise RuntimeError("ADMIN_PHONE, ADMIN_EMAIL, ADMIN_NAME, and ADMIN_PASSWORD must be set before seeding an admin.")
    if role not in {"admin", "super_admin"}:
        raise ValueError("ADMIN_ROLE must be admin or super_admin.")

    password_hash = PasswordHash.recommended().hash(password)
    async with AsyncSessionLocal() as session:
        user = await session.scalar(select(User).where(User.phone == phone))
        if user is None:
            user = User(phone=phone, email=email, full_name=full_name, password_hash=password_hash, role=role, is_verified=True)
            session.add(user)
        else:
            user.email = email
            user.full_name = full_name
            user.role = role
            user.password_hash = password_hash
            user.is_verified = True
        await session.commit()

    print(f"Seeded {role} account for {email}. The account can now sign in with phone OTP.")


if __name__ == "__main__":
    asyncio.run(seed_admin())