from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from uuid import UUID
import os
import aiofiles
import uuid as uuid_lib

from app.database import get_db
from app.services.event_service import EventService
from app.schemas.event import EventCreate, EventUpdate, EventResponse
from app.schemas.common import MessageResponse
from app.config import settings

router = APIRouter(prefix="/events", tags=["Events"])


@router.post("", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
async def create_event(
    data: EventCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create a new event."""
    service = EventService(db)
    event = await service.create_event(data)
    stats = await service.get_event_stats(event.id)

    return EventResponse(
        **event.__dict__,
        is_upcoming=event.is_upcoming,
        confirmed_guests_count=stats["confirmed_guests"],
        total_invitations=stats["total_invitations"]
    )


@router.get("", response_model=list[EventResponse])
async def get_events(
    is_active: Optional[bool] = None,
    event_type: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """Get all events with optional filters."""
    service = EventService(db)
    events = await service.get_events(is_active=is_active, event_type=event_type)

    result = []
    for event in events:
        stats = await service.get_event_stats(event.id)
        result.append(EventResponse(
            **event.__dict__,
            is_upcoming=event.is_upcoming,
            confirmed_guests_count=stats["confirmed_guests"],
            total_invitations=stats["total_invitations"]
        ))

    return result


@router.get("/{event_id}", response_model=EventResponse)
async def get_event(
    event_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Get an event by ID."""
    service = EventService(db)
    event = await service.get_event(event_id)
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )

    stats = await service.get_event_stats(event.id)

    return EventResponse(
        **event.__dict__,
        is_upcoming=event.is_upcoming,
        confirmed_guests_count=stats["confirmed_guests"],
        total_invitations=stats["total_invitations"]
    )


@router.patch("/{event_id}", response_model=EventResponse)
async def update_event(
    event_id: UUID,
    data: EventUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update an event."""
    service = EventService(db)
    event = await service.update_event(event_id, data)
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )

    stats = await service.get_event_stats(event.id)

    return EventResponse(
        **event.__dict__,
        is_upcoming=event.is_upcoming,
        confirmed_guests_count=stats["confirmed_guests"],
        total_invitations=stats["total_invitations"]
    )


@router.delete("/{event_id}", response_model=MessageResponse)
async def delete_event(
    event_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Delete an event."""
    service = EventService(db)
    deleted = await service.delete_event(event_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    return MessageResponse(message="Event deleted successfully")


@router.post("/{event_id}/cover-image", response_model=EventResponse)
async def upload_cover_image(
    event_id: UUID,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    """Upload cover image for an event."""
    service = EventService(db)
    event = await service.get_event(event_id)
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )

    # Validate file type
    if file.content_type not in settings.ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Allowed types: JPEG, PNG, WebP"
        )

    # Create upload directory if it doesn't exist
    upload_dir = os.path.join(settings.UPLOAD_DIR, "events")
    os.makedirs(upload_dir, exist_ok=True)

    # Generate unique filename
    file_ext = file.filename.split(".")[-1]
    filename = f"{uuid_lib.uuid4()}.{file_ext}"
    file_path = os.path.join(upload_dir, filename)

    # Save file
    async with aiofiles.open(file_path, "wb") as f:
        content = await file.read()
        await f.write(content)

    # Update event with image path
    event = await service.update_event(
        event_id,
        EventUpdate(cover_image=f"/uploads/events/{filename}")
    )

    stats = await service.get_event_stats(event.id)

    return EventResponse(
        **event.__dict__,
        is_upcoming=event.is_upcoming,
        confirmed_guests_count=stats["confirmed_guests"],
        total_invitations=stats["total_invitations"]
    )


@router.get("/{event_id}/stats")
async def get_event_stats(
    event_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Get statistics for an event."""
    service = EventService(db)
    event = await service.get_event(event_id)
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )

    stats = await service.get_event_stats(event_id)
    return stats
