"""Add chatbot settings and logs tables

Revision ID: d3e4f5a6b7c8
Revises: c2d3e4f5a6b7
Create Date: 2026-02-21 12:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'd3e4f5a6b7c8'
down_revision: Union[str, None] = 'c2d3e4f5a6b7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'chatbot_settings',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('wedding_id', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('weddings.id'), nullable=False, unique=True),
        sa.Column('chatbot_name', sa.String(100), server_default='Rada'),
        sa.Column('greeting_message_en', sa.Text(), nullable=True),
        sa.Column('greeting_message_ar', sa.Text(), nullable=True),
        sa.Column('suggested_questions_en', postgresql.JSON(), nullable=True),
        sa.Column('suggested_questions_ar', postgresql.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
    )

    op.create_table(
        'chatbot_logs',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('wedding_id', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('weddings.id'), nullable=False),
        sa.Column('guest_id', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('guests.id'), nullable=True),
        sa.Column('session_id', sa.String(100), nullable=False),
        sa.Column('user_message', sa.Text(), nullable=False),
        sa.Column('bot_response', sa.Text(), nullable=False),
        sa.Column('language', sa.String(5), server_default='en'),
        sa.Column('message_type', sa.String(20), server_default='question'),
        sa.Column('topic_detected', sa.String(50), nullable=True),
        sa.Column('was_helpful', sa.Boolean(), nullable=True),
        sa.Column('could_not_answer', sa.Boolean(), server_default='false'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
    )

    # Index for faster log queries
    op.create_index('ix_chatbot_logs_wedding_id', 'chatbot_logs', ['wedding_id'])
    op.create_index('ix_chatbot_logs_session_id', 'chatbot_logs', ['session_id'])


def downgrade() -> None:
    op.drop_index('ix_chatbot_logs_session_id', table_name='chatbot_logs')
    op.drop_index('ix_chatbot_logs_wedding_id', table_name='chatbot_logs')
    op.drop_table('chatbot_logs')
    op.drop_table('chatbot_settings')
