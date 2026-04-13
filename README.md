# Proton Kanban

Fullstack starter for a kanban-style app:
- backend: FastAPI + SQLAlchemy + Alembic + PostgreSQL + SQLAdmin
- frontend: React + Vite + TypeScript + React Router + TanStack Query + MUI
- reverse proxy: Nginx

## Project structure

```text
backend/
frontend/
nginx/
docker-compose.yml
```

## Local domain on Windows

Open `C:\Windows\System32\drivers\etc\hosts` as Administrator and add:

```text
127.0.0.1 proton-kanban.local
```

After that the app will be available at:
- `http://proton-kanban.local/`
- `http://proton-kanban.local/admin`
- `http://proton-kanban.local/docs`

## Start

### PowerShell

```powershell
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
docker compose up --build -d
docker compose exec backend alembic upgrade head
```

### Bash

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
docker compose up --build -d
docker compose exec backend alembic upgrade head
```

## Routing

Nginx handles routing like this:
- `/` -> frontend (Vite dev server)
- `/api` -> backend API
- `/admin` -> SQLAdmin
- `/docs`, `/redoc`, `/openapi.json` -> FastAPI docs

## Notes

- For local development use `http://proton-kanban.local` as the main URL.
- The frontend uses relative API paths by default, so requests go through Nginx or the Vite dev proxy.
- If you want direct access during debugging, you can temporarily expose backend/frontend ports in `docker-compose.yml`.
