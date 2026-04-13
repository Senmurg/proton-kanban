# Backend

FastAPI backend для Proton Kanban.

## Стек

- FastAPI
- SQLAlchemy 2.x
- Alembic
- PostgreSQL
- Pydantic Settings
- SQLAdmin

## Команды

```bash
docker compose exec backend alembic upgrade head
docker compose exec backend python -m app.main
```
