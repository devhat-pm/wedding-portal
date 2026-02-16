from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, delete, update
from sqlalchemy.orm import selectinload
from typing import Optional
from uuid import UUID
from datetime import datetime

from app.models.invitation import Invitation
from app.models.guest import Guest
from app.models.event import Event
from app.schemas.invitation import InvitationCreate, InvitationUpdate, BulkInvitationCreate
from app.utils.helpers import generate_invitation_code


class InvitationService:
    """Service for invitation-related operations."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_invitation(self, data: InvitationCreate) -> Invitation:
        """Create a new invitation."""
        invitation = Invitation(
            **data.model_dump(),
            invitation_code=generate_invitation_code()
        )
        self.db.add(invitation)
        await self.db.flush()
        await self.db.refresh(invitation)
        return invitation

    async def get_invitation(self, invitation_id: UUID) -> Optional[Invitation]:
        """Get an invitation by ID."""
        result = await self.db.execute(
            select(Invitation)
            .options(
                selectinload(Invitation.guest),
                selectinload(Invitation.event)
            )
            .where(Invitation.id == invitation_id)
        )
        return result.scalar_one_or_none()

    async def get_invitation_by_code(self, code: str) -> Optional[Invitation]:
        """Get an invitation by invitation code."""
        result = await self.db.execute(
            select(Invitation)
            .options(
                selectinload(Invitation.guest),
                selectinload(Invitation.event)
            )
            .where(Invitation.invitation_code == code.upper())
        )
        return result.scalar_one_or_none()

    async def get_invitations(
        self,
        event_id: Optional[UUID] = None,
        guest_id: Optional[UUID] = None,
        is_sent: Optional[bool] = None
    ) -> list[Invitation]:
        """Get invitations with optional filters."""
        query = select(Invitation).options(
            selectinload(Invitation.guest),
            selectinload(Invitation.event)
        )

        filters = []
        if event_id:
            filters.append(Invitation.event_id == event_id)
        if guest_id:
            filters.append(Invitation.guest_id == guest_id)
        if is_sent is not None:
            filters.append(Invitation.is_sent == is_sent)

        if filters:
            query = query.where(*filters)

        query = query.order_by(Invitation.created_at.desc())

        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def update_invitation(
        self,
        invitation_id: UUID,
        data: InvitationUpdate
    ) -> Optional[Invitation]:
        """Update an invitation."""
        invitation = await self.get_invitation(invitation_id)
        if not invitation:
            return None

        update_data = data.model_dump(exclude_unset=True)

        # Set timestamps based on status changes
        if update_data.get('is_sent') and not invitation.is_sent:
            update_data['sent_date'] = datetime.utcnow()
        if update_data.get('is_delivered') and not invitation.is_delivered:
            update_data['delivered_date'] = datetime.utcnow()
        if update_data.get('is_opened') and not invitation.is_opened:
            update_data['opened_date'] = datetime.utcnow()

        for field, value in update_data.items():
            setattr(invitation, field, value)

        await self.db.flush()
        await self.db.refresh(invitation)
        return invitation

    async def delete_invitation(self, invitation_id: UUID) -> bool:
        """Delete an invitation."""
        result = await self.db.execute(
            delete(Invitation).where(Invitation.id == invitation_id)
        )
        return result.rowcount > 0

    async def bulk_create_invitations(
        self,
        data: BulkInvitationCreate
    ) -> list[Invitation]:
        """Bulk create invitations for multiple guests to an event."""
        invitations = []
        for guest_id in data.guest_ids:
            # Check if invitation already exists
            existing = await self.db.execute(
                select(Invitation)
                .where(Invitation.guest_id == guest_id)
                .where(Invitation.event_id == data.event_id)
            )
            if existing.scalar_one_or_none():
                continue  # Skip if already exists

            invitation = Invitation(
                guest_id=guest_id,
                event_id=data.event_id,
                invitation_code=generate_invitation_code()
            )
            self.db.add(invitation)
            invitations.append(invitation)

        await self.db.flush()
        for invitation in invitations:
            await self.db.refresh(invitation)

        return invitations

    async def mark_invitations_sent(
        self,
        invitation_ids: list[UUID],
        sent_method: str
    ) -> int:
        """Mark multiple invitations as sent."""
        result = await self.db.execute(
            update(Invitation)
            .where(Invitation.id.in_(invitation_ids))
            .values(
                is_sent=True,
                sent_date=datetime.utcnow(),
                sent_method=sent_method
            )
        )
        return result.rowcount

    async def get_invitation_stats(self) -> dict:
        """Get invitation statistics."""
        total_result = await self.db.execute(
            select(func.count(Invitation.id))
        )
        total = total_result.scalar()

        sent_result = await self.db.execute(
            select(func.count(Invitation.id))
            .where(Invitation.is_sent == True)
        )
        sent = sent_result.scalar()

        delivered_result = await self.db.execute(
            select(func.count(Invitation.id))
            .where(Invitation.is_delivered == True)
        )
        delivered = delivered_result.scalar()

        opened_result = await self.db.execute(
            select(func.count(Invitation.id))
            .where(Invitation.is_opened == True)
        )
        opened = opened_result.scalar()

        return {
            "total": total,
            "sent": sent,
            "delivered": delivered,
            "opened": opened
        }
