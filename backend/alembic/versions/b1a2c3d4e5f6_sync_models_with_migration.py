"""sync models with migration

Revision ID: b1a2c3d4e5f6
Revises: 696a04149d57
Create Date: 2026-02-16 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'b1a2c3d4e5f6'
down_revision: Union[str, None] = '696a04149d57'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # =========================================================================
    # 1. Create events table
    # =========================================================================
    op.create_table('events',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('name_arabic', sa.String(length=255), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('description_arabic', sa.Text(), nullable=True),
        sa.Column('event_type', sa.String(length=50), nullable=False, server_default='reception'),
        sa.Column('start_datetime', sa.DateTime(), nullable=False),
        sa.Column('end_datetime', sa.DateTime(), nullable=True),
        sa.Column('venue_name', sa.String(length=255), nullable=True),
        sa.Column('venue_name_arabic', sa.String(length=255), nullable=True),
        sa.Column('address', sa.Text(), nullable=True),
        sa.Column('address_arabic', sa.Text(), nullable=True),
        sa.Column('city', sa.String(length=100), nullable=True),
        sa.Column('country', sa.String(length=100), nullable=True),
        sa.Column('map_url', sa.Text(), nullable=True),
        sa.Column('max_capacity', sa.Integer(), nullable=True),
        sa.Column('dress_code', sa.String(length=100), nullable=True),
        sa.Column('dress_code_arabic', sa.String(length=100), nullable=True),
        sa.Column('is_main_event', sa.Boolean(), nullable=True, server_default='false'),
        sa.Column('is_active', sa.Boolean(), nullable=True, server_default='true'),
        sa.Column('cover_image', sa.String(length=500), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_events'))
    )

    # =========================================================================
    # 2. Create invitations table
    # =========================================================================
    op.create_table('invitations',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('guest_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('event_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('invitation_code', sa.String(length=50), nullable=False),
        sa.Column('is_sent', sa.Boolean(), nullable=True, server_default='false'),
        sa.Column('sent_date', sa.DateTime(), nullable=True),
        sa.Column('sent_method', sa.String(length=50), nullable=True),
        sa.Column('is_delivered', sa.Boolean(), nullable=True, server_default='false'),
        sa.Column('delivered_date', sa.DateTime(), nullable=True),
        sa.Column('is_opened', sa.Boolean(), nullable=True, server_default='false'),
        sa.Column('opened_date', sa.DateTime(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['guest_id'], ['guests.id'], name=op.f('fk_invitations_guest_id_guests'), ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['event_id'], ['events.id'], name=op.f('fk_invitations_event_id_events'), ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_invitations')),
        sa.UniqueConstraint('invitation_code', name=op.f('uq_invitations_invitation_code'))
    )

    # =========================================================================
    # 3. Add rsvp_submitted_at to guests table
    # =========================================================================
    op.add_column('guests', sa.Column('rsvp_submitted_at', sa.DateTime(), nullable=True))

    # =========================================================================
    # 4. Fix travel_infos: drop old columns, add new ones
    # =========================================================================
    # Drop old columns
    op.drop_column('travel_infos', 'is_arriving_by_flight')
    op.drop_column('travel_infos', 'airline_name')
    op.drop_column('travel_infos', 'flight_number')
    op.drop_column('travel_infos', 'departure_city')
    op.drop_column('travel_infos', 'departure_datetime')
    op.drop_column('travel_infos', 'arrival_datetime')
    op.drop_column('travel_infos', 'terminal')
    op.drop_column('travel_infos', 'pickup_notes')

    # Add new columns matching current model
    op.add_column('travel_infos', sa.Column('arrival_date', sa.Date(), nullable=True))
    op.add_column('travel_infos', sa.Column('arrival_time', sa.String(length=20), nullable=True))
    op.add_column('travel_infos', sa.Column('arrival_flight_number', sa.String(length=50), nullable=True))
    op.add_column('travel_infos', sa.Column('departure_date', sa.Date(), nullable=True))
    op.add_column('travel_infos', sa.Column('departure_time', sa.String(length=20), nullable=True))
    op.add_column('travel_infos', sa.Column('departure_flight_number', sa.String(length=50), nullable=True))
    op.add_column('travel_infos', sa.Column('needs_dropoff', sa.Boolean(), server_default='false'))
    op.add_column('travel_infos', sa.Column('special_requirements', sa.Text(), nullable=True))

    # =========================================================================
    # 5. Fix hotel_infos: drop old columns, add new ones
    # =========================================================================
    # Drop old columns
    op.drop_column('hotel_infos', 'is_using_suggested_hotel')
    op.drop_column('hotel_infos', 'hotel_address')
    op.drop_column('hotel_infos', 'floor_number')
    op.drop_column('hotel_infos', 'room_number')
    op.drop_column('hotel_infos', 'notes')

    # Add new columns matching current model
    op.add_column('hotel_infos', sa.Column('custom_hotel_address', sa.Text(), nullable=True))
    op.add_column('hotel_infos', sa.Column('room_type', sa.String(length=100), nullable=True))
    op.add_column('hotel_infos', sa.Column('number_of_rooms', sa.Integer(), server_default='1'))
    op.add_column('hotel_infos', sa.Column('special_requests', sa.Text(), nullable=True))
    op.add_column('hotel_infos', sa.Column('booking_confirmation', sa.String(length=200), nullable=True))

    # =========================================================================
    # 6. Fix media_uploads: rename file_size_bytes -> file_size
    # =========================================================================
    op.alter_column('media_uploads', 'file_size_bytes', new_column_name='file_size')

    # =========================================================================
    # 7. Fix guest_dress_preferences: rename needs_assistance -> needs_shopping_assistance
    # =========================================================================
    op.alter_column('guest_dress_preferences', 'needs_assistance', new_column_name='needs_shopping_assistance')


def downgrade() -> None:
    # Reverse column renames
    op.alter_column('guest_dress_preferences', 'needs_shopping_assistance', new_column_name='needs_assistance')
    op.alter_column('media_uploads', 'file_size', new_column_name='file_size_bytes')

    # Reverse hotel_infos changes
    op.drop_column('hotel_infos', 'booking_confirmation')
    op.drop_column('hotel_infos', 'special_requests')
    op.drop_column('hotel_infos', 'number_of_rooms')
    op.drop_column('hotel_infos', 'room_type')
    op.drop_column('hotel_infos', 'custom_hotel_address')
    op.add_column('hotel_infos', sa.Column('notes', sa.Text(), nullable=True))
    op.add_column('hotel_infos', sa.Column('room_number', sa.String(length=50), nullable=True))
    op.add_column('hotel_infos', sa.Column('floor_number', sa.String(length=20), nullable=True))
    op.add_column('hotel_infos', sa.Column('hotel_address', sa.Text(), nullable=True))
    op.add_column('hotel_infos', sa.Column('is_using_suggested_hotel', sa.Boolean(), nullable=True))

    # Reverse travel_infos changes
    op.drop_column('travel_infos', 'special_requirements')
    op.drop_column('travel_infos', 'needs_dropoff')
    op.drop_column('travel_infos', 'departure_flight_number')
    op.drop_column('travel_infos', 'departure_time')
    op.drop_column('travel_infos', 'departure_date')
    op.drop_column('travel_infos', 'arrival_flight_number')
    op.drop_column('travel_infos', 'arrival_time')
    op.drop_column('travel_infos', 'arrival_date')
    op.add_column('travel_infos', sa.Column('pickup_notes', sa.Text(), nullable=True))
    op.add_column('travel_infos', sa.Column('terminal', sa.String(length=50), nullable=True))
    op.add_column('travel_infos', sa.Column('arrival_datetime', sa.DateTime(), nullable=True))
    op.add_column('travel_infos', sa.Column('departure_datetime', sa.DateTime(), nullable=True))
    op.add_column('travel_infos', sa.Column('departure_city', sa.String(length=100), nullable=True))
    op.add_column('travel_infos', sa.Column('flight_number', sa.String(length=50), nullable=True))
    op.add_column('travel_infos', sa.Column('airline_name', sa.String(length=100), nullable=True))
    op.add_column('travel_infos', sa.Column('is_arriving_by_flight', sa.Boolean(), nullable=True))

    # Remove rsvp_submitted_at from guests
    op.drop_column('guests', 'rsvp_submitted_at')

    # Drop invitations and events tables
    op.drop_table('invitations')
    op.drop_table('events')
