import uuid
from datetime import datetime, date
from sqlalchemy import (
    Column,
    String,
    Integer,
    Numeric,
    Date,
    DateTime,
    ForeignKey,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from geoalchemy2 import Geometry

from app.database import Base


class User(Base):
    """
    Identity & Access Management Core Model.
    Tracks distinct registration credentials, profile references, and system roles.
    """
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    
    # Restrained check constraints enforced natively at database tier via Pydantic/PRD boundaries
    # Roles: 'Customer', 'Host', 'SuperAdmin'
    role = Column(String(50), nullable=False, server_default="Customer")
    
    first_name = Column(String(100), nullable=True)
    last_name = Column(String(100), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True), 
        server_default=func.now(), 
        onupdate=func.now(), 
        nullable=False
    )


