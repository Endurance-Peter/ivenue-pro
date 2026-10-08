from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class VenueCreateRequest(BaseModel):
    name: str = Field(min_length=2, max_length=255)
    description: str | None = None
    capacity_min: int = Field(ge=1)
    capacity_max: int = Field(ge=1)
    base_price_per_day: Decimal = Field(gt=0)
    address: str = Field(min_length=2, max_length=255)
    city: str = Field(min_length=2, max_length=100)
    state: str = Field(min_length=2, max_length=100)


class VenueImageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    url: str
    is_cover: bool
    sort_order: int


class VenueResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    host_id: str
    name: str
    description: str | None
    capacity_min: int
    capacity_max: int
    base_price_per_day: Decimal
    address: str
    city: str
    state: str
    status: str
    images: list[VenueImageResponse] = []
