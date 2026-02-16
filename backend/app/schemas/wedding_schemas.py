from pydantic import BaseModel, Field, EmailStr, field_validator
from typing import Optional
from datetime import datetime
from uuid import UUID

from app.schemas.base import BaseSchema, TimestampMixin


class WeddingCreate(BaseModel):
    couple_names: str = Field(..., min_length=1, max_length=200)
    wedding_date: datetime
    venue_name: Optional[str] = Field(None, max_length=300)
    venue_address: Optional[str] = None
    venue_city: Optional[str] = Field(None, max_length=100)
    venue_country: Optional[str] = Field(None, max_length=100)
    welcome_message: Optional[str] = None
    cover_image_url: Optional[str] = None
    admin_email: EmailStr
    admin_password: str = Field(..., min_length=8)

    @field_validator('wedding_date', mode='after')
    @classmethod
    def strip_timezone(cls, v: datetime) -> datetime:
        if v and v.tzinfo is not None:
            return v.replace(tzinfo=None)
        return v


class WeddingUpdate(BaseModel):
    couple_names: Optional[str] = Field(None, min_length=1, max_length=200)
    wedding_date: Optional[datetime] = None
    venue_name: Optional[str] = Field(None, max_length=300)
    venue_address: Optional[str] = None
    venue_city: Optional[str] = Field(None, max_length=100)
    venue_country: Optional[str] = Field(None, max_length=100)
    welcome_message: Optional[str] = None
    cover_image_url: Optional[str] = None
    is_active: Optional[bool] = None

    @field_validator('wedding_date', mode='after')
    @classmethod
    def strip_timezone(cls, v: Optional[datetime]) -> Optional[datetime]:
        if v and v.tzinfo is not None:
            return v.replace(tzinfo=None)
        return v


class WeddingResponse(BaseSchema, TimestampMixin):
    id: UUID
    couple_names: str
    wedding_date: datetime
    venue_name: Optional[str] = None
    venue_address: Optional[str] = None
    venue_city: Optional[str] = None
    venue_country: Optional[str] = None
    welcome_message: Optional[str] = None
    cover_image_url: Optional[str] = None
    admin_email: str
    is_active: bool
    theme_color_primary: Optional[str] = None
    theme_color_secondary: Optional[str] = None


class WeddingPublicInfo(BaseSchema):
    couple_names: str
    wedding_date: datetime
    venue_name: Optional[str] = None
    venue_address: Optional[str] = None
    venue_city: Optional[str] = None
    venue_country: Optional[str] = None
    welcome_message: Optional[str] = None
    cover_image_url: Optional[str] = None
    theme_color_primary: Optional[str] = None
    theme_color_secondary: Optional[str] = None


class AdminLoginRequest(BaseModel):
    email: EmailStr
    password: str


class AdminLoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    wedding_id: UUID
    admin_id: UUID
