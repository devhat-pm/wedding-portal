from sqlalchemy import String, Text, DateTime, Integer, ForeignKey
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID, JSON
from datetime import datetime
import uuid

from app.models.base import Base


class DressCode(Base):
    __tablename__ = "dress_codes"

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
    event_name: Mapped[str] = mapped_column(String(100), nullable=False)
    event_date: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    theme: Mapped[str | None] = mapped_column(String(200), nullable=True)
    color_palette: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    dress_suggestions_men: Mapped[str | None] = mapped_column(Text, nullable=True)
    dress_suggestions_women: Mapped[str | None] = mapped_column(Text, nullable=True)
    image_urls: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    display_order: Mapped[int | None] = mapped_column(Integer, nullable=True)

    # Relationships
    wedding: Mapped["Wedding"] = relationship("Wedding", back_populates="dress_codes")
    guest_preferences: Mapped[list["GuestDressPreference"]] = relationship("GuestDressPreference", back_populates="dress_code")


from app.models.wedding import Wedding
from app.models.guest_dress_preference import GuestDressPreference
