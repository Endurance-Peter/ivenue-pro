from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.auth.schema import SignupRequest, UserResponse, VerificationResponse, VerifyCodeRequest
from app.api.auth.service import request_verification, verify_and_create_user
from app.database import get_db

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/signup", response_model=VerificationResponse, status_code=status.HTTP_202_ACCEPTED)
async def signup(
    payload: SignupRequest, 
    db: AsyncSession = Depends(get_db)
) -> VerificationResponse:
    result = await request_verification(payload.phone, db)
    return VerificationResponse(**result)


@router.post("/verify", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def verify_code(
    payload: VerifyCodeRequest, 
    db: AsyncSession = Depends(get_db)
) -> UserResponse:
    user = await verify_and_create_user(
        phone=payload.phone,
        code=payload.code,
        full_name=payload.full_name,
        email=str(payload.email),
        account_type=payload.account_type,
        db=db,
    )
    return UserResponse.model_validate(user)
