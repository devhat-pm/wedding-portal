from pydantic import BaseModel, Field, EmailStr, field_validator
from typing import Optional
from datetime import datetime
from uuid import UUID
from enum import Enum


class RSVPStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    DECLINED = "declined"
    TENTATIVE = "tentative"


class GuestSide(str, Enum):
    BRIDE = "bride"
    GROOM = "groom"
    BOTH = "both"


class GuestRelation(str, Enum):
    FAMILY = "family"
    FRIEND = "friend"
    COLLEAGUE = "colleague"
    NEIGHBOR = "neighbor"
    OTHER = "other"


# Guest Group Schemas
class GuestGroupBase(BaseModel):
    """Base schema for guest groups."""
    name: str = Field(..., min_length=1, max_length=255)
    name_arabic: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    color: Optional[str] = Field(None, pattern="^#[0-9A-Fa-f]{6}$")


class GuestGroupCreate(GuestGroupBase):
    """Schema for creating a guest group."""
    pass


class GuestGroupUpdate(BaseModel):
    """Schema for updating a guest group."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    name_arabic: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    color: Optional[str] = Field(None, pattern="^#[0-9A-Fa-f]{6}$")


class GuestGroupResponse(GuestGroupBase):
    """Schema for guest group response."""
    id: UUID
    created_at: datetime
    updated_at: datetime
    guest_count: int = 0

    class Config:
        from_attributes = True


# Guest Schemas
class GuestBase(BaseModel):
    """Base schema for guests."""
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    first_name_arabic: Optional[str] = Field(None, max_length=100)
    last_name_arabic: Optional[str] = Field(None, max_length=100)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=20)
    side: GuestSide = GuestSide.BOTH
    relation: GuestRelation = GuestRelation.OTHER


class GuestCreate(GuestBase):
    """Schema for creating a guest."""
    rsvp_status: RSVPStatus = RSVPStatus.PENDING
    plus_one_allowed: bool = False
    plus_one_name: Optional[str] = Field(None, max_length=200)
    children_count: int = Field(default=0, ge=0)
    children_names: Optional[str] = None
    table_number: Optional[int] = Field(None, ge=1)
    seat_number: Optional[int] = Field(None, ge=1)
    dietary_restrictions: Optional[str] = None
    special_requests: Optional[str] = None
    is_vip: bool = False
    vip_notes: Optional[str] = None
    notes: Optional[str] = None
    group_id: Optional[UUID] = None


class GuestUpdate(BaseModel):
    """Schema for updating a guest."""
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    first_name_arabic: Optional[str] = Field(None, max_length=100)
    last_name_arabic: Optional[str] = Field(None, max_length=100)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=20)
    side: Optional[GuestSide] = None
    relation: Optional[GuestRelation] = None
    rsvp_status: Optional[RSVPStatus] = None
    plus_one_allowed: Optional[bool] = None
    plus_one_name: Optional[str] = Field(None, max_length=200)
    plus_one_confirmed: Optional[bool] = None
    children_count: Optional[int] = Field(None, ge=0)
    children_names: Optional[str] = None
    table_number: Optional[int] = Field(None, ge=1)
    seat_number: Optional[int] = Field(None, ge=1)
    dietary_restrictions: Optional[str] = None
    special_requests: Optional[str] = None
    is_vip: Optional[bool] = None
    vip_notes: Optional[str] = None
    notes: Optional[str] = None
    group_id: Optional[UUID] = None


class GuestResponse(GuestBase):
    """Schema for guest response."""
    id: UUID
    rsvp_status: RSVPStatus
    rsvp_date: Optional[datetime] = None
    plus_one_allowed: bool
    plus_one_name: Optional[str] = None
    plus_one_confirmed: bool
    children_count: int
    children_names: Optional[str] = None
    table_number: Optional[int] = None
    seat_number: Optional[int] = None
    dietary_restrictions: Optional[str] = None
    special_requests: Optional[str] = None
    is_vip: bool
    vip_notes: Optional[str] = None
    notes: Optional[str] = None
    group_id: Optional[UUID] = None
    group: Optional[GuestGroupResponse] = None
    created_at: datetime
    updated_at: datetime
    full_name: str
    full_name_arabic: Optional[str] = None
    total_guests: int

    class Config:
        from_attributes = True


class GuestListResponse(BaseModel):
    """Schema for guest list response (minimal)."""
    id: UUID
    first_name: str
    last_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    side: GuestSide
    relation: GuestRelation
    rsvp_status: RSVPStatus
    is_vip: bool
    table_number: Optional[int] = None
    total_guests: int
    group_id: Optional[UUID] = None

    class Config:
        from_attributes = True


class BulkRSVPUpdate(BaseModel):
    """Schema for bulk RSVP update."""
    guest_ids: list[UUID]
    rsvp_status: RSVPStatus


class GuestImportRow(BaseModel):
    """Schema for importing guests from Excel."""
    first_name: str
    last_name: str
    first_name_arabic: Optional[str] = None
    last_name_arabic: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    side: Optional[str] = "both"
    relation: Optional[str] = "other"
    is_vip: Optional[bool] = False
    plus_one_allowed: Optional[bool] = False
    notes: Optional[str] = None
