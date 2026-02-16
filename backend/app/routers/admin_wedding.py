import os
import uuid as uuid_lib
import aiofiles
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel

from app.database import get_db
from app.models import Wedding, Guest, TravelInfo, HotelInfo, GuestActivity, MediaUpload, RSVPStatus
from app.schemas import WeddingResponse, WeddingUpdate, SuccessResponse
from app.utils.auth import get_current_wedding
from app.config import settings

router = APIRouter(prefix="/api/admin/wedding", tags=["Admin Wedding"])


class DashboardStats(BaseModel):
    total_guests: int
    confirmed_guests: int
    declined_guests: int
    pending_guests: int
    maybe_guests: int
    total_attending: int
    vip_guests: int
    bride_side_guests: int
    groom_side_guests: int
    travel_info_submitted: int
    hotel_info_submitted: int
    activity_registrations: int
    media_pending_approval: int
    media_approved: int
    # Aliases for frontend compatibility
    confirmed_rsvps: int = 0
    pending_rsvps: int = 0
    declined_rsvps: int = 0


@router.get("/", response_model=WeddingResponse)
async def get_wedding(
    wedding: Wedding = Depends(get_current_wedding)
):
    """Get wedding details for logged in admin."""
    return WeddingResponse.model_validate(wedding)


@router.put("/", response_model=WeddingResponse)
async def update_wedding(
    data: WeddingUpdate,
    wedding: Wedding = Depends(get_current_wedding),
    db: AsyncSession = Depends(get_db)
):
    """Update wedding details."""
    update_data = data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(wedding, field, value)

    await db.flush()
    await db.refresh(wedding)

    return WeddingResponse.model_validate(wedding)


@router.post("/cover-image", response_model=WeddingResponse)
async def upload_cover_image(
    file: UploadFile = File(...),
    wedding: Wedding = Depends(get_current_wedding),
    db: AsyncSession = Depends(get_db)
):
    """Upload cover image."""
    allowed_types = ["image/jpeg", "image/png", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Allowed: JPEG, PNG, WebP"
        )

    # Create upload directory
    upload_dir = os.path.join(settings.UPLOAD_DIR, "weddings", str(wedding.id))
    os.makedirs(upload_dir, exist_ok=True)

    # Generate filename
    file_ext = file.filename.split(".")[-1] if file.filename else "jpg"
    filename = f"cover_{uuid_lib.uuid4()}.{file_ext}"
    file_path = os.path.join(upload_dir, filename)

    # Save file
    async with aiofiles.open(file_path, "wb") as f:
        content = await file.read()
        await f.write(content)

    # Update wedding
    wedding.cover_image_url = f"/uploads/weddings/{wedding.id}/{filename}"
    await db.flush()
    await db.refresh(wedding)

    return WeddingResponse.model_validate(wedding)


@router.get("/dashboard-stats", response_model=DashboardStats)
async def get_dashboard_stats(
    wedding: Wedding = Depends(get_current_wedding),
    db: AsyncSession = Depends(get_db)
):
    """Get summary statistics."""
    # Total guests
    total_result = await db.execute(
        select(func.count(Guest.id)).where(Guest.wedding_id == wedding.id)
    )
    total_guests = total_result.scalar() or 0

    # Confirmed guests
    confirmed_result = await db.execute(
        select(func.count(Guest.id)).where(
            Guest.wedding_id == wedding.id,
            Guest.rsvp_status == RSVPStatus.confirmed
        )
    )
    confirmed_guests = confirmed_result.scalar() or 0

    # Declined guests
    declined_result = await db.execute(
        select(func.count(Guest.id)).where(
            Guest.wedding_id == wedding.id,
            Guest.rsvp_status == RSVPStatus.declined
        )
    )
    declined_guests = declined_result.scalar() or 0

    # Pending guests
    pending_result = await db.execute(
        select(func.count(Guest.id)).where(
            Guest.wedding_id == wedding.id,
            Guest.rsvp_status == RSVPStatus.pending
        )
    )
    pending_guests = pending_result.scalar() or 0

    # Maybe guests
    maybe_result = await db.execute(
        select(func.count(Guest.id)).where(
            Guest.wedding_id == wedding.id,
            Guest.rsvp_status == RSVPStatus.maybe
        )
    )
    maybe_guests = maybe_result.scalar() or 0

    # Total attending (sum of number_of_attendees for confirmed guests)
    total_attending_result = await db.execute(
        select(func.coalesce(func.sum(Guest.number_of_attendees), 0)).where(
            Guest.wedding_id == wedding.id,
            Guest.rsvp_status == RSVPStatus.confirmed
        )
    )
    total_attending = total_attending_result.scalar() or 0

    # Travel info submitted
    travel_result = await db.execute(
        select(func.count(TravelInfo.id)).join(Guest).where(Guest.wedding_id == wedding.id)
    )
    travel_info_submitted = travel_result.scalar() or 0

    # Hotel info submitted
    hotel_result = await db.execute(
        select(func.count(HotelInfo.id)).join(Guest).where(Guest.wedding_id == wedding.id)
    )
    hotel_info_submitted = hotel_result.scalar() or 0

    # Activity registrations
    activity_result = await db.execute(
        select(func.count(GuestActivity.id)).join(Guest).where(Guest.wedding_id == wedding.id)
    )
    activity_registrations = activity_result.scalar() or 0

    # Media pending approval
    media_pending_result = await db.execute(
        select(func.count(MediaUpload.id)).where(
            MediaUpload.wedding_id == wedding.id,
            MediaUpload.is_approved == False
        )
    )
    media_pending_approval = media_pending_result.scalar() or 0

    # Media approved
    media_approved_result = await db.execute(
        select(func.count(MediaUpload.id)).where(
            MediaUpload.wedding_id == wedding.id,
            MediaUpload.is_approved == True
        )
    )
    media_approved = media_approved_result.scalar() or 0

    return DashboardStats(
        total_guests=total_guests,
        confirmed_guests=confirmed_guests,
        declined_guests=declined_guests,
        pending_guests=pending_guests,
        maybe_guests=maybe_guests,
        total_attending=total_attending,
        vip_guests=0,
        bride_side_guests=0,
        groom_side_guests=0,
        travel_info_submitted=travel_info_submitted,
        hotel_info_submitted=hotel_info_submitted,
        activity_registrations=activity_registrations,
        media_pending_approval=media_pending_approval,
        media_approved=media_approved,
        confirmed_rsvps=confirmed_guests,
        pending_rsvps=pending_guests,
        declined_rsvps=declined_guests,
    )
