import uuid

from sqlalchemy import Boolean, Column, ForeignKey, Integer, String

from app.database import Base


class VenueImage(Base):
    __tablename__ = "venue_images"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    venue_id = Column(String(36), ForeignKey("venues.id", ondelete="CASCADE"), nullable=False, index=True)
    storage_key = Column(String(255), nullable=False)
    url = Column(String(500), nullable=False)
    is_cover = Column(Boolean, nullable=False, default=False)
    sort_order = Column(Integer, nullable=False, default=0)