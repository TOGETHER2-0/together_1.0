"""widen avatar_url to MEDIUMTEXT and add users.language

Avatar uploads are stored as base64 data: URLs, which overflow the old
VARCHAR(500) column. Widen it to MEDIUMTEXT so they persist. Also add a
per-account language preference (en/sv), defaulting to 'en'.

Revision ID: a1b2c3d4e5f6
Revises: 363fd34e9c2a
Create Date: 2026-06-29
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = '363fd34e9c2a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column(
        'users', 'avatar_url',
        existing_type=mysql.VARCHAR(length=500),
        type_=mysql.MEDIUMTEXT(),
        existing_nullable=True,
    )
    op.add_column(
        'users',
        sa.Column('language', sa.String(length=5), nullable=True, server_default='en'),
    )


def downgrade() -> None:
    op.drop_column('users', 'language')
    op.alter_column(
        'users', 'avatar_url',
        existing_type=mysql.MEDIUMTEXT(),
        type_=mysql.VARCHAR(length=500),
        existing_nullable=True,
    )
