from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field


AccountType = Literal["customer", "host"]


class SignupRequest(BaseModel):
    phone: str = Field(min_length=10, max_length=20)
    full_name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    account_type: AccountType = "customer"


class VerifyCodeRequest(BaseModel):
    phone: str = Field(min_length=10, max_length=20)
    code: str = Field(pattern=r"^\d{6}$")
    full_name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    account_type: AccountType = "customer"


class VerificationResponse(BaseModel):
    message: str
    phone: str


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    phone: str
    full_name: str
    email: EmailStr
    account_type: AccountType
    is_verified: bool
