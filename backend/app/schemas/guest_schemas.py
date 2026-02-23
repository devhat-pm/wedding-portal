from pydantic import BaseModel, Field, EmailStr, computed_field, model_validator
from typing import Optional, List, Any
from datetime import datetime
from uuid import UUID
from enum import Enum

from app.schemas.base import BaseSchema, TimestampMixin
from app.schemas.common import PaginatedResponse


class RSVPStatusEnum(str, Enum):
    pending = "pending"
    confirmed = "confirmed"
    declined = "declined"
    maybe = "maybe"


class GuestCreate(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=200)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=50)
    country_of_origin: Optional[str] = Field(None, max_length=100)

    @model_validator(mode='before')
    @classmethod
    def accept_frontend_names(cls, data: Any) -> Any:
        if isinstance(data, dict):
            # Accept first_name + last_name and combine into full_name
            if 'full_name' not in data and ('first_name' in data or 'last_name' in data):
                first = data.pop('first_name', '') or ''
                last = data.pop('last_name', '') or ''
                data['full_name'] = f"{first} {last}".strip()
            if 'country' in data and 'country_of_origin' not in data:
                data['country_of_origin'] = data.pop('country')
            if 'number_of_guests' in data and 'number_of_attendees' not in data:
                data['number_of_attendees'] = data.pop('number_of_guests')
        return data


class GuestBulkUpload(BaseModel):
    file_name: str
    content_type: str


class GuestResponse(BaseSchema, TimestampMixin):
    id: UUID
    wedding_id: UUID
    unique_token: str
    full_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    country_of_origin: Optional[str] = None
    rsvp_status: RSVPStatusEnum
    number_of_attendees: int
    special_requests: Optional[str] = None
    rsvp_submitted_at: Optional[datetime] = None
    last_accessed_at: Optional[datetime] = None
    has_travel_info: bool = False
    has_hotel_info: bool = False

    @computed_field
    @property
    def first_name(self) -> str:
        parts = self.full_name.split(' ', 1)
        return parts[0]

    @computed_field
    @property
    def last_name(self) -> str:
        parts = self.full_name.split(' ', 1)
        return parts[1] if len(parts) > 1 else ''

    @computed_field
    @property
    def country(self) -> Optional[str]:
        return self.country_of_origin

    @computed_field
    @property
    def number_of_guests(self) -> int:
        return self.number_of_attendees


class GuestPublicResponse(BaseSchema):
    id: UUID
    full_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    country_of_origin: Optional[str] = None
    rsvp_status: RSVPStatusEnum
    number_of_attendees: int
    special_requests: Optional[str] = None


class GuestRSVPUpdate(BaseModel):
    rsvp_status: RSVPStatusEnum
    number_of_attendees: int = Field(default=1, ge=1)
    phone: Optional[str] = Field(None, max_length=50)
    country_of_origin: Optional[str] = Field(None, max_length=100)
    special_requests: Optional[str] = None
    song_requests: Optional[str] = None
    notes_to_couple: Optional[str] = None
    activity_ids: Optional[List[str]] = None


class GuestListResponse(PaginatedResponse[GuestResponse]):
    pass
