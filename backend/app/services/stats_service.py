from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.models.guest import Guest, RSVPStatus, GuestSide
from app.models.event import Event
from app.models.invitation import Invitation
from app.schemas.common import StatsResponse


class StatsService:
    """Service for statistics operations."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_dashboard_stats(self) -> StatsResponse:
        """Get dashboard statistics."""
        # Total guests
        total_result = await self.db.execute(
            select(func.count(Guest.id))
        )
        total_guests = total_result.scalar() or 0

        # Confirmed guests
        confirmed_result = await self.db.execute(
            select(func.count(Guest.id))
            .where(Guest.rsvp_status == RSVPStatus.CONFIRMED)
        )
        confirmed_guests = confirmed_result.scalar() or 0

        # Pending guests
        pending_result = await self.db.execute(
            select(func.count(Guest.id))
            .where(Guest.rsvp_status == RSVPStatus.PENDING)
        )
        pending_guests = pending_result.scalar() or 0

        # Declined guests
        declined_result = await self.db.execute(
            select(func.count(Guest.id))
            .where(Guest.rsvp_status == RSVPStatus.DECLINED)
        )
        declined_guests = declined_result.scalar() or 0

        # VIP guests
        vip_result = await self.db.execute(
            select(func.count(Guest.id))
            .where(Guest.is_vip == True)
        )
        vip_guests = vip_result.scalar() or 0

        # Bride side guests
        bride_result = await self.db.execute(
            select(func.count(Guest.id))
            .where(Guest.side == GuestSide.BRIDE)
        )
        bride_side_guests = bride_result.scalar() or 0

        # Groom side guests
        groom_result = await self.db.execute(
            select(func.count(Guest.id))
            .where(Guest.side == GuestSide.GROOM)
        )
        groom_side_guests = groom_result.scalar() or 0

        # Total attending (confirmed guests + their plus ones + children)
        confirmed_guests_list = await self.db.execute(
            select(Guest)
            .where(Guest.rsvp_status == RSVPStatus.CONFIRMED)
        )
        confirmed = confirmed_guests_list.scalars().all()
        total_attending = sum(g.total_guests for g in confirmed)

        # Total events
        events_result = await self.db.execute(
            select(func.count(Event.id))
        )
        total_events = events_result.scalar() or 0

        # Total invitations sent
        invitations_result = await self.db.execute(
            select(func.count(Invitation.id))
            .where(Invitation.is_sent == True)
        )
        total_invitations_sent = invitations_result.scalar() or 0

        return StatsResponse(
            total_guests=total_guests,
            confirmed_guests=confirmed_guests,
            pending_guests=pending_guests,
            declined_guests=declined_guests,
            total_attending=total_attending,
            total_events=total_events,
            total_invitations_sent=total_invitations_sent,
            vip_guests=vip_guests,
            bride_side_guests=bride_side_guests,
            groom_side_guests=groom_side_guests
        )

    async def get_rsvp_breakdown(self) -> dict:
        """Get RSVP status breakdown."""
        result = await self.db.execute(
            select(
                Guest.rsvp_status,
                func.count(Guest.id).label('count')
            )
            .group_by(Guest.rsvp_status)
        )
        breakdown = {str(row.rsvp_status.value): row.count for row in result}
        return breakdown

    async def get_side_breakdown(self) -> dict:
        """Get guest side breakdown."""
        result = await self.db.execute(
            select(
                Guest.side,
                func.count(Guest.id).label('count')
            )
            .group_by(Guest.side)
        )
        breakdown = {str(row.side.value): row.count for row in result}
        return breakdown

    async def get_relation_breakdown(self) -> dict:
        """Get guest relation breakdown."""
        result = await self.db.execute(
            select(
                Guest.relation,
                func.count(Guest.id).label('count')
            )
            .group_by(Guest.relation)
        )
        breakdown = {str(row.relation.value): row.count for row in result}
        return breakdown
