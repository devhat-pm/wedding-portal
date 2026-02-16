from sqlalchemy import String, Text, DateTime, BigInteger, Boolean, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
import enum

from app.models.base import Base


class FileType(str, enum.Enum):
    image = "image"
    video = "video"


class MediaUpload(Base):
    __tablename__ = "media_uploads"

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
    guest_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("guests.id"),
        nullable=False
    )
    file_type: Mapped[FileType] = mapped_column(SQLEnum(FileType), nullable=False)
    file_name: Mapped[str | None] = mapped_column(String(300), nullable=True)
    file_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    file_size: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    thumbnail_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    caption: Mapped[str | None] = mapped_column(Text, nullable=True)
    event_tag: Mapped[str | None] = mapped_column(String(100), nullable=True)
    is_approved: Mapped[bool] = mapped_column(Boolean, default=False)
    uploaded_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    approved_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    # Relationships
    wedding: Mapped["Wedding"] = relationship("Wedding", back_populates="media_uploads")
    guest: Mapped["Guest"] = relationship("Guest", back_populates="media_uploads")


from app.models.wedding import Wedding
from app.models.guest import Guest
