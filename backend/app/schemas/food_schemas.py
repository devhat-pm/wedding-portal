from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from uuid import UUID
from enum import Enum

from app.schemas.base import BaseSchema


class MealSizePreferenceEnum(str, Enum):
    regular = "regular"
    small = "small"
    large = "large"


class MenuItemCategory(BaseModel):
    starters: Optional[List[str]] = None
    mains: Optional[List[str]] = None
    desserts: Optional[List[str]] = None
    beverages: Optional[List[str]] = None


class FoodMenuCreate(BaseModel):
    event_name: Optional[str] = Field(None, max_length=100)
    menu_items: Optional[Dict[str, List[str]]] = None
    dietary_options_available: Optional[List[str]] = None
    notes: Optional[str] = None


class FoodMenuUpdate(BaseModel):
    event_name: Optional[str] = Field(None, max_length=100)
    menu_items: Optional[Dict[str, List[str]]] = None
    dietary_options_available: Optional[List[str]] = None
    notes: Optional[str] = None


class FoodMenuResponse(BaseSchema):
    id: UUID
    wedding_id: UUID
    event_name: Optional[str] = None
    menu_items: Optional[Dict[str, Any]] = None
    dietary_options_available: Optional[List[str]] = None
    notes: Optional[str] = None


class GuestFoodPreferenceCreate(BaseModel):
    dietary_restrictions: Optional[List[str]] = None
    allergies: Optional[str] = None
    cuisine_preferences: Optional[str] = None
    special_requests: Optional[str] = None
    meal_size_preference: Optional[MealSizePreferenceEnum] = None


class GuestFoodPreferenceUpdate(BaseModel):
    dietary_restrictions: Optional[List[str]] = None
    allergies: Optional[str] = None
    cuisine_preferences: Optional[str] = None
    special_requests: Optional[str] = None
    meal_size_preference: Optional[MealSizePreferenceEnum] = None


class GuestFoodPreferenceResponse(BaseSchema):
    id: UUID
    guest_id: UUID
    dietary_restrictions: Optional[List[str]] = None
    allergies: Optional[str] = None
    cuisine_preferences: Optional[str] = None
    special_requests: Optional[str] = None
    meal_size_preference: Optional[MealSizePreferenceEnum] = None
