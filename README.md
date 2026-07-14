<div align="center">

# LOOFT — Team Report Management System

**A weekly report generator and team analytics dashboard for agile software teams.**

Team members submit structured weekly reports (tasks, blockers, hours). Managers get a real‑time compliance dashboard, historical trends, and an AI assistant that can answer questions about the team's reports and generate executive summaries.

[![Python](https://img.shields.io/badge/Python-3.12+-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://docs.docker.com/compose/)

[Quick Start](#quick-start) • [Setup Instructions](#setup-instructions) • [API Reference](#api-reference) • [Project Structure](#project-structure)

</div>

---

## Setup Instructions at a Glance

This project can be run in **two ways**. Pick whichever fits what you're doing.

| Option                                                           | What it does                                                         | Best for                                  |
| ---------------------------------------------------------------- | -------------------------------------------------------------------- | ----------------------------------------- |
| **[Option 1 — Local Development](#option-1--local-development)** | Docker for the **database only**; backend & frontend run **locally** | Active development, debugging, hot-reload |
| **[Option 2 — Docker Compose](#option-2--docker-compose)**       | **Single command** starts everything (DB + backend + frontend)       | Quick review, demos, onboarding           |

Every setup path below is broken into the same four steps so you always know where you are:

1. **Installing dependencies**
2. **Running the database**
3. **Running the backend**
4. **Running the frontend**

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Setup Instructions](#setup-instructions)
  - [Option 1 — Local Development](#option-1--local-development)
  - [Option 2 — Docker Compose](#option-2--docker-compose)
- [Environment Variables](#environment-variables)
- [Authentication & Roles](#authentication--roles)
- [Data Model](#data-model)
- [API Reference](#api-reference)
- [AI Assistant](#ai-assistant)
- [Testing](#testing)
- [Resetting the Database](#resetting-the-database)
- [Troubleshooting](#troubleshooting)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

**LOOFT** replaces the "reply-all status update email" with a structured weekly reporting workflow:

- **Team members** log completed tasks, planned tasks, blockers, and hours worked each week, tagged to a project.
- **Managers** get a live dashboard of submission compliance, task trends, workload distribution by project, and an activity feed — plus an AI assistant that can be asked natural-language questions about the team's reports.

The codebase is split into two independently deployable services:

- **`backend/`** — a FastAPI + PostgreSQL REST API
- **`frontend/`** — a Next.js (App Router) single-page application

---

## Features

- **Weekly report workflow** — Draft → Submit lifecycle, with automatic `LATE` status if submitted after the reporting week ends (Monday–Sunday).
- **Role-based access control** — `TEAM_MEMBER` and `MANAGER` roles enforced at the route level. The first user to register with the configured admin email is auto-promoted to `MANAGER`, solving the bootstrap problem.
- **Project/category tagging** — Managers define projects (with a color code for charts) and assign team members to them.
- **Manager dashboard** — KPI summary, per-user submission compliance, historical completed-task trend, workload distribution by project, and a recent-activity feed — all backed by dedicated aggregation endpoints (Recharts-ready).
- **AI assistant (Manager only)**:
  - **Conversational chat** over recent report data using a Retrieval-Augmented Generation (RAG) pipeline (Pinecone vector store + OpenAI/Gemini).
  - **AI-generated weekly executive summary** in Markdown, aggregating completed tasks, unresolved blockers, and hours for a given week.
- **Soft deletes** — Projects are soft-deleted, preserving historical report integrity even after a project is retired.
- **Cookie-based JWT auth** — HttpOnly, SameSite=Lax cookies; no tokens touch `localStorage`.

---

## Tech Stack

### Backend

| Layer      | Technology                                               |
| ---------- | -------------------------------------------------------- |
| Framework  | FastAPI 0.115 (async)                                    |
| Database   | PostgreSQL 16, SQLAlchemy 2.0 (async, `asyncpg` driver)  |
| Migrations | Alembic                                                  |
| Auth       | JWT (PyJWT) in HttpOnly cookies, Argon2 password hashing |
| Validation | Pydantic v2 / pydantic-settings                          |
| AI / RAG   | OpenAI & Gemini clients, Pinecone vector store           |
| Testing    | pytest, pytest-asyncio, in-memory SQLite                 |
| Tooling    | Ruff (lint)                                              |

### Frontend

| Layer            | Technology                        |
| ---------------- | --------------------------------- |
| Framework        | Next.js 16 (App Router), React 19 |
| Styling          | Tailwind CSS 4                    |
| Data fetching    | Axios + TanStack React Query v5   |
| State management | Zustand (auth/UI state)           |
| Forms            | React Hook Form + Zod resolvers   |
| Charts           | Recharts                          |
| Icons            | Lucide React                      |

### Infrastructure

| Concern            | Technology                                       |
| ------------------ | ------------------------------------------------ |
| Containerization   | Docker, Docker Compose                           |
| Reverse dependency | Backend waits on DB healthcheck before migrating |

---

## Architecture

```mermaid
flowchart LR
    subgraph Client["Browser"]
        FE["Next.js Frontend<br/>(port 3000)"]
    end

    subgraph Server["Application Tier"]
        BE["FastAPI Backend<br/>(port 8000)<br/>/api/v1"]
    end

    subgraph Data["Data Tier"]
        DB[("PostgreSQL 16<br/>(port 5432)")]
        VEC[("Pinecone<br/>Vector Store")]
    end

    subgraph AI["AI Providers"]
        OAI["OpenAI"]
        GEM["Gemini"]
    end

    FE -- "HttpOnly JWT cookie<br/>REST / JSON" --> BE
    BE -- "asyncpg / SQLAlchemy" --> DB
    BE -- "RAG context retrieval" --> VEC
    BE -- "chat / summary generation" --> OAI
    BE -- "chat / summary generation" --> GEM
```

**Request flow:** the frontend never talks to Postgres or the AI providers directly — every call goes through the FastAPI backend's `/api/v1` surface, which owns auth, authorization, and data access.

---

## Project Structure

```text
team-report-management-system/
├── backend/                        # FastAPI application
│   ├── alembic/                    # Database schema migrations
│   ├── app/
│   │   ├── core/                   # Config, security, DB session, dependencies, enums
│   │   ├── models/                 # SQLAlchemy ORM models (User, Project, WeeklyReport, ...)
│   │   ├── repositories/           # Data-access layer (query encapsulation)
│   │   ├── routers/                # API route handlers (auth, users, projects, reports, dashboard, ai)
│   │   ├── schemas/                # Pydantic request/response models
│   │   ├── services/               # Business logic (+ ai_services/ for LLM & vector clients)
│   │   ├── middleware/             # Request logging middleware
│   │   ├── config.py               # Pydantic Settings (env-driven configuration)
│   │   └── main.py                 # FastAPI app factory & entry point
│   ├── tests/                      # pytest test suite (in-memory SQLite)
│   ├── Dockerfile
│   ├── requirements.txt
│   └── .env.example
├── frontend/                        # Next.js application
│   ├── src/
│   │   ├── app/                     # App Router pages & layouts
│   │   ├── components/              # Reusable UI components
│   │   ├── features/                # Feature-scoped modules (reports, dashboard, auth, ...)
│   │   ├── hooks/                   # Custom React hooks
│   │   ├── lib/                     # Axios client, query client, utilities
│   │   ├── stores/                  # Zustand stores
│   │   ├── types/                   # Shared TypeScript types
│   │   └── middleware.ts            # Next.js route middleware (auth redirects)
│   ├── Dockerfile
│   ├── package.json
│   └── .env.example
├── docker-compose.yml               # Full-stack orchestration (Option 2)
└── README.md
```

---

## Prerequisites

| Tool        | Version  | Required for                                  |
| ----------- | -------- | --------------------------------------------- |
| **Docker**  | Latest   | Database (Option 1) / All services (Option 2) |
| **Node.js** | v18.0.0+ | Frontend — Option 1 only                      |
| **Python**  | v3.12+   | Backend — Option 1 only                       |
| **npm**     | v9+      | Frontend package management                   |

> If you use **Option 2 (Docker Compose)**, Docker is the _only_ thing you need installed locally — Node.js and Python are not required on your host machine.

---

## Quick Start

For reviewers who just want the app running as fast as possible:

```bash
git clone https://github.com/adith23/team-report-management-system.git
cd team-report-management-system
docker compose up --build
```

Then open **http://localhost:3000**. See [Option 2](#option-2--docker-compose) for full details.

---

## Setup Instructions

Choose **one** of the two options below.

### Option 1 — Local Development

Docker runs **only PostgreSQL**. The backend and frontend run directly on your machine, giving you hot-reload, breakpoints, and a faster inner dev loop.

#### 1. Installing Dependencies

Clone the repository first:

```bash
git clone https://github.com/adith23/team-report-management-system.git
cd team-report-management-system
```

**Backend dependencies:**

```bash
cd backend
python3 -m venv venv

# Activate the virtual environment
source venv/bin/activate        # Linux / macOS
venv\Scripts\activate           # Windows

pip install -r requirements.txt
```

**Frontend dependencies** (in a separate terminal):

```bash
cd frontend
npm install
```

#### 2. Running the Database

Start a disposable PostgreSQL container:

```bash
docker run --name team-reports-db -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=team_reports_db -p 5433:5432 -d postgres:16
```

Confirm it's running:

```bash
docker ps --filter name=team-reports-db
```

#### 3. Running the Backend

From the `backend/` directory, with the virtual environment activated:

```bash
# Configure environment variables
cp .env.example .env          # Linux / macOS
copy .env.example .env        # Windows (CMD)
```

Open `.env` and confirm `DATABASE_URL` matches the container you just started:

```env
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5433/team_reports_db
```

Apply database migrations, then start the API server:

```bash
alembic upgrade head
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The backend is now live at **http://localhost:8000**.

#### 4. Running the Frontend

From the `frontend/` directory, in a **new terminal**:

```bash
cp .env.example .env.local    # Linux / macOS
copy .env.example .env.local  # Windows (CMD)
```

The default value works out of the box:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

Start the dev server:

```bash
npm run dev
```

The frontend is now live at **http://localhost:3000**.

#### 5. Verify Everything Works

| Service              | URL                          | Expected result               |
| -------------------- | ---------------------------- | ----------------------------- |
| Backend health check | http://localhost:8000/health | `{"status": "healthy", ...}`  |
| API docs (Swagger)   | http://localhost:8000/docs   | Interactive API documentation |
| API docs (Redoc)     | http://localhost:8000/redoc  | Alternative API documentation |
| Frontend             | http://localhost:3000        | Login page                    |

---

### Option 2 — Docker Compose

A **single command** starts all three services — PostgreSQL, FastAPI, and Next.js — with no local Python or Node.js installation required.

#### 1. Installing Dependencies

The only "dependency" you need on your host is Docker itself. Dependencies for the backend (`pip install`) and frontend (`npm install`) are installed automatically **inside the container images** the first time you build:

```bash
git clone https://github.com/adith23/team-report-management-system.git
cd team-report-management-system
```

#### 2. Running the Database, Backend, and Frontend Together

From the project root:

```bash
docker compose up --build
```

This single command handles all three tiers:

- **Database** — starts a `postgres:16` container and waits for a passing healthcheck before anything else proceeds.
- **Backend** — builds the FastAPI image, runs `alembic upgrade head` automatically, then starts Uvicorn on port `8000`.
- **Frontend** — builds the Next.js image and starts the dev server on port `3000`.

> **First build** downloads images and installs all dependencies (~2–3 minutes). **Subsequent starts** reuse cached layers (~5 seconds).

To run in the background instead:

```bash
docker compose up --build -d
```

#### 3. Verify Everything Works

| Service              | URL                          | Expected result               |
| -------------------- | ---------------------------- | ----------------------------- |
| Backend health check | http://localhost:8000/health | `{"status": "healthy", ...}`  |
| API docs (Swagger)   | http://localhost:8000/docs   | Interactive API documentation |
| Frontend             | http://localhost:3000        | Login page                    |

#### 4. Useful Docker Compose Commands

```bash
# Tail logs for a specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f db

# Stop all services (keeps data)
docker compose down

# Stop all services AND wipe the database volume
docker compose down -v
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable                          | Required | Default                                                                 | Description                                                       |
| --------------------------------- | -------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `APP_NAME`                        | No       | `Team Report Management System`                                         | Display name used in API metadata                                 |
| `APP_ENV`                         | No       | `development`                                                           | `development` or `production`                                     |
| `DEBUG`                           | No       | `true`                                                                  | Enables `/docs` and `/redoc`; disable in production               |
| `DATABASE_URL`                    | **Yes**  | `postgresql+asyncpg://postgres:password@localhost:5433/team_reports_db` | Async Postgres DSN: `postgresql+asyncpg://user:pass@host:port/db` |
| `JWT_SECRET_KEY`                  | **Yes**  | —                                                                       | Secret used to sign JWTs — **must** be changed in production      |
| `JWT_ALGORITHM`                   | No       | `HS256`                                                                 | JWT signing algorithm                                             |
| `JWT_ACCESS_TOKEN_EXPIRE_MINUTES` | No       | `1440`                                                                  | Token lifetime in minutes (default: 24h)                          |
| `CORS_ORIGINS`                    | No       | `["http://localhost:3000", ...]`                                        | JSON array of allowed frontend origins                            |
| `ADMIN_BOOTSTRAP_EMAIL`           | No       | `admin@company.com`                                                     | Email that receives the `MANAGER` role on first registration      |
| `OPENAI_API_KEY`                  | No       | —                                                                       | Enables the OpenAI-backed AI assistant                            |
| `GEMINI_API_KEY`                  | No       | —                                                                       | Enables the Gemini-backed AI assistant                            |
| `PINECONE_API_KEY`                | No       | —                                                                       | Enables RAG context retrieval for the AI chat assistant           |
| `PINECONE_INDEX_NAME`             | No       | `team-reports`                                                          | Pinecone index used for report embeddings                         |

> The AI assistant endpoints are **optional**. Without the AI keys configured, the rest of the application (auth, reports, dashboard) works normally — only `/api/v1/ai/*` will be unavailable.

### Frontend (`frontend/.env.local`)

| Variable              | Required | Default                        | Description                             |
| --------------------- | -------- | ------------------------------ | --------------------------------------- |
| `NEXT_PUBLIC_API_URL` | **Yes**  | `http://localhost:8000/api/v1` | Base URL the frontend calls for the API |

---

## Authentication & Roles

- Auth is **cookie-based**: on login, the backend issues a JWT and sets it as an `HttpOnly`, `SameSite=Lax` cookie. The token never touches browser JavaScript or `localStorage`.
- There is no seeded admin account. **The first user who registers with the email set in `ADMIN_BOOTSTRAP_EMAIL`** (default `admin@company.com`) is automatically granted the `MANAGER` role. Every other registration defaults to `TEAM_MEMBER`.
- Managers can promote or demote other users from **Account Settings → User Management** in the app, or via `PATCH /api/v1/users/{user_id}/role`.

| Role          | Can do                                                                                                                                                            |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `TEAM_MEMBER` | Create/edit/submit/delete **own** weekly reports; view own report history                                                                                         |
| `MANAGER`     | Everything above, plus: manage projects, assign users to projects, view all team reports, access the analytics dashboard, use the AI assistant, manage user roles |

---

## Data Model

```mermaid
erDiagram
    USER ||--o{ WEEKLY_REPORT : submits
    USER ||--o{ PROJECT : creates
    USER }o--o{ PROJECT : "assigned to"
    PROJECT ||--o{ WEEKLY_REPORT : categorizes
    WEEKLY_REPORT ||--o{ REPORT_TASK : contains
    WEEKLY_REPORT ||--o{ REPORT_BLOCKER : contains

    USER {
        uuid id PK
        string email
        string full_name
        string hashed_password
        enum role
        bool is_active
    }
    PROJECT {
        uuid id PK
        string name
        string color_hex
        bool is_active
        uuid created_by FK
    }
    WEEKLY_REPORT {
        uuid id PK
        uuid user_id FK
        uuid project_id FK
        date week_start
        date week_end
        enum status
        numeric hours_worked
        datetime submitted_at
    }
    REPORT_TASK {
        uuid id PK
        uuid report_id FK
        enum task_type
        text description
        int sort_order
    }
    REPORT_BLOCKER {
        uuid id PK
        uuid report_id FK
        text description
        bool is_resolved
        int sort_order
    }
```

**Key constraints:**

- One report per `(user, project, week_start)` — enforced with a composite unique constraint.
- `week_end` must be after `week_start`; `hours_worked` must be non-negative — enforced with database check constraints.
- Deleting a project **soft-deletes** it (`is_active = false`) rather than removing it, so historical reports remain valid.

---

## API Reference

All endpoints are mounted under `/api/v1`. Full interactive documentation is available at `/docs` (Swagger) and `/redoc` while `DEBUG=true`.

| Method | Endpoint                             | Access        | Description                                                     |
| ------ | ------------------------------------ | ------------- | --------------------------------------------------------------- |
| POST   | `/auth/register`                     | Public        | Register a new user                                             |
| POST   | `/auth/login`                        | Public        | Authenticate and set the auth cookie                            |
| POST   | `/auth/logout`                       | Authenticated | Clear the auth cookie                                           |
| GET    | `/auth/me`                           | Authenticated | Get the current session's user                                  |
| GET    | `/users/`                            | Manager       | List active user accounts (paginated)                           |
| PATCH  | `/users/{user_id}/role`              | Manager       | Promote/demote a user's role                                    |
| POST   | `/projects/`                         | Manager       | Create a project                                                |
| GET    | `/projects/`                         | Authenticated | List active projects                                            |
| PUT    | `/projects/{project_id}`             | Manager       | Update a project                                                |
| DELETE | `/projects/{project_id}`             | Manager       | Soft-delete a project                                           |
| POST   | `/projects/{project_id}/assign`      | Manager       | Assign team members to a project                                |
| POST   | `/reports/?submit={bool}`            | Authenticated | Create a weekly report (optionally submit it)                   |
| GET    | `/reports/my`                        | Authenticated | Get the current user's report history                           |
| GET    | `/reports/team`                      | Manager       | Get all team reports, with filters                              |
| GET    | `/reports/{report_id}`               | Authenticated | Get a single report's full detail                               |
| PUT    | `/reports/{report_id}?submit={bool}` | Owner         | Update a report (reverts to `DRAFT` if edited after submission) |
| POST   | `/reports/{report_id}/submit`        | Owner         | Submit a draft report                                           |
| DELETE | `/reports/{report_id}`               | Owner         | Delete a draft report                                           |
| GET    | `/dashboard/metrics`                 | Manager       | KPI overview (report counts, compliance, blockers)              |
| GET    | `/dashboard/submission-status`       | Manager       | Per-user submission compliance for a week                       |
| GET    | `/dashboard/tasks-trend`             | Manager       | Historical completed-task counts                                |
| GET    | `/dashboard/workload-distribution`   | Manager       | Task counts grouped by project                                  |
| GET    | `/dashboard/recent-activity`         | Manager       | Chronological report activity feed                              |
| POST   | `/ai/chat`                           | Manager       | Ask the AI assistant about recent reports                       |
| GET    | `/ai/weekly-summary`                 | Manager       | Generate an AI executive summary for a week                     |

---

## AI Assistant

The AI assistant (Manager-only, gated behind `require_role(MANAGER)`) is composed of two capabilities:

1. **Weekly summary generation** — aggregates all reports submitted for a given week (tasks completed, tasks planned, unresolved blockers, hours) and asks an LLM (OpenAI or Gemini, via a strategy-pattern client) to produce a polished Markdown executive summary.
2. **Conversational RAG chat** — report content is embedded and stored in a Pinecone vector index; incoming questions are embedded and matched against that index to retrieve relevant report context, which is then passed to the LLM alongside the user's question.

Both features degrade gracefully: if `OPENAI_API_KEY`, `GEMINI_API_KEY`, or `PINECONE_API_KEY` are not set, the rest of the application continues to function — only the `/api/v1/ai/*` endpoints are affected.

---

## Testing

The backend test suite uses **pytest** with an in-memory async SQLite database, so tests run without any external Postgres dependency.

```bash
cd backend
source venv/bin/activate   # ensure your virtual environment is active
pytest
```

Test coverage includes authentication, user management, project management, weekly reports, and dashboard aggregation (`tests/test_auth.py`, `test_users.py`, `test_projects.py`, `test_reports.py`, `test_dashboard.py`).

---

## Resetting the Database

### Option 1 users (local backend)

```bash
cd backend
source venv/bin/activate
python reset_db.py        # drops & recreates the schema
alembic upgrade head       # re-apply migrations
```

### Option 2 users (Docker Compose)

```bash
docker compose down -v     # stop services and delete the DB volume
docker compose up --build  # migrations re-run automatically on startup
```

### Keep tables, purge data only (raw SQL)

```sql
TRUNCATE TABLE
    report_tasks,
    report_blockers,
    weekly_reports,
    user_project_assignments,
    projects,
    users
CASCADE;
```

---

## Troubleshooting

| Symptom                                           | Likely cause / fix                                                                                                     |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Backend fails to start with a DB connection error | Confirm the Postgres container is running and `DATABASE_URL` port/credentials match                                    |
| `alembic upgrade head` hangs or errors            | Ensure the database container's healthcheck has passed before running migrations                                       |
| Frontend shows network errors calling the API     | Confirm `NEXT_PUBLIC_API_URL` matches the backend's actual host/port                                                   |
| Login succeeds but session doesn't persist        | Check that `CORS_ORIGINS` includes your frontend origin and that cookies aren't blocked by the browser for `localhost` |
| `/ai/chat` returns an error                       | Confirm `OPENAI_API_KEY` / `GEMINI_API_KEY` / `PINECONE_API_KEY` are set in `backend/.env`                             |
| Port already in use (`3000`, `8000`, or `5432`)   | Stop the conflicting process, or change the host-side port mapping in `docker-compose.yml`                             |

---

## Roadmap

- [ ] CI pipeline (lint + test on pull request)
- [ ] Add a `LICENSE` file
- [ ] Production Dockerfiles (multi-stage builds, non-root user, `npm run build` + `next start` instead of dev servers)
- [ ] Rate limiting on auth endpoints
- [ ] E2E test coverage for the frontend

---

## Contributing

1. Fork the repository and create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes and add/update tests where relevant
3. Run `ruff check .` (backend) and `npm run lint` (frontend) before committing
4. Open a pull request describing the change and its motivation

---

## License

No license file is currently included in this repository. All rights reserved by the author unless a license is added.
