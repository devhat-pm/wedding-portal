from pydantic import BaseModel, Field, computed_field, model_validator
from typing import Optional, Any, List
from datetime import datetime
from uuid import UUID

from app.schemas.base import BaseSchema


class ActivityCreate(BaseModel):
    activity_name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    event_day: Optional[int] = Field(None, ge=1)
    date_time: Optional[datetime] = None
    duration_minutes: Optional[int] = Field(None, ge=1)
    location: Optional[str] = Field(None, max_length=300)
    max_participants: Optional[int] = Field(None, ge=1)
    is_optional: bool = True
    requires_signup: bool = True
    image_url: Optional[str] = None
    notes: Optional[str] = None
    display_order: Optional[int] = None
    dress_code_info: Optional[str] = None
    dress_colors: Optional[List[Any]] = None
    food_description: Optional[str] = None
    dietary_options: Optional[List[str]] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

    @model_validator(mode='before')
    @classmethod
    def accept_frontend_names(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if 'title' in data and 'activity_name' not in data:
                data['activity_name'] = data.pop('title')
            if 'start_time' in data and 'date_time' not in data:
                data['date_time'] = data.pop('start_time')
            if 'capacity' in data and 'max_participants' not in data:
                data['max_participants'] = data.pop('capacity')
            if 'requires_registration' in data and 'requires_signup' not in data:
                data['requires_signup'] = data.pop('requires_registration')
        return data


class ActivityUpdate(BaseModel):
    activity_name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    event_day: Optional[int] = Field(None, ge=1)
    date_time: Optional[datetime] = None
    duration_minutes: Optional[int] = Field(None, ge=1)
    location: Optional[str] = Field(None, max_length=300)
    max_participants: Optional[int] = Field(None, ge=1)
    is_optional: Optional[bool] = None
    requires_signup: Optional[bool] = None
    image_url: Optional[str] = None
    notes: Optional[str] = None
    display_order: Optional[int] = None
    dress_code_info: Optional[str] = None
    dress_colors: Optional[List[Any]] = None
    food_description: Optional[str] = None
    dietary_options: Optional[List[str]] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

    @model_validator(mode='before')
    @classmethod
    def accept_frontend_names(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if 'title' in data and 'activity_name' not in data:
                data['activity_name'] = data.pop('title')
            if 'start_time' in data and 'date_time' not in data:
                data['date_time'] = data.pop('start_time')
            if 'capacity' in data and 'max_participants' not in data:
                data['max_participants'] = data.pop('capacity')
            if 'requires_registration' in data and 'requires_signup' not in data:
                data['requires_signup'] = data.pop('requires_registration')
        return data


class ActivityResponse(BaseSchema):
    id: UUID
    wedding_id: UUID
    activity_name: str
    description: Optional[str] = None
    event_day: Optional[int] = None
    date_time: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    location: Optional[str] = None
    max_participants: Optional[int] = None
    is_optional: bool
    requires_signup: bool
    image_url: Optional[str] = None
    notes: Optional[str] = None
    display_order: Optional[int] = None
    participant_count: int = 0
    dress_code_info: Optional[str] = None
    dress_colors: Optional[List[Any]] = None
    food_description: Optional[str] = None
    dietary_options: Optional[List[str]] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

    @computed_field
    @property
    def title(self) -> str:
        return self.activity_name

    @computed_field
    @property
    def start_time(self) -> Optional[str]:
        return self.date_time.isoformat() if self.date_time else None

    @computed_field
    @property
    def capacity(self) -> Optional[int]:
        return self.max_participants

    @computed_field
    @property
    def requires_registration(self) -> bool:
        return self.requires_signup


class GuestActivityRegister(BaseModel):
    activity_id: UUID
    number_of_participants: int = Field(default=1, ge=1)
    notes: Optional[str] = None


class GuestActivityResponse(BaseSchema):
    id: UUID
    guest_id: UUID
    activity_id: UUID
    number_of_participants: int
    notes: Optional[str] = None
    registered_at: Optional[datetime] = None
    activity: Optional[ActivityResponse] = None
