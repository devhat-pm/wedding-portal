import os
from typing import Optional, List
from uuid import UUID
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel, Field

from app.database import get_db
from app.models import (
    Guest, TravelInfo, HotelInfo, SuggestedHotel,
    GuestDressPreference, GuestFoodPreference, MealSizePreference,
    Activity, GuestActivity, MediaUpload, RSVPStatus
)
from app.schemas import SuccessResponse
from app.services.guest_service import (
    get_guest_by_token,
    get_complete_portal_data,
    validate_and_save_file
)
from app.config import settings

router = APIRouter(prefix="/api/guest", tags=["Guest Portal"])


# Request/Response schemas for guest endpoints
class RSVPUpdate(BaseModel):
    rsvp_status: str = Field(..., description="pending, attending, not_attending, maybe")
    phone: Optional[str] = None
    country: Optional[str] = None
    number_of_attendees: Optional[int] = Field(default=1, ge=1)
    special_requests: Optional[str] = None
    song_requests: Optional[str] = None
    notes_to_couple: Optional[str] = None
    activity_ids: Optional[List[str]] = None


class TravelInfoUpdate(BaseModel):
    arrival_date: Optional[str] = None
    arrival_time: Optional[str] = None
    arrival_flight_number: Optional[str] = None
    arrival_airport: Optional[str] = None
    departure_date: Optional[str] = None
    departure_time: Optional[str] = None
    departure_flight_number: Optional[str] = None
    needs_pickup: bool = False
    needs_dropoff: bool = False
    special_requirements: Optional[str] = None


class HotelInfoUpdate(BaseModel):
    suggested_hotel_id: Optional[UUID] = None
    custom_hotel_name: Optional[str] = None
    custom_hotel_address: Optional[str] = None
    check_in_date: Optional[str] = None
    check_out_date: Optional[str] = None
    room_type: Optional[str] = None
    number_of_rooms: int = 1
    special_requests: Optional[str] = None
    booking_confirmation: Optional[str] = None


class DressPreferenceUpdate(BaseModel):
    dress_code_id: UUID
    planned_outfit_description: Optional[str] = None
    color_choice: Optional[str] = None
    needs_shopping_assistance: bool = False
    notes: Optional[str] = None


class FoodPreferenceUpdate(BaseModel):
    dietary_restrictions: Optional[List[str]] = None
    allergies: Optional[str] = None
    cuisine_preferences: Optional[str] = None
    special_requests: Optional[str] = None
    meal_size_preference: Optional[str] = None


class ActivityRegistration(BaseModel):
    number_of_participants: int = Field(default=1, ge=1)
    notes: Optional[str] = None


class MediaUploadResponse(BaseModel):
    id: UUID
    file_name: str
    file_type: str
    file_url: str
    thumbnail_url: Optional[str] = None
    file_size: int
    is_approved: bool
    uploaded_at: datetime


@router.get("/{token}")
async def get_guest_portal(
    token: str,
    db: AsyncSession = Depends(get_db)
):
    """Get complete guest portal data in single response."""
    guest = await get_guest_by_token(token, db, update_last_accessed=True)
    portal_data = await get_complete_portal_data(guest, db)
    return portal_data


@router.put("/{token}/rsvp")
async def update_rsvp(
    token: str,
    data: RSVPUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update guest RSVP status and info."""
    guest = await get_guest_by_token(token, db)

    # Validate RSVP status
    try:
        rsvp_status = RSVPStatus(data.rsvp_status)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid RSVP status. Must be one of: pending, confirmed, declined, maybe"
        )

    guest.rsvp_status = rsvp_status
    guest.rsvp_submitted_at = datetime.utcnow()

    if data.phone is not None:
        guest.phone = data.phone
    if data.country is not None:
        guest.country_of_origin = data.country
    if data.number_of_attendees is not None:
        guest.number_of_attendees = data.number_of_attendees
    if data.special_requests is not None:
        guest.special_requests = data.special_requests
    if data.song_requests is not None:
        guest.song_requests = data.song_requests
    if data.notes_to_couple is not None:
        guest.notes_to_couple = data.notes_to_couple

    # Handle activity registrations
    if data.activity_ids is not None:
        # Clear existing registrations
        existing_result = await db.execute(
            select(GuestActivity).where(GuestActivity.guest_id == guest.id)
        )
        existing_registrations = existing_result.scalars().all()
        for reg in existing_registrations:
            await db.delete(reg)
        await db.flush()

        # Create new registrations
        for activity_id_str in data.activity_ids:
            try:
                activity_uuid = UUID(activity_id_str)
            except ValueError:
                continue

            # Verify activity exists and belongs to same wedding
            activity_result = await db.execute(
                select(Activity).where(
                    Activity.id == activity_uuid,
                    Activity.wedding_id == guest.wedding_id
                )
            )
            activity = activity_result.scalar_one_or_none()
            if activity:
                registration = GuestActivity(
                    guest_id=guest.id,
                    activity_id=activity_uuid,
                    number_of_participants=guest.number_of_attendees,
                    registered_at=datetime.utcnow()
                )
                db.add(registration)

    await db.flush()
    await db.refresh(guest)

    return {
        "id": str(guest.id),
        "full_name": guest.full_name,
        "rsvp_status": guest.rsvp_status.value,
        "phone": guest.phone,
        "country": guest.country_of_origin,
        "number_of_attendees": guest.number_of_attendees,
        "special_requests": guest.special_requests,
        "song_requests": guest.song_requests,
        "notes_to_couple": guest.notes_to_couple,
        "rsvp_submitted_at": guest.rsvp_submitted_at.isoformat() if guest.rsvp_submitted_at else None
    }


@router.put("/{token}/travel")
async def update_travel_info(
    token: str,
    data: TravelInfoUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Create or update travel information (upsert)."""
    guest = await get_guest_by_token(token, db)

    # Check if travel info exists
    result = await db.execute(
        select(TravelInfo).where(TravelInfo.guest_id == guest.id)
    )
    travel_info = result.scalar_one_or_none()

    # Parse dates
    from datetime import date
    arrival_date = None
    departure_date = None

    if data.arrival_date:
        try:
            arrival_date = date.fromisoformat(data.arrival_date)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid arrival_date format. Use YYYY-MM-DD"
            )

    if data.departure_date:
        try:
            departure_date = date.fromisoformat(data.departure_date)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid departure_date format. Use YYYY-MM-DD"
            )

    if travel_info:
        # Update existing
        travel_info.arrival_date = arrival_date
        travel_info.arrival_time = data.arrival_time
        travel_info.arrival_flight_number = data.arrival_flight_number
        travel_info.arrival_airport = data.arrival_airport
        travel_info.departure_date = departure_date
        travel_info.departure_time = data.departure_time
        travel_info.departure_flight_number = data.departure_flight_number
        travel_info.needs_pickup = data.needs_pickup
        travel_info.needs_dropoff = data.needs_dropoff
        travel_info.special_requirements = data.special_requirements
    else:
        # Create new
        travel_info = TravelInfo(
            guest_id=guest.id,
            arrival_date=arrival_date,
            arrival_time=data.arrival_time,
            arrival_flight_number=data.arrival_flight_number,
            arrival_airport=data.arrival_airport,
            departure_date=departure_date,
            departure_time=data.departure_time,
            departure_flight_number=data.departure_flight_number,
            needs_pickup=data.needs_pickup,
            needs_dropoff=data.needs_dropoff,
            special_requirements=data.special_requirements
        )
        db.add(travel_info)

    await db.flush()
    await db.refresh(travel_info)

    return {
        "id": str(travel_info.id),
        "arrival_date": travel_info.arrival_date.isoformat() if travel_info.arrival_date else None,
        "arrival_time": travel_info.arrival_time,
        "arrival_flight_number": travel_info.arrival_flight_number,
        "arrival_airport": travel_info.arrival_airport,
        "departure_date": travel_info.departure_date.isoformat() if travel_info.departure_date else None,
        "departure_time": travel_info.departure_time,
        "departure_flight_number": travel_info.departure_flight_number,
        "needs_pickup": travel_info.needs_pickup,
        "needs_dropoff": travel_info.needs_dropoff,
        "special_requirements": travel_info.special_requirements
    }


@router.put("/{token}/hotel")
async def update_hotel_info(
    token: str,
    data: HotelInfoUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Create or update hotel information (upsert)."""
    guest = await get_guest_by_token(token, db)

    # Validate suggested_hotel_id if provided
    if data.suggested_hotel_id:
        hotel_result = await db.execute(
            select(SuggestedHotel).where(
                SuggestedHotel.id == data.suggested_hotel_id,
                SuggestedHotel.wedding_id == guest.wedding_id
            )
        )
        if not hotel_result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Suggested hotel not found"
            )

    # Check if hotel info exists
    result = await db.execute(
        select(HotelInfo).where(HotelInfo.guest_id == guest.id)
    )
    hotel_info = result.scalar_one_or_none()

    # Parse dates
    from datetime import date
    check_in_date = None
    check_out_date = None

    if data.check_in_date:
        try:
            check_in_date = date.fromisoformat(data.check_in_date)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid check_in_date format. Use YYYY-MM-DD"
            )

    if data.check_out_date:
        try:
            check_out_date = date.fromisoformat(data.check_out_date)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid check_out_date format. Use YYYY-MM-DD"
            )

    if hotel_info:
        # Update existing
        hotel_info.suggested_hotel_id = data.suggested_hotel_id
        hotel_info.custom_hotel_name = data.custom_hotel_name
        hotel_info.custom_hotel_address = data.custom_hotel_address
        hotel_info.check_in_date = check_in_date
        hotel_info.check_out_date = check_out_date
        hotel_info.room_type = data.room_type
        hotel_info.number_of_rooms = data.number_of_rooms
        hotel_info.special_requests = data.special_requests
        hotel_info.booking_confirmation = data.booking_confirmation
    else:
        # Create new
        hotel_info = HotelInfo(
            guest_id=guest.id,
            suggested_hotel_id=data.suggested_hotel_id,
            custom_hotel_name=data.custom_hotel_name,
            custom_hotel_address=data.custom_hotel_address,
            check_in_date=check_in_date,
            check_out_date=check_out_date,
            room_type=data.room_type,
            number_of_rooms=data.number_of_rooms,
            special_requests=data.special_requests,
            booking_confirmation=data.booking_confirmation
        )
        db.add(hotel_info)

    await db.flush()
    await db.refresh(hotel_info)

    return {
        "id": str(hotel_info.id),
        "suggested_hotel_id": str(hotel_info.suggested_hotel_id) if hotel_info.suggested_hotel_id else None,
        "custom_hotel_name": hotel_info.custom_hotel_name,
        "custom_hotel_address": hotel_info.custom_hotel_address,
        "check_in_date": hotel_info.check_in_date.isoformat() if hotel_info.check_in_date else None,
        "check_out_date": hotel_info.check_out_date.isoformat() if hotel_info.check_out_date else None,
        "room_type": hotel_info.room_type,
        "number_of_rooms": hotel_info.number_of_rooms,
        "special_requests": hotel_info.special_requests,
        "booking_confirmation": hotel_info.booking_confirmation
    }


@router.put("/{token}/dress-preference")
async def update_dress_preference(
    token: str,
    data: DressPreferenceUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Create or update dress preference for specific event (upsert)."""
    guest = await get_guest_by_token(token, db)

    # Check if dress preference exists for this guest + dress_code
    result = await db.execute(
        select(GuestDressPreference).where(
            GuestDressPreference.guest_id == guest.id,
            GuestDressPreference.dress_code_id == data.dress_code_id
        )
    )
    dress_pref = result.scalar_one_or_none()

    if dress_pref:
        # Update existing
        dress_pref.planned_outfit_description = data.planned_outfit_description
        dress_pref.color_choice = data.color_choice
        dress_pref.needs_shopping_assistance = data.needs_shopping_assistance
        dress_pref.notes = data.notes
    else:
        # Create new
        dress_pref = GuestDressPreference(
            guest_id=guest.id,
            dress_code_id=data.dress_code_id,
            planned_outfit_description=data.planned_outfit_description,
            color_choice=data.color_choice,
            needs_shopping_assistance=data.needs_shopping_assistance,
            notes=data.notes
        )
        db.add(dress_pref)

    await db.flush()
    await db.refresh(dress_pref)

    return {
        "id": str(dress_pref.id),
        "dress_code_id": str(dress_pref.dress_code_id),
        "planned_outfit_description": dress_pref.planned_outfit_description,
        "color_choice": dress_pref.color_choice,
        "needs_shopping_assistance": dress_pref.needs_shopping_assistance,
        "notes": dress_pref.notes
    }


@router.put("/{token}/food-preference")
async def update_food_preference(
    token: str,
    data: FoodPreferenceUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Create or update food preferences (upsert)."""
    guest = await get_guest_by_token(token, db)

    # Parse meal size preference
    meal_size = None
    if data.meal_size_preference:
        try:
            meal_size = MealSizePreference(data.meal_size_preference)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid meal_size_preference. Must be one of: small, regular, large"
            )

    # Check if food preference exists
    result = await db.execute(
        select(GuestFoodPreference).where(GuestFoodPreference.guest_id == guest.id)
    )
    food_pref = result.scalar_one_or_none()

    if food_pref:
        # Update existing
        food_pref.dietary_restrictions = data.dietary_restrictions
        food_pref.allergies = data.allergies
        food_pref.cuisine_preferences = data.cuisine_preferences
        food_pref.special_requests = data.special_requests
        food_pref.meal_size_preference = meal_size
    else:
        # Create new
        food_pref = GuestFoodPreference(
            guest_id=guest.id,
            dietary_restrictions=data.dietary_restrictions,
            allergies=data.allergies,
            cuisine_preferences=data.cuisine_preferences,
            special_requests=data.special_requests,
            meal_size_preference=meal_size
        )
        db.add(food_pref)

    await db.flush()
    await db.refresh(food_pref)

    return {
        "id": str(food_pref.id),
        "dietary_restrictions": food_pref.dietary_restrictions,
        "allergies": food_pref.allergies,
        "cuisine_preferences": food_pref.cuisine_preferences,
        "special_requests": food_pref.special_requests,
        "meal_size_preference": food_pref.meal_size_preference.value if food_pref.meal_size_preference else None
    }


@router.post("/{token}/activities/{activity_id}/register")
async def register_for_activity(
    token: str,
    activity_id: UUID,
    data: ActivityRegistration,
    db: AsyncSession = Depends(get_db)
):
    """Register for an activity."""
    guest = await get_guest_by_token(token, db)

    # Get activity
    activity_result = await db.execute(
        select(Activity).where(
            Activity.id == activity_id,
            Activity.wedding_id == guest.wedding_id
        )
    )
    activity = activity_result.scalar_one_or_none()

    if not activity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Activity not found"
        )

    # Check if already registered
    existing_result = await db.execute(
        select(GuestActivity).where(
            GuestActivity.guest_id == guest.id,
            GuestActivity.activity_id == activity_id
        )
    )
    if existing_result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already registered for this activity"
        )

    # Check max participants if set
    if activity.max_participants:
        count_result = await db.execute(
            select(func.sum(GuestActivity.number_of_participants))
            .where(GuestActivity.activity_id == activity_id)
        )
        current_count = count_result.scalar() or 0

        if current_count + data.number_of_participants > activity.max_participants:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Activity is full. Maximum {activity.max_participants} participants allowed."
            )

    # Create registration
    registration = GuestActivity(
        guest_id=guest.id,
        activity_id=activity_id,
        number_of_participants=data.number_of_participants,
        notes=data.notes,
        registered_at=datetime.utcnow()
    )
    db.add(registration)
    await db.flush()
    await db.refresh(registration)

    return {
        "id": str(registration.id),
        "activity_id": str(activity_id),
        "activity_name": activity.activity_name,
        "number_of_participants": registration.number_of_participants,
        "notes": registration.notes,
        "registered_at": registration.registered_at.isoformat()
    }


@router.delete("/{token}/activities/{activity_id}/unregister")
async def unregister_from_activity(
    token: str,
    activity_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Remove activity registration."""
    guest = await get_guest_by_token(token, db)

    # Find registration
    result = await db.execute(
        select(GuestActivity).where(
            GuestActivity.guest_id == guest.id,
            GuestActivity.activity_id == activity_id
        )
    )
    registration = result.scalar_one_or_none()

    if not registration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registration not found"
        )

    await db.delete(registration)
    await db.flush()

    return SuccessResponse(message="Successfully unregistered from activity")


@router.post("/{token}/media/upload")
async def upload_media(
    token: str,
    file: UploadFile = File(...),
    caption: Optional[str] = Form(None),
    event_tag: Optional[str] = Form(None),
    db: AsyncSession = Depends(get_db)
):
    """Upload image or video file."""
    guest = await get_guest_by_token(token, db)

    # Validate and save file
    file_url, file_type, file_size, thumbnail_url = await validate_and_save_file(
        file=file,
        wedding_id=guest.wedding_id,
        guest_id=guest.id
    )

    # Create media upload record
    media = MediaUpload(
        wedding_id=guest.wedding_id,
        guest_id=guest.id,
        file_name=file.filename or "unknown",
        file_type=file_type,
        file_url=file_url,
        thumbnail_url=thumbnail_url,
        file_size=file_size,
        caption=caption,
        event_tag=event_tag,
        is_approved=False,
        uploaded_at=datetime.utcnow()
    )
    db.add(media)
    await db.flush()
    await db.refresh(media)

    return {
        "id": str(media.id),
        "file_name": media.file_name,
        "file_type": media.file_type.value,
        "file_url": media.file_url,
        "thumbnail_url": media.thumbnail_url,
        "file_size": media.file_size,
        "caption": media.caption,
        "event_tag": media.event_tag,
        "is_approved": media.is_approved,
        "uploaded_at": media.uploaded_at.isoformat()
    }


@router.get("/{token}/media")
async def list_guest_media(
    token: str,
    db: AsyncSession = Depends(get_db)
):
    """List guest's own uploads."""
    guest = await get_guest_by_token(token, db, update_last_accessed=False)

    result = await db.execute(
        select(MediaUpload)
        .where(MediaUpload.guest_id == guest.id)
        .order_by(MediaUpload.uploaded_at.desc())
    )
    media_items = result.scalars().all()

    return {
        "items": [
            {
                "id": str(m.id),
                "file_name": m.file_name,
                "file_type": m.file_type.value if m.file_type else None,
                "file_url": m.file_url,
                "thumbnail_url": m.thumbnail_url,
                "file_size": m.file_size,
                "caption": m.caption,
                "event_tag": m.event_tag,
                "is_approved": m.is_approved,
                "uploaded_at": m.uploaded_at.isoformat() if m.uploaded_at else None
            }
            for m in media_items
        ],
        "total": len(media_items)
    }


@router.delete("/{token}/media/{media_id}")
async def delete_guest_media(
    token: str,
    media_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Delete guest's own upload only."""
    guest = await get_guest_by_token(token, db)

    # Find media - must belong to this guest
    result = await db.execute(
        select(MediaUpload).where(
            MediaUpload.id == media_id,
            MediaUpload.guest_id == guest.id
        )
    )
    media = result.scalar_one_or_none()

    if not media:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Media not found or you don't have permission to delete it"
        )

    # Delete file from disk
    if media.file_url:
        file_path = os.path.join(settings.UPLOAD_DIR, media.file_url.lstrip("/uploads/"))
        if os.path.exists(file_path):
            os.remove(file_path)

    if media.thumbnail_url:
        thumb_path = os.path.join(settings.UPLOAD_DIR, media.thumbnail_url.lstrip("/uploads/"))
        if os.path.exists(thumb_path):
            os.remove(thumb_path)

    await db.delete(media)
    await db.flush()

    return SuccessResponse(message="Media deleted successfully")
