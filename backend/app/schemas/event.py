from pydantic import BaseModel, Field, computed_field, model_validator
from typing import Optional, Any
from datetime import datetime
from uuid import UUID

from app.schemas.base import BaseSchema, TimestampMixin


class EventBase(BaseModel):
    """Base schema for events."""
    name: str = Field(..., min_length=1, max_length=255)
    name_arabic: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    description_arabic: Optional[str] = None
    event_type: str = Field(default="reception", max_length=50)
    start_datetime: datetime
    end_datetime: Optional[datetime] = None
    venue_name: Optional[str] = Field(None, max_length=255)
    venue_name_arabic: Optional[str] = Field(None, max_length=255)
    address: Optional[str] = None
    address_arabic: Optional[str] = None
    city: Optional[str] = Field(None, max_length=100)
    country: Optional[str] = Field(None, max_length=100)
    map_url: Optional[str] = None
    max_capacity: Optional[int] = Field(None, ge=1)
    dress_code: Optional[str] = Field(None, max_length=100)
    dress_code_arabic: Optional[str] = Field(None, max_length=100)
    is_main_event: bool = False

    @model_validator(mode='before')
    @classmethod
    def accept_frontend_names(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if 'title' in data and 'name' not in data:
                data['name'] = data.pop('title')
        return data


class EventCreate(EventBase):
    """Schema for creating an event."""
    pass


class EventUpdate(BaseModel):
    """Schema for updating an event."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    name_arabic: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    description_arabic: Optional[str] = None
    event_type: Optional[str] = Field(None, max_length=50)
    start_datetime: Optional[datetime] = None
    end_datetime: Optional[datetime] = None
    venue_name: Optional[str] = Field(None, max_length=255)
    venue_name_arabic: Optional[str] = Field(None, max_length=255)
    address: Optional[str] = None
    address_arabic: Optional[str] = None
    city: Optional[str] = Field(None, max_length=100)
    country: Optional[str] = Field(None, max_length=100)
    map_url: Optional[str] = None
    max_capacity: Optional[int] = Field(None, ge=1)
    dress_code: Optional[str] = Field(None, max_length=100)
    dress_code_arabic: Optional[str] = Field(None, max_length=100)
    is_main_event: Optional[bool] = None
    is_active: Optional[bool] = None
    cover_image: Optional[str] = None

    @model_validator(mode='before')
    @classmethod
    def accept_frontend_names(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if 'title' in data and 'name' not in data:
                data['name'] = data.pop('title')
        return data


class EventResponse(BaseSchema, TimestampMixin):
    """Schema for event response."""
    id: UUID
    name: str
    name_arabic: Optional[str] = None
    description: Optional[str] = None
    description_arabic: Optional[str] = None
    event_type: str
    start_datetime: datetime
    end_datetime: Optional[datetime] = None
    venue_name: Optional[str] = None
    venue_name_arabic: Optional[str] = None
    address: Optional[str] = None
    address_arabic: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    map_url: Optional[str] = None
    max_capacity: Optional[int] = None
    dress_code: Optional[str] = None
    dress_code_arabic: Optional[str] = None
    is_main_event: bool
    is_active: bool
    cover_image: Optional[str] = None
    is_upcoming: bool
    confirmed_guests_count: int = 0
    total_invitations: int = 0

    @computed_field
    @property
    def title(self) -> str:
        return self.name

    @computed_field
    @property
    def cover_image_url(self) -> Optional[str]:
        return self.cover_image
