from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from uuid import UUID

from app.database import get_db
from app.services.invitation_service import InvitationService
from app.schemas.invitation import (
    InvitationCreate,
    InvitationUpdate,
    InvitationResponse,
    BulkInvitationCreate,
    InvitationMarkSent
)
from app.schemas.common import MessageResponse

router = APIRouter(prefix="/invitations", tags=["Invitations"])


@router.post("", response_model=InvitationResponse, status_code=status.HTTP_201_CREATED)
async def create_invitation(
    data: InvitationCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create a new invitation."""
    service = InvitationService(db)
    invitation = await service.create_invitation(data)

    return InvitationResponse(
        **invitation.__dict__,
        guest_name=invitation.guest.full_name if invitation.guest else None,
        event_name=invitation.event.name if invitation.event else None
    )


@router.get("", response_model=list[InvitationResponse])
async def get_invitations(
    event_id: Optional[UUID] = None,
    guest_id: Optional[UUID] = None,
    is_sent: Optional[bool] = None,
    db: AsyncSession = Depends(get_db)
):
    """Get invitations with optional filters."""
    service = InvitationService(db)
    invitations = await service.get_invitations(
        event_id=event_id,
        guest_id=guest_id,
        is_sent=is_sent
    )

    return [
        InvitationResponse(
            **inv.__dict__,
            guest_name=inv.guest.full_name if inv.guest else None,
            event_name=inv.event.name if inv.event else None
        )
        for inv in invitations
    ]


@router.get("/code/{code}", response_model=InvitationResponse)
async def get_invitation_by_code(
    code: str,
    db: AsyncSession = Depends(get_db)
):
    """Get an invitation by invitation code (for RSVP page)."""
    service = InvitationService(db)
    invitation = await service.get_invitation_by_code(code)
    if not invitation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invitation not found"
        )

    return InvitationResponse(
        **invitation.__dict__,
        guest_name=invitation.guest.full_name if invitation.guest else None,
        event_name=invitation.event.name if invitation.event else None
    )


@router.get("/{invitation_id}", response_model=InvitationResponse)
async def get_invitation(
    invitation_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Get an invitation by ID."""
    service = InvitationService(db)
    invitation = await service.get_invitation(invitation_id)
    if not invitation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invitation not found"
        )

    return InvitationResponse(
        **invitation.__dict__,
        guest_name=invitation.guest.full_name if invitation.guest else None,
        event_name=invitation.event.name if invitation.event else None
    )


@router.patch("/{invitation_id}", response_model=InvitationResponse)
async def update_invitation(
    invitation_id: UUID,
    data: InvitationUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update an invitation."""
    service = InvitationService(db)
    invitation = await service.update_invitation(invitation_id, data)
    if not invitation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invitation not found"
        )

    return InvitationResponse(
        **invitation.__dict__,
        guest_name=invitation.guest.full_name if invitation.guest else None,
        event_name=invitation.event.name if invitation.event else None
    )


@router.delete("/{invitation_id}", response_model=MessageResponse)
async def delete_invitation(
    invitation_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Delete an invitation."""
    service = InvitationService(db)
    deleted = await service.delete_invitation(invitation_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invitation not found"
        )
    return MessageResponse(message="Invitation deleted successfully")


@router.post("/bulk", response_model=MessageResponse)
async def bulk_create_invitations(
    data: BulkInvitationCreate,
    db: AsyncSession = Depends(get_db)
):
    """Bulk create invitations for multiple guests to an event."""
    service = InvitationService(db)
    invitations = await service.bulk_create_invitations(data)

    return MessageResponse(
        message=f"Created {len(invitations)} invitations",
        data={"created_count": len(invitations)}
    )


@router.post("/mark-sent", response_model=MessageResponse)
async def mark_invitations_sent(
    data: InvitationMarkSent,
    db: AsyncSession = Depends(get_db)
):
    """Mark multiple invitations as sent."""
    service = InvitationService(db)
    count = await service.mark_invitations_sent(
        data.invitation_ids,
        data.sent_method
    )

    return MessageResponse(
        message=f"Marked {count} invitations as sent",
        data={"updated_count": count}
    )


@router.get("/stats/summary")
async def get_invitation_stats(db: AsyncSession = Depends(get_db)):
    """Get invitation statistics."""
    service = InvitationService(db)
    stats = await service.get_invitation_stats()
    return stats
