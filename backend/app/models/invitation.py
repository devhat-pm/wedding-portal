from sqlalchemy import Column, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid

from app.database import Base


class Invitation(Base):
    """Model for tracking invitations sent to guests for specific events."""
    __tablename__ = "invitations"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    # Foreign Keys
    guest_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("guests.id", ondelete="CASCADE"),
        nullable=False
    )
    event_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("events.id", ondelete="CASCADE"),
        nullable=False
    )

    # Invitation Code (unique per invitation for RSVP tracking)
    invitation_code: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        nullable=False,
        default=lambda: str(uuid.uuid4())[:8].upper()
    )

    # Sending Status
    is_sent: Mapped[bool] = mapped_column(Boolean, default=False)
    sent_date: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    sent_method: Mapped[str | None] = mapped_column(String(50), nullable=True)  # email, whatsapp, physical

    # Delivery Status
    is_delivered: Mapped[bool] = mapped_column(Boolean, default=False)
    delivered_date: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    # Response Status
    is_opened: Mapped[bool] = mapped_column(Boolean, default=False)
    opened_date: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    # Notes
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False
    )

    # Relationships
    guest: Mapped["Guest"] = relationship(
        "Guest",
        back_populates="invitations",
        lazy="selectin"
    )
    event: Mapped["Event"] = relationship(
        "Event",
        back_populates="invitations",
        lazy="selectin"
    )


# Import at the end to avoid circular imports
from app.models.guest import Guest
from app.models.event import Event
