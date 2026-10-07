from datetime import datetime, timedelta, timezone

import jwt
from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.core.exceptions import AuthenticationException, UserNotFoundException
from app.database import get_db
from app.models.user import User

bearer_scheme = HTTPBearer(auto_error=False)


def create_access_token(user: User) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": user.id,
        "role": user.role,
        "type": "access",
        "iat": now,
        "exp": now + timedelta(minutes=settings.jwt_access_token_expire_minutes),
    }
    return jwt.encode(payload, settings.secret_key, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> dict[str, object]:
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.jwt_algorithm])
    except jwt.PyJWTError as error:
        raise AuthenticationException("The access token is invalid or expired.") from error

    if payload.get("type") != "access" or not payload.get("sub"):
        raise AuthenticationException("The access token is invalid.")
    return payload


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    if credentials is None:
        raise AuthenticationException()

    payload = decode_access_token(credentials.credentials)
    user = await db.get(User, str(payload["sub"]))
    if user is None or not user.is_verified:
        raise UserNotFoundException(str(payload["sub"]))
    return user