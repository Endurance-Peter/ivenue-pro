from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.auth.schema import SessionResponse, SigninRequest, SigninVerifyRequest, SignupRequest, UserResponse, VerificationResponse, VerifyCodeRequest
from app.api.auth.service import request_signin_code, request_verification, verify_and_create_user, verify_signin
from app.database import get_db
from app.core.security import create_access_token, get_current_user
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/signup", response_model=VerificationResponse, status_code=status.HTTP_202_ACCEPTED)
async def signup(
    payload: SignupRequest, 
    db: AsyncSession = Depends(get_db)
) -> VerificationResponse:
    result = await request_verification(payload.phone, db)
    return VerificationResponse(**result)


@router.post("/signin/request", response_model=VerificationResponse, status_code=status.HTTP_202_ACCEPTED)
async def signin_request(payload: SigninRequest, db: AsyncSession = Depends(get_db)) -> VerificationResponse:
    result = await request_signin_code(payload.phone, db)
    return VerificationResponse(**result)


@router.post("/signin/verify", response_model=SessionResponse)
async def signin_verify(payload: SigninVerifyRequest, db: AsyncSession = Depends(get_db)) -> SessionResponse:
    token, user = await verify_signin(payload.phone, payload.code, db)
    return SessionResponse(access_token=token, user=UserResponse.model_validate(user))


@router.get("/me", response_model=UserResponse)
async def current_user(user: User = Depends(get_current_user)) -> UserResponse:
    return UserResponse.model_validate(user)


@router.post("/verify", response_model=SessionResponse, status_code=status.HTTP_201_CREATED)
async def verify_code(
    payload: VerifyCodeRequest, 
    db: AsyncSession = Depends(get_db)
) -> UserResponse:
    user = await verify_and_create_user(
        phone=payload.phone,
        code=payload.code,
        full_name=payload.full_name,
        email=str(payload.email),
        account_type=payload.role,
        db=db,
    )
    return SessionResponse(access_token=create_access_token(user), user=UserResponse.model_validate(user))
