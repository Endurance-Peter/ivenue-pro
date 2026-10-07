import uuid
from sqlalchemy import Boolean, Column, DateTime, String, func

from app.database import Base


class User(Base):
    """
    Identity & Access Management Core Model.
    Tracks distinct registration credentials, profile references, and system roles.
    """
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    phone = Column(String(20), unique=True, nullable=False, index=True)
    full_name = Column(String(120), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    account_type = Column(String(20), nullable=False, server_default="customer")
    is_verified = Column(Boolean, nullable=False, server_default="0")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)


