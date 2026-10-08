import uuid
from sqlalchemy import (
    Column,
    Text,
    String,
    Integer,
    Numeric,
    DateTime,
    ForeignKey,
    func,
)

from app.database import Base

class Venue(Base):
    """
    Physical Space and Asset Inventory Profile Model.
    Incorporates PostGIS spatial configurations to enable optimized radius indexing.
    """
    __tablename__ = "venues"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    
    # Clear relational ownership mapping
    host_id = Column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"), 
        nullable=False
    )
    
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    
    capacity_min = Column(Integer, nullable=False)
    capacity_max = Column(Integer, nullable=False)
    
    # Financial resolution fields using safe absolute precision mappings instead of floats
    base_price_per_day = Column(Numeric(12, 2), nullable=False)
    
    address = Column(String(255), nullable=False)
    city = Column(String(100), nullable=False, index=True)
    state = Column(String(100), nullable=False, index=True)
    
    # PostGIS Geography Point Geometry Tracking (SRID 4326 maps to standard GPS coordinates)
    geo_location = Column(Text, nullable=True)
    status = Column(String(20), nullable=False, server_default="published", index=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)


