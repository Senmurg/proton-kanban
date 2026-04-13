from fastapi import FastAPI
from sqladmin import Admin, ModelView

from app.db.session import engine
from app.models.project import Project
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


def setup_admin(app: FastAPI) -> None:
    admin = Admin(app=app, engine=engine, title="Dashboard Admin")
    admin.add_view(UserAdmin)
    admin.add_view(ProjectAdmin)
