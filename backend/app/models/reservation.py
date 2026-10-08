import uuid
from datetime import date
from sqlalchemy import (
    Column,
    String,
    Numeric,
    Date,
    DateTime,
    ForeignKey,
    UniqueConstraint,
    func,
)

from app.database import Base

class Reservation(Base):
    """
    Transaction and Calendar Allocation Lifecycle Model.
    Implements a strict physical uniqueness safety boundary protecting against concurrency race conditions.
    """
    __tablename__ = "reservations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    
    # Structural foreign keys blocking cascades to maintain audit trails
    venue_id = Column(
        String(36),
        ForeignKey("venues.id", ondelete="RESTRICT"), 
        nullable=False,
        index=True
    )
    customer_id = Column(
        String(36),
        ForeignKey("users.id", ondelete="RESTRICT"), 
        nullable=False,
        index=True
    )
    
    booking_date = Column(Date, nullable=False, index=True)
    
    # States: 'Pending', 'Hold', 'Confirmed', 'In-Progress', 'Completed', 'Cancelled', 'Disputed'
    status = Column(String(50), nullable=False, server_default="Pending")
    
    total_price = Column(Numeric(12, 2), nullable=False)
    
    # Accounting States: 'Held', 'Released', 'Refunded'
    escrow_status = Column(String(50), nullable=False, server_default="Held")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Core Defensible Constraint Strategy:
    # A database constraint that prevents two rows from having the same venue_id and booking_date.
    # This serves as a final database-level guarantee that concurrent race conditions can never write a double booking.
    __table_args__ = (
        UniqueConstraint(
            "venue_id", 
            "booking_date", 
            name="unique_venue_date_booking"
        ),
    )