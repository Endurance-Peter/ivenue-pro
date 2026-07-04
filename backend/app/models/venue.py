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

class Venue(Base):
    """
    Physical Space and Asset Inventory Profile Model.
    Incorporates PostGIS spatial configurations to enable optimized radius indexing.
    """
    __tablename__ = "venues"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    
    # Clear relational ownership mapping
    host_id = Column(
        UUID(as_uuid=True), 
        ForeignKey("users.id", ondelete="CASCADE"), 
        nullable=False
    )
    
    name = Column(String(255), nullable=False)
    description = Column(String, nullable=True)
    
    capacity_min = Column(Integer, nullable=False)
    capacity_max = Column(Integer, nullable=False)
    
    # Financial resolution fields using safe absolute precision mappings instead of floats
    base_price_per_day = Column(Numeric(12, 2), nullable=False)
    
    address = Column(String(255), nullable=False)
    city = Column(String(100), nullable=False, index=True)
    state = Column(String(100), nullable=False, index=True)
    
    # PostGIS Geography Point Geometry Tracking (SRID 4326 maps to standard GPS coordinates)
    geo_location = Column(
        Geometry(geometry_type="POINT", srid=4326, spatial_index=True), 
        nullable=True
    )
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)


