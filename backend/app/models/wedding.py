from sqlalchemy import String, Text, DateTime, Boolean
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid

from app.models.base import Base, TimestampMixin


class Wedding(Base, TimestampMixin):
    __tablename__ = "weddings"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )
    couple_names: Mapped[str] = mapped_column(String(200), nullable=False)
    wedding_date: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    venue_name: Mapped[str | None] = mapped_column(String(300), nullable=True)
    venue_address: Mapped[str | None] = mapped_column(Text, nullable=True)
    venue_city: Mapped[str | None] = mapped_column(String(100), nullable=True)
    venue_country: Mapped[str | None] = mapped_column(String(100), nullable=True)
    welcome_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    invitation_message_template: Mapped[str | None] = mapped_column(Text, nullable=True)
    cover_image_url: Mapped[str | None] = mapped_column(String, nullable=True)
    story_title: Mapped[str | None] = mapped_column(String(300), nullable=True)
    story_content: Mapped[str | None] = mapped_column(Text, nullable=True)
    story_image_url: Mapped[str | None] = mapped_column(String, nullable=True)
    couple_image_url: Mapped[str | None] = mapped_column(String, nullable=True)
    admin_email: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    admin_password_hash: Mapped[str] = mapped_column(String, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # Relationships
    guests: Mapped[list["Guest"]] = relationship("Guest", back_populates="wedding")
    suggested_hotels: Mapped[list["SuggestedHotel"]] = relationship("SuggestedHotel", back_populates="wedding")
    dress_codes: Mapped[list["DressCode"]] = relationship("DressCode", back_populates="wedding")
    food_menus: Mapped[list["FoodMenu"]] = relationship("FoodMenu", back_populates="wedding")
    activities: Mapped[list["Activity"]] = relationship("Activity", back_populates="wedding")
    media_uploads: Mapped[list["MediaUpload"]] = relationship("MediaUpload", back_populates="wedding")


from app.models.guest import Guest
from app.models.suggested_hotel import SuggestedHotel
from app.models.dress_code import DressCode
from app.models.food_menu import FoodMenu
from app.models.activity import Activity
from app.models.media_upload import MediaUpload
