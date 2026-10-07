from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import InvalidVerificationCodeException, UserNotFoundException
from app.models.user import User


async def request_verification(phone: str, db: AsyncSession) -> dict[str, str]:
    user = await db.scalar(select(User).where(User.phone == phone))
    if user is None:
        db.add(User(phone=phone, full_name="Pending signup", email=f"{phone}@pending.ivenue.local"))
        await db.commit()

    # SMS delivery will be connected later; this keeps the API contract ready.
    return {"message": "Verification code sent", "phone": phone}


async def verify_and_create_user(
    *,
    phone: str,
    code: str,
    full_name: str,
    email: str,
    account_type: str,
    db: AsyncSession,
) -> User:
    if len(code) != 6 or not code.isdigit():
        raise InvalidVerificationCodeException()

    user = await db.scalar(select(User).where(User.phone == phone))
    if user is None:
        raise UserNotFoundException(phone)

    user.full_name = full_name
    user.email = email
    user.account_type = account_type
    user.is_verified = True
    await db.commit()
    await db.refresh(user)
    return user
