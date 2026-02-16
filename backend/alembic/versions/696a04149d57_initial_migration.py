"""initial migration

Revision ID: 696a04149d57
Revises:
Create Date: 2026-01-26 18:00:38.990337

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '696a04149d57'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create weddings table
    op.create_table('weddings',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('couple_names', sa.String(length=200), nullable=False),
        sa.Column('wedding_date', sa.DateTime(), nullable=False),
        sa.Column('venue_name', sa.String(length=300), nullable=True),
        sa.Column('venue_address', sa.Text(), nullable=True),
        sa.Column('venue_city', sa.String(length=100), nullable=True),
        sa.Column('venue_country', sa.String(length=100), nullable=True),
        sa.Column('welcome_message', sa.Text(), nullable=True),
        sa.Column('cover_image_url', sa.String(), nullable=True),
        sa.Column('admin_email', sa.String(), nullable=False),
        sa.Column('admin_password_hash', sa.String(), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_weddings')),
        sa.UniqueConstraint('admin_email', name=op.f('uq_weddings_admin_email'))
    )

    # Create suggested_hotels table
    op.create_table('suggested_hotels',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('wedding_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('hotel_name', sa.String(length=200), nullable=False),
        sa.Column('address', sa.Text(), nullable=True),
        sa.Column('website_url', sa.String(length=500), nullable=True),
        sa.Column('phone', sa.String(length=50), nullable=True),
        sa.Column('distance_from_venue', sa.String(length=100), nullable=True),
        sa.Column('price_range', sa.String(length=100), nullable=True),
        sa.Column('star_rating', sa.Integer(), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('amenities', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('image_urls', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('booking_link', sa.String(length=500), nullable=True),
        sa.Column('display_order', sa.Integer(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.ForeignKeyConstraint(['wedding_id'], ['weddings.id'], name=op.f('fk_suggested_hotels_wedding_id_weddings')),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_suggested_hotels'))
    )

    # Create guests table
    op.create_table('guests',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('wedding_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('unique_token', sa.String(length=64), nullable=False),
        sa.Column('full_name', sa.String(length=200), nullable=False),
        sa.Column('email', sa.String(length=200), nullable=True),
        sa.Column('phone', sa.String(length=50), nullable=True),
        sa.Column('country_of_origin', sa.String(length=100), nullable=True),
        sa.Column('rsvp_status', sa.Enum('pending', 'confirmed', 'declined', 'maybe', name='rsvpstatus'), nullable=True),
        sa.Column('number_of_attendees', sa.Integer(), nullable=True),
        sa.Column('special_requests', sa.Text(), nullable=True),
        sa.Column('last_accessed_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['wedding_id'], ['weddings.id'], name=op.f('fk_guests_wedding_id_weddings')),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_guests'))
    )
    op.create_index(op.f('ix_unique_token'), 'guests', ['unique_token'], unique=True)

    # Create dress_codes table
    op.create_table('dress_codes',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('wedding_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('event_name', sa.String(length=100), nullable=False),
        sa.Column('event_date', sa.DateTime(), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('theme', sa.String(length=200), nullable=True),
        sa.Column('color_palette', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('dress_suggestions_men', sa.Text(), nullable=True),
        sa.Column('dress_suggestions_women', sa.Text(), nullable=True),
        sa.Column('image_urls', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('display_order', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['wedding_id'], ['weddings.id'], name=op.f('fk_dress_codes_wedding_id_weddings')),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_dress_codes'))
    )

    # Create food_menus table
    op.create_table('food_menus',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('wedding_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('event_name', sa.String(length=100), nullable=True),
        sa.Column('menu_items', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('dietary_options_available', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['wedding_id'], ['weddings.id'], name=op.f('fk_food_menus_wedding_id_weddings')),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_food_menus'))
    )

    # Create activities table
    op.create_table('activities',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('wedding_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('activity_name', sa.String(length=200), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('event_day', sa.Integer(), nullable=True),
        sa.Column('date_time', sa.DateTime(), nullable=True),
        sa.Column('duration_minutes', sa.Integer(), nullable=True),
        sa.Column('location', sa.String(length=300), nullable=True),
        sa.Column('max_participants', sa.Integer(), nullable=True),
        sa.Column('is_optional', sa.Boolean(), nullable=True),
        sa.Column('requires_signup', sa.Boolean(), nullable=True),
        sa.Column('image_url', sa.String(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('display_order', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['wedding_id'], ['weddings.id'], name=op.f('fk_activities_wedding_id_weddings')),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_activities'))
    )

    # Create travel_infos table
    op.create_table('travel_infos',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('guest_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('is_arriving_by_flight', sa.Boolean(), nullable=True),
        sa.Column('airline_name', sa.String(length=100), nullable=True),
        sa.Column('flight_number', sa.String(length=50), nullable=True),
        sa.Column('departure_city', sa.String(length=100), nullable=True),
        sa.Column('departure_datetime', sa.DateTime(), nullable=True),
        sa.Column('arrival_datetime', sa.DateTime(), nullable=True),
        sa.Column('arrival_airport', sa.String(length=200), nullable=True),
        sa.Column('terminal', sa.String(length=50), nullable=True),
        sa.Column('needs_pickup', sa.Boolean(), nullable=True),
        sa.Column('pickup_notes', sa.Text(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['guest_id'], ['guests.id'], name=op.f('fk_travel_infos_guest_id_guests')),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_travel_infos')),
        sa.UniqueConstraint('guest_id', name=op.f('uq_travel_infos_guest_id'))
    )

    # Create hotel_infos table
    op.create_table('hotel_infos',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('guest_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('is_using_suggested_hotel', sa.Boolean(), nullable=True),
        sa.Column('suggested_hotel_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('custom_hotel_name', sa.String(length=200), nullable=True),
        sa.Column('hotel_address', sa.Text(), nullable=True),
        sa.Column('floor_number', sa.String(length=20), nullable=True),
        sa.Column('room_number', sa.String(length=50), nullable=True),
        sa.Column('check_in_date', sa.Date(), nullable=True),
        sa.Column('check_out_date', sa.Date(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['guest_id'], ['guests.id'], name=op.f('fk_hotel_infos_guest_id_guests')),
        sa.ForeignKeyConstraint(['suggested_hotel_id'], ['suggested_hotels.id'], name=op.f('fk_hotel_infos_suggested_hotel_id_suggested_hotels')),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_hotel_infos')),
        sa.UniqueConstraint('guest_id', name=op.f('uq_hotel_infos_guest_id'))
    )

    # Create guest_dress_preferences table
    op.create_table('guest_dress_preferences',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('guest_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('dress_code_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('planned_outfit_description', sa.Text(), nullable=True),
        sa.Column('color_choice', sa.String(length=50), nullable=True),
        sa.Column('needs_assistance', sa.Boolean(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['dress_code_id'], ['dress_codes.id'], name=op.f('fk_guest_dress_preferences_dress_code_id_dress_codes')),
        sa.ForeignKeyConstraint(['guest_id'], ['guests.id'], name=op.f('fk_guest_dress_preferences_guest_id_guests')),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_guest_dress_preferences')),
        sa.UniqueConstraint('guest_id', 'dress_code_id', name='uq_guest_dress_code')
    )

    # Create guest_food_preferences table
    op.create_table('guest_food_preferences',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('guest_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('dietary_restrictions', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('allergies', sa.Text(), nullable=True),
        sa.Column('cuisine_preferences', sa.Text(), nullable=True),
        sa.Column('special_requests', sa.Text(), nullable=True),
        sa.Column('meal_size_preference', sa.Enum('regular', 'small', 'large', name='mealsizepreference'), nullable=True),
        sa.ForeignKeyConstraint(['guest_id'], ['guests.id'], name=op.f('fk_guest_food_preferences_guest_id_guests')),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_guest_food_preferences')),
        sa.UniqueConstraint('guest_id', name=op.f('uq_guest_food_preferences_guest_id'))
    )

    # Create guest_activities table
    op.create_table('guest_activities',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('guest_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('activity_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('number_of_participants', sa.Integer(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('registered_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['activity_id'], ['activities.id'], name=op.f('fk_guest_activities_activity_id_activities')),
        sa.ForeignKeyConstraint(['guest_id'], ['guests.id'], name=op.f('fk_guest_activities_guest_id_guests')),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_guest_activities')),
        sa.UniqueConstraint('guest_id', 'activity_id', name='uq_guest_activity')
    )

    # Create media_uploads table
    op.create_table('media_uploads',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('wedding_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('guest_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('file_type', sa.Enum('image', 'video', name='filetype'), nullable=False),
        sa.Column('file_name', sa.String(length=300), nullable=True),
        sa.Column('file_url', sa.String(length=500), nullable=True),
        sa.Column('file_size_bytes', sa.BigInteger(), nullable=True),
        sa.Column('thumbnail_url', sa.String(length=500), nullable=True),
        sa.Column('caption', sa.Text(), nullable=True),
        sa.Column('event_tag', sa.String(length=100), nullable=True),
        sa.Column('is_approved', sa.Boolean(), nullable=True),
        sa.Column('uploaded_at', sa.DateTime(), nullable=True),
        sa.Column('approved_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['guest_id'], ['guests.id'], name=op.f('fk_media_uploads_guest_id_guests')),
        sa.ForeignKeyConstraint(['wedding_id'], ['weddings.id'], name=op.f('fk_media_uploads_wedding_id_weddings')),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_media_uploads'))
    )


def downgrade() -> None:
    op.drop_table('media_uploads')
    op.drop_table('guest_activities')
    op.drop_table('guest_food_preferences')
    op.drop_table('guest_dress_preferences')
    op.drop_table('hotel_infos')
    op.drop_table('travel_infos')
    op.drop_table('activities')
    op.drop_table('food_menus')
    op.drop_table('dress_codes')
    op.drop_index(op.f('ix_unique_token'), table_name='guests')
    op.drop_table('guests')
    op.drop_table('suggested_hotels')
    op.drop_table('weddings')
    sa.Enum('pending', 'confirmed', 'declined', 'maybe', name='rsvpstatus').drop(op.get_bind())
    sa.Enum('regular', 'small', 'large', name='mealsizepreference').drop(op.get_bind())
    sa.Enum('image', 'video', name='filetype').drop(op.get_bind())
