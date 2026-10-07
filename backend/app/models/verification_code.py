import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, Integer, String

from app.database import Base


class VerificationCode(Base):
    __tablename__ = "verification_codes"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    destination = Column(String(255), nullable=False, index=True)
    purpose = Column(String(40), nullable=False, index=True)
    code_hash = Column(String(64), nullable=False)
    expires_at = Column(DateTime, nullable=False)
    attempts = Column(Integer, nullable=False, default=0)
    consumed = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc).replace(tzinfo=None))