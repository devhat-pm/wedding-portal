from sqlalchemy import String, Text, DateTime, Integer, Boolean, ForeignKey
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID, JSON
from datetime import datetime
import uuid

from app.models.base import Base


class Activity(Base):
    __tablename__ = "activities"

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
    activity_name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    event_day: Mapped[int | None] = mapped_column(Integer, nullable=True)
    date_time: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    duration_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    location: Mapped[str | None] = mapped_column(String(300), nullable=True)
    max_participants: Mapped[int | None] = mapped_column(Integer, nullable=True)
    is_optional: Mapped[bool] = mapped_column(Boolean, default=True)
    requires_signup: Mapped[bool] = mapped_column(Boolean, default=True)
    image_url: Mapped[str | None] = mapped_column(String, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    display_order: Mapped[int | None] = mapped_column(Integer, nullable=True)
    dress_code_info: Mapped[str | None] = mapped_column(Text, nullable=True)
    dress_colors: Mapped[list | None] = mapped_column(JSON, nullable=True)
    food_description: Mapped[str | None] = mapped_column(Text, nullable=True)
    dietary_options: Mapped[list | None] = mapped_column(JSON, nullable=True)

    # Relationships
    wedding: Mapped["Wedding"] = relationship("Wedding", back_populates="activities")
    guest_activities: Mapped[list["GuestActivity"]] = relationship("GuestActivity", back_populates="activity")


from app.models.wedding import Wedding
from app.models.guest_activity import GuestActivity
