from pydantic import BaseModel, Field
from typing import Generic, TypeVar, Optional, Any, List
from datetime import datetime

T = TypeVar("T")


class PaginationParams(BaseModel):
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=20, ge=1, le=100)
    sort_by: Optional[str] = None
    sort_order: str = Field(default="desc", pattern="^(asc|desc)$")


class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    page_size: int
    total_pages: int
    has_next: bool
    has_previous: bool


class SuccessResponse(BaseModel):
    message: str
    data: Optional[Any] = None


class MessageResponse(BaseModel):
    message: str
    data: Optional[Any] = None


class ErrorResponse(BaseModel):
    detail: str
    error_code: Optional[str] = None


class HealthResponse(BaseModel):
    status: str
    timestamp: datetime
    version: str
    environment: str
