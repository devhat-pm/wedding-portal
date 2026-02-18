from sqlalchemy import Column, String, Text, DateTime, Boolean, Integer
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid

from app.models.base import Base


class Event(Base):
    """Model for wedding events (ceremony, reception, etc.)."""
    __tablename__ = "events"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    # Event Details
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    name_arabic: Mapped[str | None] = mapped_column(String(255), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    description_arabic: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Type
    event_type: Mapped[str] = mapped_column(
        String(50),
        default="reception",
        nullable=False
    )  # engagement, henna, ceremony, reception, etc.

    # Date and Time
    start_datetime: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    end_datetime: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    # Location
    venue_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    venue_name_arabic: Mapped[str | None] = mapped_column(String(255), nullable=True)
    address: Mapped[str | None] = mapped_column(Text, nullable=True)
    address_arabic: Mapped[str | None] = mapped_column(Text, nullable=True)
    city: Mapped[str | None] = mapped_column(String(100), nullable=True)
    country: Mapped[str | None] = mapped_column(String(100), nullable=True)
    map_url: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Capacity
    max_capacity: Mapped[int | None] = mapped_column(Integer, nullable=True)

    # Dress Code
    dress_code: Mapped[str | None] = mapped_column(String(100), nullable=True)
    dress_code_arabic: Mapped[str | None] = mapped_column(String(100), nullable=True)

    # Status
    is_main_event: Mapped[bool] = mapped_column(Boolean, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # Image
    cover_image: Mapped[str | None] = mapped_column(String(500), nullable=True)

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
    invitations: Mapped[list["Invitation"]] = relationship(
        "Invitation",
        back_populates="event",
        lazy="selectin",
        cascade="all, delete-orphan"
    )

    @property
    def is_upcoming(self) -> bool:
        return self.start_datetime > datetime.utcnow()


# Import at the end to avoid circular imports
from app.models.invitation import Invitation
