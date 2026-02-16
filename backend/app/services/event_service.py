from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, delete
from sqlalchemy.orm import selectinload
from typing import Optional
from uuid import UUID

from app.models.event import Event
from app.models.invitation import Invitation
from app.models.guest import RSVPStatus
from app.schemas.event import EventCreate, EventUpdate


class EventService:
    """Service for event-related operations."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_event(self, data: EventCreate) -> Event:
        """Create a new event."""
        event = Event(**data.model_dump())
        self.db.add(event)
        await self.db.flush()
        await self.db.refresh(event)
        return event

    async def get_event(self, event_id: UUID) -> Optional[Event]:
        """Get an event by ID."""
        result = await self.db.execute(
            select(Event)
            .options(selectinload(Event.invitations))
            .where(Event.id == event_id)
        )
        return result.scalar_one_or_none()

    async def get_events(
        self,
        is_active: Optional[bool] = None,
        event_type: Optional[str] = None
    ) -> list[Event]:
        """Get all events with optional filters."""
        query = select(Event).options(selectinload(Event.invitations))

        filters = []
        if is_active is not None:
            filters.append(Event.is_active == is_active)
        if event_type:
            filters.append(Event.event_type == event_type)

        if filters:
            query = query.where(*filters)

        query = query.order_by(Event.start_datetime)

        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def update_event(
        self,
        event_id: UUID,
        data: EventUpdate
    ) -> Optional[Event]:
        """Update an event."""
        event = await self.get_event(event_id)
        if not event:
            return None

        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(event, field, value)

        await self.db.flush()
        await self.db.refresh(event)
        return event

    async def delete_event(self, event_id: UUID) -> bool:
        """Delete an event."""
        result = await self.db.execute(
            delete(Event).where(Event.id == event_id)
        )
        return result.rowcount > 0

    async def get_event_stats(self, event_id: UUID) -> dict:
        """Get statistics for an event."""
        # Get invitation count
        invitation_result = await self.db.execute(
            select(func.count(Invitation.id))
            .where(Invitation.event_id == event_id)
        )
        total_invitations = invitation_result.scalar()

        # Get sent invitations count
        sent_result = await self.db.execute(
            select(func.count(Invitation.id))
            .where(Invitation.event_id == event_id)
            .where(Invitation.is_sent == True)
        )
        sent_invitations = sent_result.scalar()

        # Get confirmed guests for this event through invitations
        from app.models.guest import Guest
        confirmed_result = await self.db.execute(
            select(func.count(Guest.id))
            .join(Invitation, Guest.id == Invitation.guest_id)
            .where(Invitation.event_id == event_id)
            .where(Guest.rsvp_status == RSVPStatus.CONFIRMED)
        )
        confirmed_guests = confirmed_result.scalar()

        return {
            "total_invitations": total_invitations,
            "sent_invitations": sent_invitations,
            "confirmed_guests": confirmed_guests
        }
