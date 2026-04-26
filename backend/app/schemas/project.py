import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field, field_validator

from app.models.project_member import ProjectRole
from app.schemas.common import ORMModel


class ProjectCreate(BaseModel):
    name: str = Field(min_length=2, max_length=255)
    slug: str = Field(min_length=2, max_length=255, pattern=r"^[a-z0-9-]+$")
    description: str | None = None


class ProjectUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=255)
    slug: str | None = Field(default=None, min_length=2, max_length=255, pattern=r"^[a-z0-9-]+$")
    description: str | None = None


class ProjectPermissions(BaseModel):
    can_view: bool = True
    can_update: bool
    can_delete: bool
    can_manage_members: bool


class ProjectRead(ORMModel):
    id: uuid.UUID
    name: str
    slug: str
    description: str | None
    owner_id: uuid.UUID
    current_user_role: ProjectRole
    permissions: ProjectPermissions
    created_at: datetime
    updated_at: datetime


class ProjectMemberUserRead(ORMModel):
    id: uuid.UUID
    email: EmailStr
    full_name: str | None
    is_active: bool


class ProjectMemberRead(ORMModel):
    id: uuid.UUID
    role: ProjectRole
    user: ProjectMemberUserRead
    created_at: datetime
    updated_at: datetime


class ProjectMemberCreate(BaseModel):
    email: EmailStr
    role: ProjectRole = ProjectRole.MEMBER

    @field_validator("role")
    @classmethod
    def validate_role(cls, value: ProjectRole) -> ProjectRole:
        if value == ProjectRole.OWNER:
            raise ValueError("Owner role cannot be assigned manually")
        return value


class ProjectMemberUpdate(BaseModel):
    role: ProjectRole

    @field_validator("role")
    @classmethod
    def validate_role(cls, value: ProjectRole) -> ProjectRole:
        if value == ProjectRole.OWNER:
            raise ValueError("Owner role cannot be assigned manually")
        return value
