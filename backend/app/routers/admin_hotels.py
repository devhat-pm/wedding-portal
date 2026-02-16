from typing import List, Optional, Any
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from pydantic import BaseModel, model_validator

from app.database import get_db
from app.models import Wedding, SuggestedHotel
from app.schemas import (
    SuggestedHotelCreate,
    SuggestedHotelUpdate,
    SuggestedHotelResponse,
    SuccessResponse
)
from app.utils.auth import get_current_wedding

router = APIRouter(prefix="/api/admin/hotels", tags=["Admin Hotels"])


class ReorderItem(BaseModel):
    hotel_id: UUID
    display_order: int


class ReorderRequest(BaseModel):
    items: Optional[List[ReorderItem]] = None
    hotel_ids: Optional[List[UUID]] = None

    @model_validator(mode='before')
    @classmethod
    def accept_hotel_ids_format(cls, data: Any) -> Any:
        """Accept both {items: [...]} and {hotel_ids: [...]} formats."""
        if isinstance(data, dict):
            if 'hotel_ids' in data and 'items' not in data:
                hotel_ids = data.get('hotel_ids', [])
                data['items'] = [
                    {'hotel_id': hid, 'display_order': idx}
                    for idx, hid in enumerate(hotel_ids)
                ]
        return data


@router.post("/", response_model=SuggestedHotelResponse, status_code=status.HTTP_201_CREATED)
async def create_hotel(
    data: SuggestedHotelCreate,
    wedding: Wedding = Depends(get_current_wedding),
    db: AsyncSession = Depends(get_db)
):
    """Add suggested hotel."""
    hotel = SuggestedHotel(
        wedding_id=wedding.id,
        hotel_name=data.hotel_name,
        address=data.address,
        website_url=data.website_url,
        phone=data.phone,
        distance_from_venue=data.distance_from_venue,
        price_range=data.price_range,
        star_rating=data.star_rating,
        description=data.description,
        amenities=data.amenities,
        image_urls=data.image_urls,
        booking_link=data.booking_link,
        display_order=data.display_order,
        is_active=data.is_active
    )

    db.add(hotel)
    await db.flush()
    await db.refresh(hotel)

    return SuggestedHotelResponse.model_validate(hotel)


@router.get("/", response_model=List[SuggestedHotelResponse])
async def list_hotels(
    wedding: Wedding = Depends(get_current_wedding),
    db: AsyncSession = Depends(get_db)
):
    """List all suggested hotels."""
    result = await db.execute(
        select(SuggestedHotel)
        .where(SuggestedHotel.wedding_id == wedding.id)
        .order_by(SuggestedHotel.display_order)
    )
    hotels = result.scalars().all()

    return [SuggestedHotelResponse.model_validate(h) for h in hotels]


@router.put("/{hotel_id}", response_model=SuggestedHotelResponse)
async def update_hotel(
    hotel_id: UUID,
    data: SuggestedHotelUpdate,
    wedding: Wedding = Depends(get_current_wedding),
    db: AsyncSession = Depends(get_db)
):
    """Update hotel."""
    result = await db.execute(
        select(SuggestedHotel).where(
            SuggestedHotel.id == hotel_id,
            SuggestedHotel.wedding_id == wedding.id
        )
    )
    hotel = result.scalar_one_or_none()

    if not hotel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hotel not found"
        )

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(hotel, field, value)

    await db.flush()
    await db.refresh(hotel)

    return SuggestedHotelResponse.model_validate(hotel)


@router.delete("/{hotel_id}", response_model=SuccessResponse)
async def delete_hotel(
    hotel_id: UUID,
    wedding: Wedding = Depends(get_current_wedding),
    db: AsyncSession = Depends(get_db)
):
    """Remove hotel."""
    result = await db.execute(
        select(SuggestedHotel).where(
            SuggestedHotel.id == hotel_id,
            SuggestedHotel.wedding_id == wedding.id
        )
    )
    hotel = result.scalar_one_or_none()

    if not hotel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hotel not found"
        )

    await db.delete(hotel)
    await db.flush()

    return SuccessResponse(message="Hotel deleted successfully")


@router.put("/reorder", response_model=SuccessResponse)
async def reorder_hotels(
    data: ReorderRequest,
    wedding: Wedding = Depends(get_current_wedding),
    db: AsyncSession = Depends(get_db)
):
    """Update display order of hotels."""
    for item in data.items:
        await db.execute(
            update(SuggestedHotel)
            .where(
                SuggestedHotel.id == item.hotel_id,
                SuggestedHotel.wedding_id == wedding.id
            )
            .values(display_order=item.display_order)
        )

    await db.flush()

    return SuccessResponse(message="Hotels reordered successfully")
