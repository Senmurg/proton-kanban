from dataclasses import dataclass
import uuid

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.project import Project
from app.models.project_member import ProjectMember, ProjectRole
from app.models.user import User
from app.repositories.project_member_repository import ProjectMemberRepository
from app.repositories.project_repository import ProjectRepository
from app.repositories.user_repository import UserRepository
from app.schemas.project import (
    ProjectCreate,
    ProjectMemberCreate,
    ProjectMemberRead,
    ProjectMemberUpdate,
    ProjectPermissions,
    ProjectRead,
    ProjectUpdate,
)


@dataclass
class ProjectAccess:
    project: Project
    role: ProjectRole


PROJECT_EDIT_ROLES = {ProjectRole.OWNER, ProjectRole.MANAGER}
PROJECT_DELETE_ROLES = {ProjectRole.OWNER}
OWNER_MANAGED_ROLES = {ProjectRole.MANAGER, ProjectRole.MEMBER, ProjectRole.VIEWER}
MANAGER_MANAGED_ROLES = {ProjectRole.MEMBER, ProjectRole.VIEWER}


class ProjectService:
    def __init__(self, db: Session):
        self.db = db
        self.projects = ProjectRepository(db)
        self.members = ProjectMemberRepository(db)
        self.users = UserRepository(db)

    def list_for_user(self, *, current_user: User, skip: int = 0, limit: int = 20) -> list[ProjectRead]:
        memberships = self.members.list_for_user(current_user.id, skip=skip, limit=limit)
        return [
            self.serialize_project(ProjectAccess(project=membership.project, role=membership.role))
            for membership in memberships
            if membership.project is not None
        ]

    def get_for_user(self, *, project_id: uuid.UUID, current_user: User) -> ProjectRead:
        access = self._get_access_or_404(project_id=project_id, current_user=current_user)
        return self.serialize_project(access)

    def create(self, *, payload: ProjectCreate, owner: User) -> ProjectRead:
        existing = self.projects.get_by_slug(payload.slug)
        if existing:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Slug already exists")

        project = Project(
            name=payload.name,
            slug=payload.slug,
            description=payload.description,
            owner_id=owner.id,
        )
        self.db.add(project)
        self.db.flush()
        self.db.add(
            ProjectMember(
                project_id=project.id,
                user_id=owner.id,
                role=ProjectRole.OWNER,
            ),
        )
        self.db.commit()
        self.db.refresh(project)
        return self.serialize_project(ProjectAccess(project=project, role=ProjectRole.OWNER))

    def update(self, *, project_id: uuid.UUID, payload: ProjectUpdate, current_user: User) -> ProjectRead:
        access = self._get_access_or_404(project_id=project_id, current_user=current_user)
        self._ensure_can_update_project(access.role)

        project = access.project
        if payload.slug and payload.slug != project.slug:
            existing = self.projects.get_by_slug(payload.slug)
            if existing:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Slug already exists")
            project.slug = payload.slug

        if payload.name is not None:
            project.name = payload.name
        if payload.description is not None:
            project.description = payload.description

        self.db.add(project)
        self.db.commit()
        self.db.refresh(project)
        return self.serialize_project(ProjectAccess(project=project, role=access.role))

    def delete(self, *, project_id: uuid.UUID, current_user: User) -> None:
        access = self._get_access_or_404(project_id=project_id, current_user=current_user)
        self._ensure_can_delete_project(access.role)
        self.projects.delete(access.project)

    def list_members(self, *, project_id: uuid.UUID, current_user: User) -> list[ProjectMemberRead]:
        access = self._get_access_or_404(project_id=project_id, current_user=current_user)
        memberships = self.members.list_for_project(access.project.id)
        return [ProjectMemberRead.model_validate(membership) for membership in memberships]

    def add_member(
        self,
        *,
        project_id: uuid.UUID,
        payload: ProjectMemberCreate,
        current_user: User,
    ) -> ProjectMemberRead:
        access = self._get_access_or_404(project_id=project_id, current_user=current_user)
        self._ensure_can_assign_role(actor_role=access.role, new_role=payload.role)

        user = self.users.get_by_email(payload.email)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        if not user.is_active:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User is inactive")

        existing = self.members.get_by_project_and_user(access.project.id, user.id)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User is already a project member",
            )

        self.members.create(project_id=access.project.id, user_id=user.id, role=payload.role)
        membership = self.members.get_by_project_and_user(
            access.project.id,
            user.id,
            include_user=True,
        )
        if not membership:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Member was not created")
        return ProjectMemberRead.model_validate(membership)

    def update_member(
        self,
        *,
        project_id: uuid.UUID,
        member_id: uuid.UUID,
        payload: ProjectMemberUpdate,
        current_user: User,
    ) -> ProjectMemberRead:
        access = self._get_access_or_404(project_id=project_id, current_user=current_user)
        membership = self.members.get_by_id(project_id, member_id, include_user=True)
        if not membership:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project member not found")

        self._ensure_can_manage_members(
            actor=current_user,
            actor_role=access.role,
            target=membership,
            new_role=payload.role,
        )

        membership.role = payload.role
        self.members.save(membership)
        refreshed_membership = self.members.get_by_id(project_id, member_id, include_user=True)
        if not refreshed_membership:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Member was not updated")
        return ProjectMemberRead.model_validate(refreshed_membership)

    def remove_member(self, *, project_id: uuid.UUID, member_id: uuid.UUID, current_user: User) -> None:
        access = self._get_access_or_404(project_id=project_id, current_user=current_user)
        membership = self.members.get_by_id(project_id, member_id, include_user=True)
        if not membership:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project member not found")
        self._ensure_can_manage_members(actor=current_user, actor_role=access.role, target=membership)
        self.members.delete(membership)

    def serialize_project(self, access: ProjectAccess) -> ProjectRead:
        project = access.project
        return ProjectRead(
            id=project.id,
            name=project.name,
            slug=project.slug,
            description=project.description,
            owner_id=project.owner_id,
            current_user_role=access.role,
            permissions=ProjectPermissions(
                can_update=access.role in PROJECT_EDIT_ROLES,
                can_delete=access.role in PROJECT_DELETE_ROLES,
                can_manage_members=access.role in {ProjectRole.OWNER, ProjectRole.MANAGER},
            ),
            created_at=project.created_at,
            updated_at=project.updated_at,
        )

    def _get_access_or_404(self, *, project_id: uuid.UUID, current_user: User) -> ProjectAccess:
        membership = self.members.get_by_project_and_user(
            project_id,
            current_user.id,
            include_project=True,
        )
        if not membership or membership.project is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
        return ProjectAccess(project=membership.project, role=membership.role)

    def _ensure_can_update_project(self, role: ProjectRole) -> None:
        if role not in PROJECT_EDIT_ROLES:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")

    def _ensure_can_delete_project(self, role: ProjectRole) -> None:
        if role not in PROJECT_DELETE_ROLES:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")

    def _ensure_can_assign_role(self, *, actor_role: ProjectRole, new_role: ProjectRole) -> None:
        if new_role not in self._get_assignable_roles(actor_role):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")

    def _ensure_can_manage_members(
        self,
        *,
        actor: User,
        actor_role: ProjectRole,
        target: ProjectMember,
        new_role: ProjectRole | None = None,
    ) -> None:
        if target.user_id == actor.id and target.role != ProjectRole.OWNER and new_role is None:
            return

        if target.role == ProjectRole.OWNER:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Owner membership cannot be changed")

        if target.role not in self._get_manageable_roles(actor_role):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")

        if new_role is not None and new_role not in self._get_assignable_roles(actor_role):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")

    def _get_assignable_roles(self, actor_role: ProjectRole) -> set[ProjectRole]:
        if actor_role == ProjectRole.OWNER:
            return OWNER_MANAGED_ROLES
        if actor_role == ProjectRole.MANAGER:
            return MANAGER_MANAGED_ROLES
        return set()

    def _get_manageable_roles(self, actor_role: ProjectRole) -> set[ProjectRole]:
        if actor_role == ProjectRole.OWNER:
            return OWNER_MANAGED_ROLES
        if actor_role == ProjectRole.MANAGER:
            return MANAGER_MANAGED_ROLES
        return set()
