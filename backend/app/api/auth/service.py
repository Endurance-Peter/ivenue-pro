import hashlib
import hmac
import secrets
from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from pwdlib import PasswordHash

from app.config import settings
from app.core.exceptions import (
    InvalidVerificationCodeException,
    InvalidCredentialsException,
    ProviderDeliveryException,
    UserNotFoundException,
    VerificationExpiredException,
    VerificationRateLimitException,
)
from app.core.security import create_access_token
from app.integrations.email import send_welcome_email
from app.integrations.termii import send_sms
from app.models.user import User
from app.models.verification_code import VerificationCode


class AuthService:
    # The phone OTP methods below remain available for the planned Termii workflow.
    # Development currently uses the password methods above until SMS approval is ready.
    password_hasher = PasswordHash.recommended()

    async def signup_with_password(self, full_name: str, email: str, password: str, role: str, db: AsyncSession) -> tuple[str, User]:
        existing = await db.scalar(select(User).where(User.email == email))
        if existing is not None:
            raise InvalidCredentialsException()
        user = User(full_name=full_name, email=email, password_hash=self.password_hasher.hash(password), role=role, is_verified=True)
        db.add(user)
        await db.commit()
        await db.refresh(user)
        return create_access_token(user), user

    async def signin_with_password(self, email: str, password: str, db: AsyncSession) -> tuple[str, User]:
        user = await db.scalar(select(User).where(User.email == email, User.is_verified.is_(True)))
        if user is None or not user.password_hash or not self.password_hasher.verify(password, user.password_hash):
            raise InvalidCredentialsException()
        return create_access_token(user), user

    def _utc_now(self) -> datetime:
        return datetime.now(timezone.utc).replace(tzinfo=None)

    def _hash_code(self, code: str) -> str:
        return hmac.new(settings.secret_key.encode(), code.encode(), hashlib.sha256).hexdigest()

    async def _issue_code(self, destination: str, purpose: str, db: AsyncSession) -> str:
        latest = await db.scalar(
            select(VerificationCode)
            .where(
                VerificationCode.destination == destination,
                VerificationCode.purpose == purpose,
            )
            .order_by(VerificationCode.created_at.desc())
        )
        now = self._utc_now()
        if latest and (now - latest.created_at).total_seconds() < settings.otp_resend_cooldown_seconds:
            raise VerificationRateLimitException()

        code = "123456" if settings.app_env == "test" else f"{secrets.randbelow(1_000_000):06d}"
        db.add(
            VerificationCode(
                destination=destination,
                purpose=purpose,
                code_hash=self._hash_code(code),
                expires_at=now + timedelta(minutes=settings.otp_expiry_minutes),
            )
        )
        await db.commit()
        return code

    async def _consume_code(self, destination: str, purpose: str, code: str, db: AsyncSession) -> None:
        record = await db.scalar(
            select(VerificationCode)
            .where(
                VerificationCode.destination == destination,
                VerificationCode.purpose == purpose,
                VerificationCode.consumed.is_(False),
            )
            .order_by(VerificationCode.created_at.desc())
        )
        if record is None or record.expires_at < self._utc_now():
            raise VerificationExpiredException()
        if record.attempts >= settings.otp_max_attempts:
            raise InvalidVerificationCodeException()
        if not hmac.compare_digest(record.code_hash, self._hash_code(code)):
            record.attempts += 1
            await db.commit()
            raise InvalidVerificationCodeException()
        record.consumed = True
        await db.commit()

    async def _discard_latest_code(self, destination: str, purpose: str, db: AsyncSession) -> None:
        record = await db.scalar(
            select(VerificationCode)
            .where(VerificationCode.destination == destination, VerificationCode.purpose == purpose)
            .order_by(VerificationCode.created_at.desc())
        )
        if record is not None:
            await db.delete(record)
            await db.commit()

    async def request_verification(self, phone: str, db: AsyncSession) -> dict[str, str]:
        user = await db.scalar(select(User).where(User.phone == phone))
        if user is None:
            db.add(User(phone=phone, full_name="Pending signup", email=f"{phone}@pending.ivenue.local"))
            await db.commit()

        code = await self._issue_code(phone, "signup", db)
        try:
            await send_sms(phone=phone, message=f"Your iVenue verification code is {code}. It expires in {settings.otp_expiry_minutes} minutes.")
        except ProviderDeliveryException:
            await self._discard_latest_code(phone, "signup", db)
            raise
        return {"message": "Verification code sent", "phone": phone}

    async def request_signin_code(self, phone: str, db: AsyncSession) -> dict[str, str]:
        user = await db.scalar(select(User).where(User.phone == phone, User.is_verified.is_(True)))
        if user is None:
            raise UserNotFoundException(phone)

        code = await self._issue_code(phone, "signin", db)
        try:
            await send_sms(phone=phone, message=f"Your iVenue sign-in code is {code}. It expires in {settings.otp_expiry_minutes} minutes.")
        except ProviderDeliveryException:
            await self._discard_latest_code(phone, "signin", db)
            raise
        return {"message": "Sign-in code sent", "phone": phone}

    async def verify_signin(self, phone: str, code: str, db: AsyncSession) -> tuple[str, User]:
        if len(code) != 6 or not code.isdigit():
            raise InvalidVerificationCodeException()

        user = await db.scalar(select(User).where(User.phone == phone, User.is_verified.is_(True)))
        if user is None:
            raise UserNotFoundException(phone)

        await self._consume_code(phone, "signin", code, db)
        return create_access_token(user), user

    async def verify_and_create_user(
        self,
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

        await self._consume_code(phone, "signup", code, db)
        user.full_name = full_name
        user.email = email
        user.role = account_type
        user.is_verified = True
        await db.commit()
        await db.refresh(user)
        await send_welcome_email(to=email, name=full_name)
        return user


# Shared application service used by route handlers.
auth_service = AuthService()


# Compatibility functions for existing callers and tests.
async def request_verification(phone: str, db: AsyncSession) -> dict[str, str]:
    return await auth_service.request_verification(phone, db)


async def request_signin_code(phone: str, db: AsyncSession) -> dict[str, str]:
    return await auth_service.request_signin_code(phone, db)


async def verify_signin(phone: str, code: str, db: AsyncSession) -> tuple[str, User]:
    return await auth_service.verify_signin(phone, code, db)


async def verify_and_create_user(**kwargs) -> User:
    return await auth_service.verify_and_create_user(**kwargs)
