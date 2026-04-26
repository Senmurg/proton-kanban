import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.models.project import Project
from app.models.project_member import ProjectMember, ProjectRole


class ProjectMemberRepository:
    def __init__(self, db: Session):
        self.db = db

    def list_for_user(self, user_id: uuid.UUID, *, skip: int = 0, limit: int = 20) -> list[ProjectMember]:
        stmt = (
            select(ProjectMember)
            .join(ProjectMember.project)
            .options(joinedload(ProjectMember.project))
            .where(ProjectMember.user_id == user_id)
            .order_by(Project.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return list(self.db.execute(stmt).unique().scalars().all())

    def list_for_project(self, project_id: uuid.UUID) -> list[ProjectMember]:
        stmt = (
            select(ProjectMember)
            .options(joinedload(ProjectMember.user))
            .where(ProjectMember.project_id == project_id)
            .order_by(ProjectMember.created_at.asc())
        )
        return list(self.db.execute(stmt).unique().scalars().all())

    def get_by_project_and_user(
        self,
        project_id: uuid.UUID,
        user_id: uuid.UUID,
        *,
        include_project: bool = False,
        include_user: bool = False,
    ) -> ProjectMember | None:
        stmt = select(ProjectMember).where(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == user_id,
        )
        if include_project:
            stmt = stmt.options(joinedload(ProjectMember.project))
        if include_user:
            stmt = stmt.options(joinedload(ProjectMember.user))
        return self.db.execute(stmt).unique().scalar_one_or_none()

    def get_by_id(
        self,
        project_id: uuid.UUID,
        member_id: uuid.UUID,
        *,
        include_project: bool = False,
        include_user: bool = False,
    ) -> ProjectMember | None:
        stmt = select(ProjectMember).where(
            ProjectMember.project_id == project_id,
            ProjectMember.id == member_id,
        )
        if include_project:
            stmt = stmt.options(joinedload(ProjectMember.project))
        if include_user:
            stmt = stmt.options(joinedload(ProjectMember.user))
        return self.db.execute(stmt).unique().scalar_one_or_none()

    def create(self, *, project_id: uuid.UUID, user_id: uuid.UUID, role: ProjectRole) -> ProjectMember:
        membership = ProjectMember(project_id=project_id, user_id=user_id, role=role)
        self.db.add(membership)
        self.db.commit()
        self.db.refresh(membership)
        return membership

    def save(self, membership: ProjectMember) -> ProjectMember:
        self.db.add(membership)
        self.db.commit()
        self.db.refresh(membership)
        return membership

    def delete(self, membership: ProjectMember) -> None:
        self.db.delete(membership)
        self.db.commit()
