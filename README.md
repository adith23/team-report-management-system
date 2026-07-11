# LOOFT — Team Report Management System

A modern, high-performance team report tracking and metrics visualization application built for agile software development teams. The project is split into a **Next.js (App Router) frontend** and a **FastAPI backend** running on **PostgreSQL**.

---

## Tech Stack

### Frontend

- **Framework:** Next.js 15+ (React 19)
- **Styling:** Tailwind CSS + Vanilla CSS variables
- **State & Fetching:** Axios + TanStack React Query (v5) + Zustand (for UI and Auth states)
- **Icons:** Lucide React

### Backend

- **Framework:** FastAPI 0.115
- **Database:** PostgreSQL with SQLAlchemy 2.0 (Asynchronous queries via `asyncpg`)
- **Migrations:** Alembic
- **Auth:** JWT (stored in client cookies) with Argon2 hashing
- **Validation:** Pydantic v2

---

## Directory Structure

```text
team-report-management-system/
├── backend/                  # FastAPI Application codebase
│   ├── alembic/              # Database schema migrations
│   ├── app/                  # Application core, models, routes, services
│   ├── Dockerfile            # Docker image for backend service
│   ├── requirements.txt      # Python dependencies list
│   └── reset_db.py           # Helper script to drop & recreate database
├── frontend/                 # Next.js Application codebase
│   ├── src/                  # React components, pages, hooks, state store
│   ├── Dockerfile            # Docker image for frontend service
│   └── package.json          # Node dependencies and scripts
├── docker-compose.yml        # Full-stack Docker orchestration (Option 2)
└── README.md                 # Project root documentation (this file)
```

---

## Prerequisites

Ensure you have the following installed on your local machine:

| Tool        | Version  | Required For                                  |
| ----------- | -------- | --------------------------------------------- |
| **Docker**  | Latest   | Database (Option 1) / All services (Option 2) |
| **Node.js** | v18.0.0+ | Frontend (Option 1 only)                      |
| **Python**  | v3.12+   | Backend (Option 1 only)                       |

> **Note:** If you choose **Option 2 (Docker Compose)**, you only need **Docker** installed. Node.js and Python are not required on your machine.

---

## Setup Instructions

Choose one of the two options below:

| Option                           | What It Does                                             | Best For                      |
| -------------------------------- | -------------------------------------------------------- | ----------------------------- |
| **Option 1** — Local Development | Docker for database only; backend & frontend run locally | Active development, debugging |
| **Option 2** — Docker Compose    | Single command starts everything                         | Quick review, testing, demo   |

---

### Option 1: Local Development (Docker for Database Only)

This option runs only PostgreSQL in Docker. The backend and frontend run directly on your machine for the best development experience (hot-reload, debugger support, etc.).

#### 1. Database Setup

Start a PostgreSQL container:

```bash
docker run --name team-reports-db -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=team_reports_db -p 5433:5432 -d postgres:16
```

> **Windows (CMD):** Replace `\` with `^` for line continuation, or write the command on a single line.

_(This maps the database to `localhost:5432` and creates the database automatically)._

#### 2. Backend Setup

Open a terminal and navigate to the `backend/` directory:

```bash
cd backend
```

**A. Create a Virtual Environment**

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux / macOS
python3 -m venv venv
source venv/bin/activate
```

**B. Install Dependencies**

```bash
pip install -r requirements.txt
```

**C. Configure Environment Variables**

Create a `.env` file from the example template:

```bash
# Linux / macOS
cp .env.example .env

# Windows (CMD)
copy .env.example .env
```

Open `.env` and update `DATABASE_URL` with the password you set in the Docker command:

```env
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5433/team_reports_db
```

**D. Run Database Migrations**

```bash
alembic upgrade head
```

**E. Start the Backend Server**

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### 3. Frontend Setup

Open a **new terminal** and navigate to the `frontend/` directory:

```bash
cd frontend
```

**A. Install Dependencies**

```bash
npm install
```

**B. Configure Environment Variables**

```bash
# Linux / macOS
cp .env.example .env.local

# Windows (CMD)
copy .env.example .env.local
```

The default value should work out of the box:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

**C. Start the Frontend Server**

```bash
npm run dev
```

#### 4. Verify Everything Works

| Service            | URL                          | Expected                      |
| ------------------ | ---------------------------- | ----------------------------- |
| Backend Health     | http://localhost:8000/health | `{"status": "healthy", ...}`  |
| API Docs (Swagger) | http://localhost:8000/docs   | Interactive API documentation |
| API Docs (Redoc)   | http://localhost:8000/redoc  | Alternative API documentation |
| Frontend           | http://localhost:3000        | Login page                    |

---

### Option 2: Full Docker Compose (One Command)

This option starts **all three services** (PostgreSQL, FastAPI backend, Next.js frontend) with a single command. No local Python or Node.js installation is needed.

#### 1. Start All Services

From the **project root** directory:

```bash
docker compose up --build
```

> **First build** downloads Docker images and installs all dependencies (~2–3 minutes).
> **Subsequent starts** use cached layers and take ~5 seconds.

Once you see logs from all three services, the application is ready:

| Service            | URL                          | Expected                      |
| ------------------ | ---------------------------- | ----------------------------- |
| Backend Health     | http://localhost:8000/health | `{"status": "healthy", ...}`  |
| API Docs (Swagger) | http://localhost:8000/docs   | Interactive API documentation |
| Frontend           | http://localhost:3000        | Login page                    |

> **Note:** Database migrations run automatically when the backend container starts. You do not need to run `alembic upgrade head` manually.

#### 2. Useful Docker Compose Commands

```bash
# Start in detached mode (runs in background)
docker compose up --build -d

# View logs for a specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f db

# Stop all services
docker compose down

# Stop all services AND delete database data
docker compose down -v
```

---

## User Authentication & Setup

1. **Bootstrap Admin Account**: The system does not have default accounts. When you register the **first user** using the email specified by `ADMIN_BOOTSTRAP_EMAIL` in the backend `.env` (defaults to `admin@company.com`), they are automatically registered with the **MANAGER** role.
2. **Standard Accounts**: Any subsequent registrations or accounts registered using other emails are created with the **TEAM_MEMBER** role by default.
3. **Manager Panel**: Managers can update user permissions (promote Team Members to Managers) directly in the app. Click on the user avatar in the top-right corner to open **Account Settings**, then click on **User Management**.

---

## Clear & Reset Database (Development)

If your database becomes out of sync during development:

### Option 1 Users (Local Backend)

Ensure you are in the `backend/` directory with the virtual environment activated:

```bash
# Drop/recreate database schema
python reset_db.py

# Re-run migrations
alembic upgrade head
```

### Option 2 Users (Docker Compose)

```bash
# Stop services and delete database volume
docker compose down -v

# Restart — migrations will re-run automatically
docker compose up --build
```

### Via SQL

If you want to keep the database tables but purge all data, run:

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
