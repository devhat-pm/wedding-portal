from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, delete as sa_delete
from sqlalchemy.orm import selectinload
from pydantic import BaseModel

from app.database import get_db
from app.models import Wedding, Activity, GuestActivity, Guest
from app.schemas import (
    ActivityCreate,
    ActivityUpdate,
    ActivityResponse,
    GuestActivityResponse,
    SuccessResponse
)
from app.utils.auth import get_current_wedding

router = APIRouter(prefix="/api/admin/activities", tags=["Admin Activities"])


class ActivityWithCount(BaseModel):
    id: UUID
    wedding_id: UUID
    activity_name: str
    description: str | None = None
    event_day: int | None = None
    date_time: str | None = None
    duration_minutes: int | None = None
    location: str | None = None
    max_participants: int | None = None
    is_optional: bool
    requires_signup: bool
    image_url: str | None = None
    notes: str | None = None
    display_order: int | None = None
    participant_count: int = 0
    total_attendees: int = 0
    dress_code_info: str | None = None
    dress_colors: list | None = None
    food_description: str | None = None
    dietary_options: list | None = None

    # Frontend alias fields
    title: str | None = None
    start_time: str | None = None
    capacity: int | None = None
    requires_registration: bool | None = None

    class Config:
        from_attributes = True


class GuestRegistration(BaseModel):
    guest_id: UUID
    guest_name: str
    guest_email: str | None = None
    number_of_participants: int
    notes: str | None = None
    registered_at: str | None = None


@router.post("/", response_model=ActivityResponse, status_code=status.HTTP_201_CREATED)
async def create_activity(
    data: ActivityCreate,
    wedding: Wedding = Depends(get_current_wedding),
    db: AsyncSession = Depends(get_db)
):
    """Create activity."""
    activity = Activity(
        wedding_id=wedding.id,
        activity_name=data.activity_name,
        description=data.description,
        event_day=data.event_day,
        date_time=data.date_time,
        duration_minutes=data.duration_minutes,
        location=data.location,
        max_participants=data.max_participants,
        is_optional=data.is_optional,
        requires_signup=data.requires_signup,
        image_url=data.image_url,
        notes=data.notes,
        display_order=data.display_order,
        dress_code_info=data.dress_code_info,
        dress_colors=data.dress_colors,
        food_description=data.food_description,
        dietary_options=data.dietary_options,
    )

    db.add(activity)
    await db.flush()
    await db.refresh(activity)

    return ActivityResponse(
        id=activity.id,
        wedding_id=activity.wedding_id,
        activity_name=activity.activity_name,
        description=activity.description,
        event_day=activity.event_day,
        date_time=activity.date_time,
        duration_minutes=activity.duration_minutes,
        location=activity.location,
        max_participants=activity.max_participants,
        is_optional=activity.is_optional,
        requires_signup=activity.requires_signup,
        image_url=activity.image_url,
        notes=activity.notes,
        display_order=activity.display_order,
        participant_count=0,
        dress_code_info=activity.dress_code_info,
        dress_colors=activity.dress_colors,
        food_description=activity.food_description,
        dietary_options=activity.dietary_options,
    )


@router.get("/", response_model=List[ActivityWithCount])
async def list_activities(
    wedding: Wedding = Depends(get_current_wedding),
    db: AsyncSession = Depends(get_db)
):
    """List all activities with registration counts."""
    result = await db.execute(
        select(Activity)
        .where(Activity.wedding_id == wedding.id)
        .order_by(Activity.display_order, Activity.date_time)
    )
    activities = result.scalars().all()

    activity_responses = []
    for activity in activities:
        # Get participant count
        count_result = await db.execute(
            select(func.count(GuestActivity.id))
            .where(GuestActivity.activity_id == activity.id)
        )
        participant_count = count_result.scalar() or 0

        # Get total attendees (sum of number_of_participants)
        attendees_result = await db.execute(
            select(func.sum(GuestActivity.number_of_participants))
            .where(GuestActivity.activity_id == activity.id)
        )
        total_attendees = attendees_result.scalar() or 0

        dt_iso = activity.date_time.isoformat() if activity.date_time else None
        activity_responses.append(ActivityWithCount(
            id=activity.id,
            wedding_id=activity.wedding_id,
            activity_name=activity.activity_name,
            description=activity.description,
            event_day=activity.event_day,
            date_time=dt_iso,
            duration_minutes=activity.duration_minutes,
            location=activity.location,
            max_participants=activity.max_participants,
            is_optional=activity.is_optional,
            requires_signup=activity.requires_signup,
            image_url=activity.image_url,
            notes=activity.notes,
            display_order=activity.display_order,
            participant_count=participant_count,
            total_attendees=total_attendees,
            dress_code_info=activity.dress_code_info,
            dress_colors=activity.dress_colors,
            food_description=activity.food_description,
            dietary_options=activity.dietary_options,
            title=activity.activity_name,
            start_time=dt_iso,
            capacity=activity.max_participants,
            requires_registration=activity.requires_signup,
        ))

    return activity_responses


@router.put("/{activity_id}", response_model=ActivityResponse)
async def update_activity(
    activity_id: UUID,
    data: ActivityUpdate,
    wedding: Wedding = Depends(get_current_wedding),
    db: AsyncSession = Depends(get_db)
):
    """Update activity."""
    result = await db.execute(
        select(Activity).where(
            Activity.id == activity_id,
            Activity.wedding_id == wedding.id
        )
    )
    activity = result.scalar_one_or_none()

    if not activity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Activity not found"
        )

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(activity, field, value)

    await db.flush()
    await db.refresh(activity)

    # Get participant count
    count_result = await db.execute(
        select(func.count(GuestActivity.id))
        .where(GuestActivity.activity_id == activity.id)
    )
    participant_count = count_result.scalar() or 0

    return ActivityResponse(
        id=activity.id,
        wedding_id=activity.wedding_id,
        activity_name=activity.activity_name,
        description=activity.description,
        event_day=activity.event_day,
        date_time=activity.date_time,
        duration_minutes=activity.duration_minutes,
        location=activity.location,
        max_participants=activity.max_participants,
        is_optional=activity.is_optional,
        requires_signup=activity.requires_signup,
        image_url=activity.image_url,
        notes=activity.notes,
        display_order=activity.display_order,
        participant_count=participant_count,
        dress_code_info=activity.dress_code_info,
        dress_colors=activity.dress_colors,
        food_description=activity.food_description,
        dietary_options=activity.dietary_options,
    )


@router.delete("/{activity_id}", response_model=SuccessResponse)
async def delete_activity(
    activity_id: UUID,
    wedding: Wedding = Depends(get_current_wedding),
    db: AsyncSession = Depends(get_db)
):
    """Remove activity."""
    result = await db.execute(
        select(Activity).where(
            Activity.id == activity_id,
            Activity.wedding_id == wedding.id
        )
    )
    activity = result.scalar_one_or_none()

    if not activity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Activity not found"
        )

    # Delete related guest_activities first to avoid FK constraint violations
    await db.execute(
        sa_delete(GuestActivity).where(GuestActivity.activity_id == activity.id)
    )

    await db.delete(activity)
    await db.flush()

    return SuccessResponse(message="Activity deleted successfully")


@router.get("/{activity_id}/registrations", response_model=List[GuestRegistration])
async def list_activity_registrations(
    activity_id: UUID,
    wedding: Wedding = Depends(get_current_wedding),
    db: AsyncSession = Depends(get_db)
):
    """List registered guests."""
    result = await db.execute(
        select(Activity).where(
            Activity.id == activity_id,
            Activity.wedding_id == wedding.id
        )
    )
    activity = result.scalar_one_or_none()

    if not activity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Activity not found"
        )

    registrations_result = await db.execute(
        select(GuestActivity)
        .options(selectinload(GuestActivity.guest))
        .where(GuestActivity.activity_id == activity_id)
        .order_by(GuestActivity.registered_at)
    )
    registrations = registrations_result.scalars().all()

    return [
        GuestRegistration(
            guest_id=r.guest_id,
            guest_name=r.guest.full_name if r.guest else "",
            guest_email=r.guest.email if r.guest else None,
            number_of_participants=r.number_of_participants,
            notes=r.notes,
            registered_at=r.registered_at.isoformat() if r.registered_at else None
        )
        for r in registrations
    ]
