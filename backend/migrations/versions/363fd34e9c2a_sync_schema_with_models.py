"""sync schema with models

Revision ID: 363fd34e9c2a
Revises: 1425b6e1bb4b
Create Date: 2026-06-22

Brings the live database in sync with SQLAlchemy models:
- Drop events.location_maps_url (removed from model, unused)
- Change users.faculty from ENUM to VARCHAR(50) so new faculties
  can be added without a schema change
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

revision: str = '363fd34e9c2a'
down_revision: Union[str, Sequence[str], None] = '1425b6e1bb4b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_column('events', 'location_maps_url')

    op.alter_column(
        'users', 'faculty',
        existing_type=mysql.ENUM(
            'JIBS', 'JTH', 'Hälso', 'School of Communication', 'School of Education'
        ),
        type_=sa.String(length=50),
        existing_nullable=True,
    )


def downgrade() -> None:
    op.alter_column(
        'users', 'faculty',
        existing_type=sa.String(length=50),
        type_=mysql.ENUM(
            'JIBS', 'JTH', 'Hälso', 'School of Communication', 'School of Education'
        ),
        existing_nullable=True,
    )

    op.add_column(
        'events',
        sa.Column('location_maps_url', sa.VARCHAR(length=500), nullable=True),
    )
