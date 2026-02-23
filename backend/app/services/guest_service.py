import os
import uuid as uuid_lib
import aiofiles
from typing import Optional, Tuple
from datetime import datetime
from uuid import UUID
from fastapi import UploadFile, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.models import (
    Guest, Wedding, TravelInfo, HotelInfo, SuggestedHotel,
    DressCode, GuestDressPreference, FoodMenu, GuestFoodPreference,
    Activity, GuestActivity, MediaUpload, FileType
)
from app.config import settings


async def get_guest_by_token(
    token: str,
    db: AsyncSession,
    update_last_accessed: bool = True
) -> Guest:
    """Fetch guest by unique token with validation."""
    result = await db.execute(
        select(Guest)
        .options(selectinload(Guest.wedding))
        .where(Guest.unique_token == token)
    )
    guest = result.scalar_one_or_none()

    if not guest:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid guest token"
        )

    if update_last_accessed:
        guest.last_accessed_at = datetime.utcnow()
        await db.flush()

    return guest


async def get_complete_portal_data(guest: Guest, db: AsyncSession) -> dict:
    """Aggregate all data for guest portal view."""
    wedding_id = guest.wedding_id
    guest_id = guest.id

    # Get wedding public info
    wedding = guest.wedding

    # Get travel info
    travel_result = await db.execute(
        select(TravelInfo).where(TravelInfo.guest_id == guest_id)
    )
    travel_info = travel_result.scalar_one_or_none()

    # Get hotel info
    hotel_result = await db.execute(
        select(HotelInfo)
        .options(selectinload(HotelInfo.suggested_hotel))
        .where(HotelInfo.guest_id == guest_id)
    )
    hotel_info = hotel_result.scalar_one_or_none()

    # Get suggested hotels
    hotels_result = await db.execute(
        select(SuggestedHotel)
        .where(SuggestedHotel.wedding_id == wedding_id)
        .order_by(SuggestedHotel.display_order, SuggestedHotel.hotel_name)
    )
    suggested_hotels = hotels_result.scalars().all()

    # Get dress codes with guest's preferences
    dress_codes_result = await db.execute(
        select(DressCode)
        .where(DressCode.wedding_id == wedding_id)
        .order_by(DressCode.display_order, DressCode.event_date)
    )
    dress_codes = dress_codes_result.scalars().all()

    # Get guest's dress preferences
    dress_prefs_result = await db.execute(
        select(GuestDressPreference)
        .where(GuestDressPreference.guest_id == guest_id)
    )
    dress_preferences = {dp.dress_code_id: dp for dp in dress_prefs_result.scalars().all()}

    # Get food menus
    food_menus_result = await db.execute(
        select(FoodMenu).where(FoodMenu.wedding_id == wedding_id)
    )
    food_menus = food_menus_result.scalars().all()

    # Get guest food preference
    food_pref_result = await db.execute(
        select(GuestFoodPreference).where(GuestFoodPreference.guest_id == guest_id)
    )
    food_preference = food_pref_result.scalar_one_or_none()

    # Get activities with guest's registrations
    activities_result = await db.execute(
        select(Activity)
        .where(Activity.wedding_id == wedding_id)
        .order_by(Activity.display_order, Activity.date_time)
    )
    activities = activities_result.scalars().all()

    # Get guest's activity registrations
    registrations_result = await db.execute(
        select(GuestActivity).where(GuestActivity.guest_id == guest_id)
    )
    activity_registrations = {ga.activity_id: ga for ga in registrations_result.scalars().all()}

    # Get guest's media uploads
    media_result = await db.execute(
        select(MediaUpload)
        .where(MediaUpload.guest_id == guest_id)
        .order_by(MediaUpload.uploaded_at.desc())
    )
    media_uploads = media_result.scalars().all()

    return {
        "guest": {
            "id": str(guest.id),
            "full_name": guest.full_name,
            "email": guest.email,
            "phone": guest.phone,
            "country": guest.country_of_origin,
            "rsvp_status": guest.rsvp_status.value if guest.rsvp_status else None,
            "number_of_attendees": guest.number_of_attendees,
            "special_requests": guest.special_requests,
            "song_requests": guest.song_requests,
            "notes_to_couple": guest.notes_to_couple,
            "party_members": guest.party_members,
        },
        "wedding": {
            "id": str(wedding.id),
            "couple_names": wedding.couple_names,
            "wedding_date": wedding.wedding_date.isoformat() if wedding.wedding_date else None,
            "venue_name": wedding.venue_name,
            "venue_address": wedding.venue_address,
            "venue_city": wedding.venue_city,
            "venue_country": wedding.venue_country,
            "welcome_message": wedding.welcome_message,
            "cover_image_url": wedding.cover_image_url,
        },
        "travel_info": _serialize_travel_info(travel_info) if travel_info else None,
        "hotel_info": _serialize_hotel_info(hotel_info) if hotel_info else None,
        "suggested_hotels": [_serialize_suggested_hotel(h) for h in suggested_hotels],
        "dress_codes": [
            {
                **_serialize_dress_code(dc),
                "guest_preference": _serialize_dress_preference(dress_preferences.get(dc.id))
                if dc.id in dress_preferences else None
            }
            for dc in dress_codes
        ],
        "food_menus": [_serialize_food_menu(fm) for fm in food_menus],
        "food_preference": _serialize_food_preference(food_preference) if food_preference else None,
        "activities": [
            {
                **_serialize_activity(a),
                "is_registered": a.id in activity_registrations,
                "registration": _serialize_activity_registration(activity_registrations.get(a.id))
                if a.id in activity_registrations else None
            }
            for a in activities
        ],
        "media_uploads": [_serialize_media_upload(m) for m in media_uploads]
    }


def _serialize_travel_info(ti: TravelInfo) -> dict:
    return {
        "id": str(ti.id),
        "arrival_date": ti.arrival_date.isoformat() if ti.arrival_date else None,
        "arrival_time": ti.arrival_time,
        "arrival_flight_number": ti.arrival_flight_number,
        "arrival_airport": ti.arrival_airport,
        "departure_date": ti.departure_date.isoformat() if ti.departure_date else None,
        "departure_time": ti.departure_time,
        "departure_flight_number": ti.departure_flight_number,
        "needs_pickup": ti.needs_pickup,
        "needs_dropoff": ti.needs_dropoff,
        "special_requirements": ti.special_requirements
    }


def _serialize_hotel_info(hi: HotelInfo) -> dict:
    return {
        "id": str(hi.id),
        "suggested_hotel_id": str(hi.suggested_hotel_id) if hi.suggested_hotel_id else None,
        "custom_hotel_name": hi.custom_hotel_name,
        "custom_hotel_address": hi.custom_hotel_address,
        "check_in_date": hi.check_in_date.isoformat() if hi.check_in_date else None,
        "check_out_date": hi.check_out_date.isoformat() if hi.check_out_date else None,
        "room_type": hi.room_type,
        "number_of_rooms": hi.number_of_rooms,
        "special_requests": hi.special_requests,
        "booking_confirmation": hi.booking_confirmation,
        "suggested_hotel": _serialize_suggested_hotel(hi.suggested_hotel) if hi.suggested_hotel else None
    }


def _serialize_suggested_hotel(sh: SuggestedHotel) -> dict:
    return {
        "id": str(sh.id),
        "wedding_id": str(sh.wedding_id),
        "hotel_name": sh.hotel_name,
        "name": sh.hotel_name,
        "star_rating": sh.star_rating,
        "address": sh.address,
        "distance_from_venue": sh.distance_from_venue,
        "price_range": sh.price_range,
        "description": sh.description,
        "amenities": sh.amenities,
        "booking_link": sh.booking_link,
        "booking_url": sh.booking_link,
        "phone": sh.phone,
        "website_url": sh.website_url,
        "website": sh.website_url,
        "image_urls": sh.image_urls,
        "image_url": (sh.image_urls[0] if isinstance(sh.image_urls, list) and sh.image_urls else None),
        "display_order": sh.display_order,
        "is_active": sh.is_active,
    }


def _normalize_color_palette(palette):
    """Normalize color palette items to include both name formats."""
    if not palette:
        return palette
    normalized = []
    for item in palette:
        if isinstance(item, dict):
            name = item.get('name', item.get('color_name', ''))
            hex_val = item.get('hex', item.get('color_code', ''))
            normalized.append({
                'name': name,
                'hex': hex_val,
                'color_name': name,
                'color_code': hex_val,
            })
        else:
            normalized.append(item)
    return normalized


def _serialize_dress_code(dc: DressCode) -> dict:
    return {
        "id": str(dc.id),
        "event_name": dc.event_name,
        "event_date": dc.event_date.isoformat() if dc.event_date else None,
        "description": dc.description,
        "theme": dc.theme,
        "theme_description": " - ".join([p for p in [dc.theme, dc.description] if p]) if (dc.theme or dc.description) else None,
        "color_palette": _normalize_color_palette(dc.color_palette),
        "dress_suggestions_men": dc.dress_suggestions_men,
        "dress_suggestions_women": dc.dress_suggestions_women,
        "men_suggestions": dc.dress_suggestions_men,
        "women_suggestions": dc.dress_suggestions_women,
        "image_urls": dc.image_urls,
        "inspiration_images": dc.image_urls,
        "notes": dc.notes
    }


def _serialize_dress_preference(dp: Optional[GuestDressPreference]) -> Optional[dict]:
    if not dp:
        return None
    return {
        "id": str(dp.id),
        "planned_outfit_description": dp.planned_outfit_description,
        "color_choice": dp.color_choice,
        "needs_shopping_assistance": dp.needs_shopping_assistance,
        "notes": dp.notes
    }


def _serialize_food_menu(fm: FoodMenu) -> dict:
    return {
        "id": str(fm.id),
        "event_name": fm.event_name,
        "menu_items": fm.menu_items,
        "dietary_options_available": fm.dietary_options_available,
        "notes": fm.notes
    }


def _serialize_food_preference(fp: GuestFoodPreference) -> dict:
    return {
        "id": str(fp.id),
        "dietary_restrictions": fp.dietary_restrictions,
        "allergies": fp.allergies,
        "cuisine_preferences": fp.cuisine_preferences,
        "special_requests": fp.special_requests,
        "meal_size_preference": fp.meal_size_preference.value if fp.meal_size_preference else None
    }


def _serialize_activity(a: Activity) -> dict:
    return {
        "id": str(a.id),
        "activity_name": a.activity_name,
        "description": a.description,
        "event_day": a.event_day,
        "date_time": a.date_time.isoformat() if a.date_time else None,
        "duration_minutes": a.duration_minutes,
        "location": a.location,
        "max_participants": a.max_participants,
        "is_optional": a.is_optional,
        "requires_signup": a.requires_signup,
        "image_url": a.image_url,
        "notes": a.notes,
        "dress_code_info": a.dress_code_info,
        "dress_colors": a.dress_colors,
        "food_description": a.food_description,
        "dietary_options": a.dietary_options,
    }


def _serialize_activity_registration(ga: Optional[GuestActivity]) -> Optional[dict]:
    if not ga:
        return None
    return {
        "id": str(ga.id),
        "number_of_participants": ga.number_of_participants,
        "notes": ga.notes,
        "registered_at": ga.registered_at.isoformat() if ga.registered_at else None
    }


def _serialize_media_upload(m: MediaUpload) -> dict:
    return {
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


async def validate_and_save_file(
    file: UploadFile,
    wedding_id: UUID,
    guest_id: UUID
) -> Tuple[str, FileType, int, Optional[str]]:
    """
    Validate and save uploaded file.
    Returns: (file_url, file_type, file_size, thumbnail_url)
    """
    # Determine file type
    content_type = file.content_type or ""
    filename = file.filename or "unknown"

    image_types = ["image/jpeg", "image/png", "image/jpg"]
    video_types = ["video/mp4", "video/quicktime", "video/mov"]

    if content_type in image_types:
        file_type = FileType.image
        max_size = 10 * 1024 * 1024  # 10MB
    elif content_type in video_types:
        file_type = FileType.video
        max_size = 100 * 1024 * 1024  # 100MB
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type: {content_type}. Allowed: jpg, png, mp4, mov"
        )

    # Read file content
    content = await file.read()
    file_size = len(content)

    if file_size > max_size:
        max_mb = max_size // (1024 * 1024)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Maximum size for {file_type.value}: {max_mb}MB"
        )

    # Create directory
    upload_dir = os.path.join(
        settings.UPLOAD_DIR,
        "weddings",
        str(wedding_id),
        "guest-media",
        str(guest_id)
    )
    os.makedirs(upload_dir, exist_ok=True)

    # Generate unique filename
    file_ext = filename.split(".")[-1] if "." in filename else "bin"
    unique_filename = f"{uuid_lib.uuid4()}.{file_ext}"
    file_path = os.path.join(upload_dir, unique_filename)

    # Save file
    async with aiofiles.open(file_path, "wb") as f:
        await f.write(content)

    # Generate URL path
    file_url = f"/uploads/weddings/{wedding_id}/guest-media/{guest_id}/{unique_filename}"

    # Thumbnail generation for videos would require ffmpeg
    # For now, return None for thumbnail
    thumbnail_url = None

    return file_url, file_type, file_size, thumbnail_url
