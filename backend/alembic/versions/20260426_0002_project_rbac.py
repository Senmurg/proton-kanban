"""project rbac

Revision ID: 20260426_0002
Revises: 20260410_0001
Create Date: 2026-04-26 20:15:00.000000
"""

import uuid
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "20260426_0002"
down_revision: Union[str, None] = "20260410_0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    project_role = postgresql.ENUM(
        "owner",
        "manager",
        "member",
        "viewer",
        name="project_role",
        create_type=False,
    )
    project_role.create(bind, checkfirst=True)

    op.create_table(
        "project_members",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("project_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("role", project_role, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["project_id"], ["projects.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("project_id", "user_id", name="uq_project_members_project_id_user_id"),
    )
    op.create_index(op.f("ix_project_members_project_id"), "project_members", ["project_id"], unique=False)
    op.create_index(op.f("ix_project_members_user_id"), "project_members", ["user_id"], unique=False)

    projects = list(bind.execute(sa.text("SELECT id, owner_id FROM projects")).mappings())
    project_members_table = sa.table(
        "project_members",
        sa.column("id", postgresql.UUID(as_uuid=True)),
        sa.column("project_id", postgresql.UUID(as_uuid=True)),
        sa.column("user_id", postgresql.UUID(as_uuid=True)),
        sa.column("role", sa.String()),
    )
    if projects:
        op.bulk_insert(
            project_members_table,
            [
                {
                    "id": uuid.uuid4(),
                    "project_id": project["id"],
                    "user_id": project["owner_id"],
                    "role": "owner",
                }
                for project in projects
            ],
        )


def downgrade() -> None:
    bind = op.get_bind()
    op.drop_index(op.f("ix_project_members_user_id"), table_name="project_members")
    op.drop_index(op.f("ix_project_members_project_id"), table_name="project_members")
    op.drop_table("project_members")
    project_role = postgresql.ENUM(
        "owner",
        "manager",
        "member",
        "viewer",
        name="project_role",
        create_type=False,
    )
    project_role.drop(bind, checkfirst=True)
