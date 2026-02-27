import os
import uuid as uuid_lib
import aiofiles
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, union_all, literal, cast, String
from sqlalchemy.orm import selectinload
from pydantic import BaseModel

from app.database import get_db
from app.models import Wedding, Guest, TravelInfo, HotelInfo, GuestActivity, GuestFoodPreference, GuestDressPreference, MediaUpload, RSVPStatus, Activity
from app.schemas import WeddingResponse, WeddingUpdate, SuccessResponse
from app.utils.auth import get_current_wedding
from app.config import settings

router = APIRouter(prefix="/api/admin/wedding", tags=["Admin Wedding"])


class RecentActivityItem(BaseModel):
    guest_name: str
    action: str
    action_type: str  # rsvp, travel, hotel, food, dress, activity, media, access
    time: str
    detail: Optional[str] = None


class EventAttendanceStats(BaseModel):
    activity_id: str
    activity_name: str
    date_time: Optional[str] = None
    attending_count: int = 0
    total_attendees: int = 0
    pending_count: int = 0


class DashboardStats(BaseModel):
    total_guests: int
    confirmed_guests: int
    declined_guests: int
    pending_guests: int
    maybe_guests: int
    total_attending: int
    average_party_size: float = 0.0
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
    recent_activity: List[RecentActivityItem] = []
    event_stats: List[EventAttendanceStats] = []


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

    # Build recent activity from real data
    recent_activity: list[RecentActivityItem] = []

    # Get recent RSVPs (non-pending guests, ordered by rsvp_submitted_at or updated_at)
    rsvp_result = await db.execute(
        select(Guest)
        .where(
            Guest.wedding_id == wedding.id,
            Guest.rsvp_status != RSVPStatus.pending
        )
        .order_by(desc(Guest.rsvp_submitted_at))
        .limit(10)
    )
    for g in rsvp_result.scalars().all():
        ts = g.rsvp_submitted_at or g.updated_at
        if ts:
            recent_activity.append(RecentActivityItem(
                guest_name=g.full_name,
                action=f"RSVP: {g.rsvp_status.value}",
                action_type="rsvp",
                time=ts.isoformat(),
                detail=f"{g.number_of_attendees} attendee(s)",
            ))

    # Get recent travel info submissions
    travel_recent = await db.execute(
        select(TravelInfo)
        .join(Guest)
        .options(selectinload(TravelInfo.guest))
        .where(Guest.wedding_id == wedding.id)
        .order_by(desc(TravelInfo.updated_at))
        .limit(5)
    )
    for ti in travel_recent.scalars().all():
        recent_activity.append(RecentActivityItem(
            guest_name=ti.guest.full_name,
            action="Submitted travel info",
            action_type="travel",
            time=ti.updated_at.isoformat() if ti.updated_at else "",
        ))

    # Get recent hotel info submissions
    hotel_recent = await db.execute(
        select(HotelInfo)
        .join(Guest)
        .options(selectinload(HotelInfo.guest))
        .where(Guest.wedding_id == wedding.id)
        .order_by(desc(HotelInfo.id))
        .limit(5)
    )
    for hi in hotel_recent.scalars().all():
        hotel_name = hi.custom_hotel_name or "a suggested hotel"
        recent_activity.append(RecentActivityItem(
            guest_name=hi.guest.full_name,
            action="Submitted hotel preference",
            action_type="hotel",
            time=hi.guest.updated_at.isoformat() if hi.guest.updated_at else "",
            detail=hotel_name,
        ))

    # Get recent activity registrations
    activity_recent = await db.execute(
        select(GuestActivity)
        .join(Guest)
        .options(selectinload(GuestActivity.guest))
        .where(Guest.wedding_id == wedding.id)
        .order_by(desc(GuestActivity.registered_at))
        .limit(5)
    )
    for ga in activity_recent.scalars().all():
        ts = ga.registered_at or ga.guest.updated_at
        if ts:
            recent_activity.append(RecentActivityItem(
                guest_name=ga.guest.full_name,
                action="Registered for activity",
                action_type="activity",
                time=ts.isoformat(),
            ))

    # Get recent media uploads
    media_recent = await db.execute(
        select(MediaUpload)
        .options(selectinload(MediaUpload.guest))
        .where(MediaUpload.wedding_id == wedding.id)
        .order_by(desc(MediaUpload.uploaded_at))
        .limit(5)
    )
    for mu in media_recent.scalars().all():
        guest_name = mu.guest.full_name if mu.guest else "Unknown"
        ts = mu.uploaded_at
        if ts:
            recent_activity.append(RecentActivityItem(
                guest_name=guest_name,
                action="Uploaded media",
                action_type="media",
                time=ts.isoformat(),
                detail=mu.caption,
            ))

    # Get recent portal accesses
    access_result = await db.execute(
        select(Guest)
        .where(
            Guest.wedding_id == wedding.id,
            Guest.last_accessed_at.isnot(None)
        )
        .order_by(desc(Guest.last_accessed_at))
        .limit(5)
    )
    for g in access_result.scalars().all():
        recent_activity.append(RecentActivityItem(
            guest_name=g.full_name,
            action="Accessed portal",
            action_type="access",
            time=g.last_accessed_at.isoformat(),
        ))

    # Sort all by time descending, take top 10
    recent_activity.sort(key=lambda x: x.time, reverse=True)
    recent_activity = recent_activity[:10]

    avg_party_size = round(total_attending / confirmed_guests, 1) if confirmed_guests > 0 else 0.0

    # Per-event attendance stats
    event_stats: list[EventAttendanceStats] = []
    events_result = await db.execute(
        select(Activity)
        .where(Activity.wedding_id == wedding.id, Activity.requires_signup == True)
        .order_by(Activity.display_order, Activity.date_time)
    )
    for evt in events_result.scalars().all():
        reg_count_result = await db.execute(
            select(func.count(GuestActivity.id))
            .where(GuestActivity.activity_id == evt.id)
        )
        attending_count = reg_count_result.scalar() or 0

        attendees_result = await db.execute(
            select(func.coalesce(func.sum(GuestActivity.number_of_participants), 0))
            .where(GuestActivity.activity_id == evt.id)
        )
        evt_total_attendees = attendees_result.scalar() or 0

        event_stats.append(EventAttendanceStats(
            activity_id=str(evt.id),
            activity_name=evt.activity_name,
            date_time=evt.date_time.isoformat() if evt.date_time else None,
            attending_count=attending_count,
            total_attendees=evt_total_attendees,
            pending_count=pending_guests,
        ))

    return DashboardStats(
        total_guests=total_guests,
        confirmed_guests=confirmed_guests,
        declined_guests=declined_guests,
        pending_guests=pending_guests,
        maybe_guests=maybe_guests,
        total_attending=total_attending,
        average_party_size=avg_party_size,
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
        recent_activity=recent_activity,
        event_stats=event_stats,
    )


@router.post("/story-image", response_model=WeddingResponse)
async def upload_story_image(
    file: UploadFile = File(...),
    wedding: Wedding = Depends(get_current_wedding),
    db: AsyncSession = Depends(get_db)
):
    """Upload story image."""
    allowed_types = ["image/jpeg", "image/png", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Allowed: JPEG, PNG, WebP"
        )

    upload_dir = os.path.join(settings.UPLOAD_DIR, "weddings", str(wedding.id))
    os.makedirs(upload_dir, exist_ok=True)

    file_ext = file.filename.split(".")[-1] if file.filename else "jpg"
    filename = f"story_{uuid_lib.uuid4()}.{file_ext}"
    file_path = os.path.join(upload_dir, filename)

    async with aiofiles.open(file_path, "wb") as f:
        content = await file.read()
        await f.write(content)

    wedding.story_image_url = f"/uploads/weddings/{wedding.id}/{filename}"
    await db.flush()
    await db.refresh(wedding)

    return WeddingResponse.model_validate(wedding)


@router.post("/couple-image", response_model=WeddingResponse)
async def upload_couple_image(
    file: UploadFile = File(...),
    wedding: Wedding = Depends(get_current_wedding),
    db: AsyncSession = Depends(get_db)
):
    """Upload couple image for the Our Story section."""
    allowed_types = ["image/jpeg", "image/png", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Allowed: JPEG, PNG, WebP"
        )

    upload_dir = os.path.join(settings.UPLOAD_DIR, "weddings", str(wedding.id))
    os.makedirs(upload_dir, exist_ok=True)

    file_ext = file.filename.split(".")[-1] if file.filename else "jpg"
    filename = f"couple_{uuid_lib.uuid4()}.{file_ext}"
    file_path = os.path.join(upload_dir, filename)

    async with aiofiles.open(file_path, "wb") as f:
        content = await file.read()
        await f.write(content)

    wedding.couple_image_url = f"/uploads/weddings/{wedding.id}/{filename}"
    await db.flush()
    await db.refresh(wedding)

    return WeddingResponse.model_validate(wedding)
