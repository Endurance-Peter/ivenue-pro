import hashlib
import hmac
import secrets
from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.core.exceptions import InvalidVerificationCodeException, UserNotFoundException, VerificationExpiredException, VerificationRateLimitException
from app.integrations.email import send_welcome_email
from app.integrations.termii import send_sms
from app.models.user import User
from app.models.verification_code import VerificationCode
from app.core.security import create_access_token


def _utc_now() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


def _hash_code(code: str) -> str:
    return hmac.new(settings.secret_key.encode(), code.encode(), hashlib.sha256).hexdigest()


async def _issue_code(destination: str, purpose: str, db: AsyncSession) -> str:
    latest = await db.scalar(
        select(VerificationCode)
        .where(VerificationCode.destination == destination, VerificationCode.purpose == purpose)
        .order_by(VerificationCode.created_at.desc())
    )
    now = _utc_now()
    if latest and (now - latest.created_at).total_seconds() < settings.otp_resend_cooldown_seconds:
        raise VerificationRateLimitException()

    code = "123456" if settings.app_env == "test" else f"{secrets.randbelow(1_000_000):06d}"
    db.add(VerificationCode(
        destination=destination,
        purpose=purpose,
        code_hash=_hash_code(code),
        expires_at=now + timedelta(minutes=settings.otp_expiry_minutes),
    ))
    await db.commit()
    return code


async def _consume_code(destination: str, purpose: str, code: str, db: AsyncSession) -> None:
    record = await db.scalar(
        select(VerificationCode)
        .where(VerificationCode.destination == destination, VerificationCode.purpose == purpose, VerificationCode.consumed.is_(False))
        .order_by(VerificationCode.created_at.desc())
    )
    if record is None or record.expires_at < _utc_now():
        raise VerificationExpiredException()
    if record.attempts >= settings.otp_max_attempts:
        raise InvalidVerificationCodeException()
    if not hmac.compare_digest(record.code_hash, _hash_code(code)):
        record.attempts += 1
        await db.commit()
        raise InvalidVerificationCodeException()
    record.consumed = True
    await db.commit()


async def request_verification(phone: str, db: AsyncSession) -> dict[str, str]:
    user = await db.scalar(select(User).where(User.phone == phone))
    if user is None:
        db.add(User(phone=phone, full_name="Pending signup", email=f"{phone}@pending.ivenue.local"))
        await db.commit()

    code = await _issue_code(phone, "signup", db)
    await send_sms(phone=phone, message=f"Your iVenue verification code is {code}. It expires in {settings.otp_expiry_minutes} minutes.")
    return {"message": "Verification code sent", "phone": phone}


async def request_signin_code(phone: str, db: AsyncSession) -> dict[str, str]:
    user = await db.scalar(select(User).where(User.phone == phone, User.is_verified.is_(True)))
    if user is None:
        raise UserNotFoundException(phone)

    code = await _issue_code(phone, "signin", db)
    await send_sms(phone=phone, message=f"Your iVenue sign-in code is {code}. It expires in {settings.otp_expiry_minutes} minutes.")
    return {"message": "Sign-in code sent", "phone": phone}


async def verify_signin(phone: str, code: str, db: AsyncSession) -> tuple[str, User]:
    if len(code) != 6 or not code.isdigit():
        raise InvalidVerificationCodeException()

    user = await db.scalar(select(User).where(User.phone == phone, User.is_verified.is_(True)))
    if user is None:
        raise UserNotFoundException(phone)

    await _consume_code(phone, "signin", code, db)

    # The token is a prototype placeholder until the session/JWT store is introduced.
    return create_access_token(user), user


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

    await _consume_code(phone, "signup", code, db)

    user.full_name = full_name
    user.email = email
    user.role = account_type
    user.is_verified = True
    await db.commit()
    await db.refresh(user)
    await send_welcome_email(to=email, name=full_name)
    return user
