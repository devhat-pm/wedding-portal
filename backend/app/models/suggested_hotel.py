from sqlalchemy import String, Text, Integer, Boolean, ForeignKey
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID, JSON
import uuid

from app.models.base import Base


class SuggestedHotel(Base):
    __tablename__ = "suggested_hotels"

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
    hotel_name: Mapped[str] = mapped_column(String(200), nullable=False)
    address: Mapped[str | None] = mapped_column(Text, nullable=True)
    website_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    distance_from_venue: Mapped[str | None] = mapped_column(String(100), nullable=True)
    price_range: Mapped[str | None] = mapped_column(String(100), nullable=True)
    star_rating: Mapped[int | None] = mapped_column(Integer, nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    amenities: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    image_urls: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    booking_link: Mapped[str | None] = mapped_column(String(500), nullable=True)
    display_order: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # Relationships
    wedding: Mapped["Wedding"] = relationship("Wedding", back_populates="suggested_hotels")
    hotel_infos: Mapped[list["HotelInfo"]] = relationship("HotelInfo", back_populates="suggested_hotel")


from app.models.wedding import Wedding
from app.models.hotel_info import HotelInfo
