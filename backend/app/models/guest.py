from sqlalchemy import String, Integer, Text, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
import enum

from app.models.base import Base, TimestampMixin


class RSVPStatus(str, enum.Enum):
    pending = "pending"
    confirmed = "confirmed"
    declined = "declined"
    maybe = "maybe"


class Guest(Base, TimestampMixin):
    __tablename__ = "guests"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )
    wedding_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("weddings.id"),
        nullable=False
    )
    unique_token: Mapped[str] = mapped_column(
        String(64),
        unique=True,
        index=True,
        nullable=False
    )
    full_name: Mapped[str] = mapped_column(String(200), nullable=False)
    email: Mapped[str | None] = mapped_column(String(200), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    country_of_origin: Mapped[str | None] = mapped_column(String(100), nullable=True)
    rsvp_status: Mapped[RSVPStatus] = mapped_column(
        SQLEnum(RSVPStatus),
        default=RSVPStatus.pending
    )
    number_of_attendees: Mapped[int] = mapped_column(Integer, default=1)
    special_requests: Mapped[str | None] = mapped_column(Text, nullable=True)
    song_requests: Mapped[str | None] = mapped_column(Text, nullable=True)
    notes_to_couple: Mapped[str | None] = mapped_column(Text, nullable=True)
    rsvp_submitted_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    last_accessed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    # Relationships
    wedding: Mapped["Wedding"] = relationship("Wedding", back_populates="guests")
    travel_info: Mapped["TravelInfo"] = relationship("TravelInfo", back_populates="guest", uselist=False)
    hotel_info: Mapped["HotelInfo"] = relationship("HotelInfo", back_populates="guest", uselist=False)
    dress_preferences: Mapped[list["GuestDressPreference"]] = relationship("GuestDressPreference", back_populates="guest")
    food_preference: Mapped["GuestFoodPreference"] = relationship("GuestFoodPreference", back_populates="guest", uselist=False)
    activities: Mapped[list["GuestActivity"]] = relationship("GuestActivity", back_populates="guest")
    media_uploads: Mapped[list["MediaUpload"]] = relationship("MediaUpload", back_populates="guest")
    invitations: Mapped[list["Invitation"]] = relationship("Invitation", back_populates="guest")


from app.models.wedding import Wedding
from app.models.travel_info import TravelInfo
from app.models.hotel_info import HotelInfo
from app.models.guest_dress_preference import GuestDressPreference
from app.models.guest_food_preference import GuestFoodPreference
from app.models.guest_activity import GuestActivity
from app.models.media_upload import MediaUpload
from app.models.invitation import Invitation
