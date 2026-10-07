import pytest
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.auth.service import request_verification, verify_and_create_user
from app.core.exceptions import InvalidVerificationCodeException, UserNotFoundException
from app.models.user import User


@pytest.mark.asyncio
async def test_verify_and_create_user_requires_signup(db_session: AsyncSession):
    with pytest.raises(UserNotFoundException) as error:
        await verify_and_create_user(
            phone="08000000000",
            code="123456",
            full_name="Ada Lovelace",
            email="ada@example.com",
            account_type="customer",
            db=db_session,
        )

    assert error.value.code == "user_not_found"
    assert error.value.status_code == 404


@pytest.mark.asyncio
async def test_signup_record_is_verified_by_service(db_session: AsyncSession):
    await request_verification("08000000000", db_session)

    user = await verify_and_create_user(
        phone="08000000000",
        code="123456",
        full_name="Ada Lovelace",
        email="ada@example.com",
        account_type="customer",
        db=db_session,
    )

    stored_user = await db_session.scalar(select(User).where(User.phone == "08000000000"))
    assert user.id == stored_user.id
    assert stored_user.is_verified is True
    assert stored_user.full_name == "Ada Lovelace"


@pytest.mark.asyncio
async def test_service_rejects_malformed_verification_code(db_session: AsyncSession):
    await request_verification("08000000000", db_session)

    with pytest.raises(InvalidVerificationCodeException):
        await verify_and_create_user(
            phone="08000000000",
            code="bad",
            full_name="Ada Lovelace",
            email="ada@example.com",
            account_type="customer",
            db=db_session,
        )
