from fastapi import FastAPI
from sqladmin import Admin, ModelView

from app.db.session import engine
from app.models.project import Project
from app.models.project_member import ProjectMember
from app.models.user import User


class UserAdmin(ModelView, model=User):
    name = "User"
    name_plural = "Users"
    icon = "fa-solid fa-users"
    column_list = [User.id, User.email, User.full_name, User.is_active, User.is_superuser, User.created_at]
    column_searchable_list = [User.email, User.full_name]
    column_sortable_list = [User.email, User.created_at]
    form_excluded_columns = [User.password_hash, User.owned_projects]


class ProjectAdmin(ModelView, model=Project):
    name = "Project"
    name_plural = "Projects"
    icon = "fa-solid fa-folder"
    column_list = [Project.id, Project.name, Project.slug, Project.owner_id, Project.created_at]
    column_searchable_list = [Project.name, Project.slug]
    column_sortable_list = [Project.name, Project.slug, Project.created_at]


class ProjectMemberAdmin(ModelView, model=ProjectMember):
    name = "Project Member"
    name_plural = "Project Members"
    icon = "fa-solid fa-user-group"
    column_list = [ProjectMember.id, ProjectMember.project_id, ProjectMember.user_id, ProjectMember.role, ProjectMember.created_at]
    column_searchable_list = [ProjectMember.role]
    column_sortable_list = [ProjectMember.created_at, ProjectMember.updated_at]


def setup_admin(app: FastAPI) -> None:
    admin = Admin(app=app, engine=engine, title="Dashboard Admin")
    admin.add_view(UserAdmin)
    admin.add_view(ProjectAdmin)
    admin.add_view(ProjectMemberAdmin)
