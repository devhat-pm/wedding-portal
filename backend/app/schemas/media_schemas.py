from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID
from enum import Enum

from app.schemas.base import BaseSchema
from app.schemas.common import PaginatedResponse


class FileTypeEnum(str, Enum):
    image = "image"
    video = "video"


class MediaUploadCreate(BaseModel):
    file_type: FileTypeEnum
    file_name: Optional[str] = Field(None, max_length=300)
    file_url: Optional[str] = Field(None, max_length=500)
    file_size: Optional[int] = None
    thumbnail_url: Optional[str] = Field(None, max_length=500)
    caption: Optional[str] = None
    event_tag: Optional[str] = Field(None, max_length=100)


class MediaUploadResponse(BaseSchema):
    id: UUID
    wedding_id: UUID
    guest_id: UUID
    file_type: FileTypeEnum
    file_name: Optional[str] = None
    file_url: Optional[str] = None
    file_size: Optional[int] = None
    thumbnail_url: Optional[str] = None
    caption: Optional[str] = None
    event_tag: Optional[str] = None
    is_approved: bool
    uploaded_at: Optional[datetime] = None
    approved_at: Optional[datetime] = None
    guest_name: Optional[str] = None


class MediaListResponse(PaginatedResponse[MediaUploadResponse]):
    pass


class MediaApprovalUpdate(BaseModel):
    is_approved: bool
