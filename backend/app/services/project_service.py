import uuid

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User
from app.repositories.project_repository import ProjectRepository
from app.schemas.project import ProjectCreate, ProjectUpdate


class ProjectService:
    def __init__(self, db: Session):
        self.db = db
        self.projects = ProjectRepository(db)

    def list_for_user(self, *, current_user: User, skip: int = 0, limit: int = 20):
        return self.projects.list_by_owner(current_user.id, skip=skip, limit=limit)

    def get_for_user(self, *, project_id: uuid.UUID, current_user: User):
        project = self.projects.get_by_id(project_id)
        if not project or project.owner_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
        return project

    def create(self, *, payload: ProjectCreate, owner: User):
        existing = self.projects.get_by_slug(payload.slug)
        if existing:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Slug already exists")
        return self.projects.create(
            name=payload.name,
            slug=payload.slug,
            description=payload.description,
            owner_id=owner.id,
        )

    def update(self, *, project_id: uuid.UUID, payload: ProjectUpdate, current_user: User):
        project = self.get_for_user(project_id=project_id, current_user=current_user)

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
        return project

    def delete(self, *, project_id: uuid.UUID, current_user: User) -> None:
        project = self.get_for_user(project_id=project_id, current_user=current_user)
        self.projects.delete(project)
