from pydantic import BaseModel, Field, computed_field
from typing import Optional
from datetime import datetime
from uuid import UUID

from app.schemas.base import BaseSchema, TimestampMixin


class InvitationBase(BaseModel):
    """Base schema for invitations."""
    guest_id: UUID
    event_id: UUID
    notes: Optional[str] = None


class InvitationCreate(InvitationBase):
    """Schema for creating an invitation."""
    pass


class InvitationUpdate(BaseModel):
    """Schema for updating an invitation."""
    is_sent: Optional[bool] = None
    sent_method: Optional[str] = Field(None, max_length=50)
    is_delivered: Optional[bool] = None
    is_opened: Optional[bool] = None
    notes: Optional[str] = None


class InvitationResponse(BaseSchema, TimestampMixin):
    """Schema for invitation response."""
    id: UUID
    guest_id: UUID
    event_id: UUID
    invitation_code: str
    is_sent: bool
    sent_date: Optional[datetime] = None
    sent_method: Optional[str] = None
    is_delivered: bool
    delivered_date: Optional[datetime] = None
    is_opened: bool
    opened_date: Optional[datetime] = None
    notes: Optional[str] = None
    guest_name: Optional[str] = None
    event_name: Optional[str] = None

    @computed_field
    @property
    def code(self) -> str:
        return self.invitation_code

    @computed_field
    @property
    def sent_at(self) -> Optional[str]:
        return self.sent_date.isoformat() if self.sent_date else None

    @computed_field
    @property
    def opened_at(self) -> Optional[str]:
        return self.opened_date.isoformat() if self.opened_date else None


class BulkInvitationCreate(BaseModel):
    """Schema for bulk invitation creation."""
    guest_ids: list[UUID]
    event_id: UUID


class InvitationMarkSent(BaseModel):
    """Schema for marking invitation as sent."""
    invitation_ids: list[UUID]
    sent_method: str = Field(..., max_length=50)  # email, whatsapp, physical
