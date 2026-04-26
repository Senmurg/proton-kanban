import uuid

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.project import (
    ProjectCreate,
    ProjectMemberCreate,
    ProjectMemberRead,
    ProjectMemberUpdate,
    ProjectRead,
    ProjectUpdate,
)
from app.services.project_service import ProjectService

router = APIRouter()


@router.get("", response_model=list[ProjectRead])
def list_projects(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[ProjectRead]:
    service = ProjectService(db)
    return service.list_for_user(current_user=current_user, skip=skip, limit=limit)


@router.post("", response_model=ProjectRead, status_code=status.HTTP_201_CREATED)
def create_project(
    payload: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ProjectRead:
    service = ProjectService(db)
    return service.create(payload=payload, owner=current_user)


@router.get("/{project_id}", response_model=ProjectRead)
def get_project(
    project_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ProjectRead:
    service = ProjectService(db)
    return service.get_for_user(project_id=project_id, current_user=current_user)


@router.patch("/{project_id}", response_model=ProjectRead)
def update_project(
    project_id: uuid.UUID,
    payload: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ProjectRead:
    service = ProjectService(db)
    return service.update(project_id=project_id, payload=payload, current_user=current_user)


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    service = ProjectService(db)
    service.delete(project_id=project_id, current_user=current_user)
    return None


@router.get("/{project_id}/members", response_model=list[ProjectMemberRead])
def list_project_members(
    project_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[ProjectMemberRead]:
    service = ProjectService(db)
    return service.list_members(project_id=project_id, current_user=current_user)


@router.post("/{project_id}/members", response_model=ProjectMemberRead, status_code=status.HTTP_201_CREATED)
def add_project_member(
    project_id: uuid.UUID,
    payload: ProjectMemberCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ProjectMemberRead:
    service = ProjectService(db)
    return service.add_member(project_id=project_id, payload=payload, current_user=current_user)


@router.patch("/{project_id}/members/{member_id}", response_model=ProjectMemberRead)
def update_project_member(
    project_id: uuid.UUID,
    member_id: uuid.UUID,
    payload: ProjectMemberUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ProjectMemberRead:
    service = ProjectService(db)
    return service.update_member(
        project_id=project_id,
        member_id=member_id,
        payload=payload,
        current_user=current_user,
    )


@router.delete("/{project_id}/members/{member_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_project_member(
    project_id: uuid.UUID,
    member_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    service = ProjectService(db)
    service.remove_member(project_id=project_id, member_id=member_id, current_user=current_user)
    return None
