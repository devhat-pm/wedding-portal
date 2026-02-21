from sqlalchemy import String, Text, DateTime, Integer, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid

from app.models.base import Base


class GuestActivity(Base):
    __tablename__ = "guest_activities"
    __table_args__ = (
        UniqueConstraint('guest_id', 'activity_id', name='uq_guest_activity'),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )
    guest_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("guests.id", ondelete="CASCADE"),
        nullable=False
    )
    activity_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("activities.id"),
        nullable=False
    )
    number_of_participants: Mapped[int] = mapped_column(Integer, default=1)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    registered_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    # Relationships
    guest: Mapped["Guest"] = relationship("Guest", back_populates="activities")
    activity: Mapped["Activity"] = relationship("Activity", back_populates="guest_activities")


from app.models.guest import Guest
from app.models.activity import Activity
