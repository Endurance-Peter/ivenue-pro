"""Add development email and password authentication.

Revision ID: 0004_password_auth
Revises: 0003_align_model_indexes
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = "0004_password_auth"
down_revision: str | None = "0003_align_model_indexes"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    with op.batch_alter_table("users") as batch_op:
        batch_op.alter_column("phone", existing_type=sa.String(length=20), nullable=True)
        batch_op.add_column(sa.Column("password_hash", sa.String(length=255), nullable=True))


def downgrade() -> None:
    with op.batch_alter_table("users") as batch_op:
        batch_op.drop_column("password_hash")
        batch_op.alter_column("phone", existing_type=sa.String(length=20), nullable=False)
