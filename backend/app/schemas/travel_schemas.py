from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, datetime
from uuid import UUID

from app.schemas.base import BaseSchema


class TravelInfoCreate(BaseModel):
    arrival_date: Optional[date] = None
    arrival_time: Optional[str] = Field(None, max_length=20)
    arrival_flight_number: Optional[str] = Field(None, max_length=50)
    arrival_airport: Optional[str] = Field(None, max_length=200)
    departure_date: Optional[date] = None
    departure_time: Optional[str] = Field(None, max_length=20)
    departure_flight_number: Optional[str] = Field(None, max_length=50)
    needs_pickup: bool = False
    needs_dropoff: bool = False
    special_requirements: Optional[str] = None


class TravelInfoUpdate(BaseModel):
    arrival_date: Optional[date] = None
    arrival_time: Optional[str] = Field(None, max_length=20)
    arrival_flight_number: Optional[str] = Field(None, max_length=50)
    arrival_airport: Optional[str] = Field(None, max_length=200)
    departure_date: Optional[date] = None
    departure_time: Optional[str] = Field(None, max_length=20)
    departure_flight_number: Optional[str] = Field(None, max_length=50)
    needs_pickup: Optional[bool] = None
    needs_dropoff: Optional[bool] = None
    special_requirements: Optional[str] = None


class TravelInfoResponse(BaseSchema):
    id: UUID
    guest_id: UUID
    arrival_date: Optional[date] = None
    arrival_time: Optional[str] = None
    arrival_flight_number: Optional[str] = None
    arrival_airport: Optional[str] = None
    departure_date: Optional[date] = None
    departure_time: Optional[str] = None
    departure_flight_number: Optional[str] = None
    needs_pickup: bool
    needs_dropoff: bool
    special_requirements: Optional[str] = None
    updated_at: Optional[datetime] = None
