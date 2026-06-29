"""baseline — existing database state at Alembic introduction

Revision ID: 1425b6e1bb4b
Revises:
Create Date: 2026-06-22

This is a no-op baseline. It represents the state of the database
at the point Alembic was introduced. The DB already exists with real
data, so upgrade() does nothing — we stamp this revision instead of
running it. All future schema changes are captured in subsequent
revisions.
"""
from typing import Sequence, Union

revision: str = '1425b6e1bb4b'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
