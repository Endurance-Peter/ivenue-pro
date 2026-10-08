from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field


Role = Literal["customer", "host", "admin", "super_admin"]


class SignupRequest(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    role: Literal["customer", "host"] = "customer"


class SigninRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class VerifyCodeRequest(BaseModel):
    phone: str = Field(min_length=10, max_length=20)
    code: str = Field(pattern=r"^\d{6}$")
    full_name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    role: Literal["customer", "host"] = "customer"


class VerificationResponse(BaseModel):
    message: str
    phone: str | None


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    phone: str | None
    full_name: str
    email: EmailStr
    role: Role
    is_verified: bool


class SigninVerifyRequest(BaseModel):
    phone: str = Field(min_length=10, max_length=20)
    code: str = Field(pattern=r"^\d{6}$")


class SessionResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
