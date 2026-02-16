from sqlalchemy import String, Text, Integer, Date, Boolean, ForeignKey
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
from datetime import date
import uuid

from app.models.base import Base


class HotelInfo(Base):
    __tablename__ = "hotel_infos"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )
    guest_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("guests.id"),
        unique=True,
        nullable=False
    )
    suggested_hotel_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("suggested_hotels.id"),
        nullable=True
    )
    custom_hotel_name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    custom_hotel_address: Mapped[str | None] = mapped_column(Text, nullable=True)
    check_in_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    check_out_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    room_type: Mapped[str | None] = mapped_column(String(100), nullable=True)
    number_of_rooms: Mapped[int] = mapped_column(Integer, default=1)
    special_requests: Mapped[str | None] = mapped_column(Text, nullable=True)
    booking_confirmation: Mapped[str | None] = mapped_column(String(200), nullable=True)

    # Relationships
    guest: Mapped["Guest"] = relationship("Guest", back_populates="hotel_info")
    suggested_hotel: Mapped["SuggestedHotel"] = relationship("SuggestedHotel", back_populates="hotel_infos")


from app.models.guest import Guest
from app.models.suggested_hotel import SuggestedHotel
