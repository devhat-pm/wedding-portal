from sqlalchemy import String, Text, Date, Boolean, ForeignKey
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
from datetime import date, datetime
import uuid

from app.models.base import Base


class TravelInfo(Base):
    __tablename__ = "travel_infos"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )
    guest_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("guests.id", ondelete="CASCADE"),
        unique=True,
        nullable=False
    )
    arrival_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    arrival_time: Mapped[str | None] = mapped_column(String(20), nullable=True)
    arrival_flight_number: Mapped[str | None] = mapped_column(String(50), nullable=True)
    arrival_airport: Mapped[str | None] = mapped_column(String(200), nullable=True)
    departure_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    departure_time: Mapped[str | None] = mapped_column(String(20), nullable=True)
    departure_flight_number: Mapped[str | None] = mapped_column(String(50), nullable=True)
    needs_pickup: Mapped[bool] = mapped_column(Boolean, default=False)
    needs_dropoff: Mapped[bool] = mapped_column(Boolean, default=False)
    special_requirements: Mapped[str | None] = mapped_column(Text, nullable=True)
    updated_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False
    )

    # Relationships
    guest: Mapped["Guest"] = relationship("Guest", back_populates="travel_info")


from app.models.guest import Guest
