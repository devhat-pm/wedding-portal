from pydantic import BaseModel, Field, computed_field, model_validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID

from app.schemas.base import BaseSchema


class ColorPaletteItem(BaseModel):
    name: str
    hex: str

    @model_validator(mode='before')
    @classmethod
    def accept_frontend_names(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if 'color_name' in data and 'name' not in data:
                data['name'] = data.pop('color_name')
            if 'color_code' in data and 'hex' not in data:
                data['hex'] = data.pop('color_code')
        return data


class DressCodeCreate(BaseModel):
    event_name: str = Field(..., min_length=1, max_length=100)
    event_date: Optional[datetime] = None
    description: Optional[str] = None
    theme: Optional[str] = Field(None, max_length=200)
    color_palette: Optional[List[ColorPaletteItem]] = None
    dress_suggestions_men: Optional[str] = None
    dress_suggestions_women: Optional[str] = None
    image_urls: Optional[List[str]] = None
    notes: Optional[str] = None
    display_order: Optional[int] = None

    @model_validator(mode='before')
    @classmethod
    def accept_frontend_names(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if 'theme_description' in data:
                val = data.pop('theme_description')
                if 'theme' not in data and 'description' not in data:
                    data['theme'] = val
            if 'men_suggestions' in data and 'dress_suggestions_men' not in data:
                data['dress_suggestions_men'] = data.pop('men_suggestions')
            if 'women_suggestions' in data and 'dress_suggestions_women' not in data:
                data['dress_suggestions_women'] = data.pop('women_suggestions')
            if 'inspiration_images' in data and 'image_urls' not in data:
                data['image_urls'] = data.pop('inspiration_images')
        return data


class DressCodeUpdate(BaseModel):
    event_name: Optional[str] = Field(None, min_length=1, max_length=100)
    event_date: Optional[datetime] = None
    description: Optional[str] = None
    theme: Optional[str] = Field(None, max_length=200)
    color_palette: Optional[List[ColorPaletteItem]] = None
    dress_suggestions_men: Optional[str] = None
    dress_suggestions_women: Optional[str] = None
    image_urls: Optional[List[str]] = None
    notes: Optional[str] = None
    display_order: Optional[int] = None

    @model_validator(mode='before')
    @classmethod
    def accept_frontend_names(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if 'theme_description' in data:
                val = data.pop('theme_description')
                if 'theme' not in data and 'description' not in data:
                    data['theme'] = val
            if 'men_suggestions' in data and 'dress_suggestions_men' not in data:
                data['dress_suggestions_men'] = data.pop('men_suggestions')
            if 'women_suggestions' in data and 'dress_suggestions_women' not in data:
                data['dress_suggestions_women'] = data.pop('women_suggestions')
            if 'inspiration_images' in data and 'image_urls' not in data:
                data['image_urls'] = data.pop('inspiration_images')
        return data


class DressCodeResponse(BaseSchema):
    id: UUID
    wedding_id: UUID
    event_name: str
    event_date: Optional[datetime] = None
    description: Optional[str] = None
    theme: Optional[str] = None
    color_palette: Optional[List[Dict[str, Any]]] = None
    dress_suggestions_men: Optional[str] = None
    dress_suggestions_women: Optional[str] = None
    image_urls: Optional[List[str]] = None
    notes: Optional[str] = None
    display_order: Optional[int] = None

    @computed_field
    @property
    def theme_description(self) -> Optional[str]:
        parts = [p for p in [self.theme, self.description] if p]
        return " - ".join(parts) if parts else None

    @computed_field
    @property
    def men_suggestions(self) -> Optional[str]:
        return self.dress_suggestions_men

    @computed_field
    @property
    def women_suggestions(self) -> Optional[str]:
        return self.dress_suggestions_women

    @computed_field
    @property
    def inspiration_images(self) -> Optional[List[str]]:
        return self.image_urls


class GuestDressPreferenceCreate(BaseModel):
    dress_code_id: UUID
    planned_outfit_description: Optional[str] = None
    color_choice: Optional[str] = Field(None, max_length=50)
    needs_shopping_assistance: bool = False
    notes: Optional[str] = None


class GuestDressPreferenceUpdate(BaseModel):
    planned_outfit_description: Optional[str] = None
    color_choice: Optional[str] = Field(None, max_length=50)
    needs_shopping_assistance: Optional[bool] = None
    notes: Optional[str] = None


class GuestDressPreferenceResponse(BaseSchema):
    id: UUID
    guest_id: UUID
    dress_code_id: UUID
    planned_outfit_description: Optional[str] = None
    color_choice: Optional[str] = None
    needs_shopping_assistance: bool
    notes: Optional[str] = None
