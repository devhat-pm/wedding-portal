from pydantic import BaseModel, Field, computed_field, model_validator
from typing import Optional, List, Any
from datetime import date
from uuid import UUID

from app.schemas.base import BaseSchema


class HotelInfoCreate(BaseModel):
    suggested_hotel_id: Optional[UUID] = None
    custom_hotel_name: Optional[str] = Field(None, max_length=200)
    custom_hotel_address: Optional[str] = None
    check_in_date: Optional[date] = None
    check_out_date: Optional[date] = None
    room_type: Optional[str] = Field(None, max_length=100)
    number_of_rooms: int = 1
    special_requests: Optional[str] = None
    booking_confirmation: Optional[str] = Field(None, max_length=200)


class HotelInfoUpdate(BaseModel):
    suggested_hotel_id: Optional[UUID] = None
    custom_hotel_name: Optional[str] = Field(None, max_length=200)
    custom_hotel_address: Optional[str] = None
    check_in_date: Optional[date] = None
    check_out_date: Optional[date] = None
    room_type: Optional[str] = Field(None, max_length=100)
    number_of_rooms: Optional[int] = None
    special_requests: Optional[str] = None
    booking_confirmation: Optional[str] = Field(None, max_length=200)


class HotelInfoResponse(BaseSchema):
    id: UUID
    guest_id: UUID
    suggested_hotel_id: Optional[UUID] = None
    custom_hotel_name: Optional[str] = None
    custom_hotel_address: Optional[str] = None
    check_in_date: Optional[date] = None
    check_out_date: Optional[date] = None
    room_type: Optional[str] = None
    number_of_rooms: int = 1
    special_requests: Optional[str] = None
    booking_confirmation: Optional[str] = None


class SuggestedHotelCreate(BaseModel):
    hotel_name: str = Field(..., min_length=1, max_length=200)
    address: Optional[str] = None
    website_url: Optional[str] = Field(None, max_length=500)
    phone: Optional[str] = Field(None, max_length=50)
    distance_from_venue: Optional[str] = Field(None, max_length=100)
    price_range: Optional[str] = Field(None, max_length=100)
    star_rating: Optional[int] = Field(None, ge=1, le=5)
    description: Optional[str] = None
    amenities: Optional[List[str]] = None
    image_urls: Optional[List[str]] = None
    booking_link: Optional[str] = Field(None, max_length=500)
    display_order: int = 0
    is_active: bool = True

    @model_validator(mode='before')
    @classmethod
    def accept_frontend_names(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if 'name' in data and 'hotel_name' not in data:
                data['hotel_name'] = data.pop('name')
            if 'website' in data and 'website_url' not in data:
                data['website_url'] = data.pop('website')
            if 'booking_url' in data and 'booking_link' not in data:
                data['booking_link'] = data.pop('booking_url')
            if 'image_url' in data and 'image_urls' not in data:
                val = data.pop('image_url')
                data['image_urls'] = [val] if val else None
            if 'notes' in data and 'description' not in data:
                data['description'] = data.pop('notes')
        return data


class SuggestedHotelUpdate(BaseModel):
    hotel_name: Optional[str] = Field(None, min_length=1, max_length=200)
    address: Optional[str] = None
    website_url: Optional[str] = Field(None, max_length=500)
    phone: Optional[str] = Field(None, max_length=50)
    distance_from_venue: Optional[str] = Field(None, max_length=100)
    price_range: Optional[str] = Field(None, max_length=100)
    star_rating: Optional[int] = Field(None, ge=1, le=5)
    description: Optional[str] = None
    amenities: Optional[List[str]] = None
    image_urls: Optional[List[str]] = None
    booking_link: Optional[str] = Field(None, max_length=500)
    display_order: Optional[int] = None
    is_active: Optional[bool] = None

    @model_validator(mode='before')
    @classmethod
    def accept_frontend_names(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if 'name' in data and 'hotel_name' not in data:
                data['hotel_name'] = data.pop('name')
            if 'website' in data and 'website_url' not in data:
                data['website_url'] = data.pop('website')
            if 'booking_url' in data and 'booking_link' not in data:
                data['booking_link'] = data.pop('booking_url')
            if 'image_url' in data and 'image_urls' not in data:
                val = data.pop('image_url')
                data['image_urls'] = [val] if val else None
            if 'notes' in data and 'description' not in data:
                data['description'] = data.pop('notes')
        return data


class SuggestedHotelResponse(BaseSchema):
    id: UUID
    wedding_id: UUID
    hotel_name: str
    address: Optional[str] = None
    website_url: Optional[str] = None
    phone: Optional[str] = None
    distance_from_venue: Optional[str] = None
    price_range: Optional[str] = None
    star_rating: Optional[int] = None
    description: Optional[str] = None
    amenities: Optional[List[str]] = None
    image_urls: Optional[List[str]] = None
    booking_link: Optional[str] = None
    display_order: int
    is_active: bool

    @computed_field
    @property
    def name(self) -> str:
        return self.hotel_name

    @computed_field
    @property
    def website(self) -> Optional[str]:
        return self.website_url

    @computed_field
    @property
    def booking_url(self) -> Optional[str]:
        return self.booking_link

    @computed_field
    @property
    def image_url(self) -> Optional[str]:
        return self.image_urls[0] if self.image_urls else None
