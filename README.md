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
│   ├── requirements.txt      # Python dependencies list
│   └── reset_db.py           # Helper script to drop & recreate database
├── frontend/                 # Next.js Application codebase
│   ├── src/                  # React components, pages, hooks, state store
│   └── package.json          # Node dependencies and scripts
└── README.md                 # Project root documentation (this file)
```

---

## Prerequisites

Ensure you have the following installed on your local machine:
- **Node.js** (v18.0.0 or higher)
- **Python** (v3.12 or higher)
- **PostgreSQL** (v16 or higher)

---

## Setup Instructions

### 1. Database Setup

Ensure PostgreSQL is running on your machine. Log in using `psql`, pgAdmin, or your preferred SQL tool and create a database:

```sql
CREATE DATABASE team_reports_db;
```

---

### 2. Backend Setup

Open a terminal window and navigate to the `backend/` directory:

```bash
cd backend
```

#### A. Create a Virtual Environment
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux / macOS
python3 -m venv venv
source venv/bin/activate
```

#### B. Install Dependencies
```bash
pip install -r requirements.txt
```

#### C. Configure Environment Variables
Create a `.env` file from the example template:
```bash
cp .env.example .env
```
Open `.env` and verify the settings. Especially, ensure `DATABASE_URL` matches your local PostgreSQL configuration:
```env
DATABASE_URL=postgresql+asyncpg://postgres:YOUR_PASSWORD@localhost:5432/team_reports_db
```

#### D. Run Migrations
Generate and migrate the database schema using Alembic:
```bash
alembic upgrade head
```

#### E. Run Backend Server
Start the Uvicorn ASGI development server:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
- Interactive docs (Swagger UI): `http://localhost:8000/docs`
- Redoc documentation: `http://localhost:8000/redoc`

---

### 3. Frontend Setup

Open another terminal window and navigate to the `frontend/` directory:

```bash
cd frontend
```

#### A. Install Dependencies
```bash
npm install
```

#### B. Configure Environment Variables
Create a `.env.local` file from the example template:
```bash
cp .env.example .env.local
```
Ensure the API URL targets the FastAPI backend correctly:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

#### C. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser to access the interface.

---

## User Authentication & Setup

1. **Bootstrap Admin Account**: The system does not have default accounts. When you register the **first user** using the email specified by `ADMIN_BOOTSTRAP_EMAIL` in the backend `.env` (defaults to `admin@company.com`), they are automatically registered with the **MANAGER** role.
2. **Standard Accounts**: Any subsequent registrations or accounts registered using other emails are created with the **TEAM_MEMBER** role by default.
3. **Manager Panel**: Managers can update user permissions (promote Team Members to Managers) directly in the app. Click on the user avatar in the top-right corner to open **Account Settings**, then click on **User Management**.

---

## Clear & Reset Database (Development)

If your database becomes out of sync during development:

### Via python helper script:
Ensure you are in the `backend/` directory with the virtual environment activated, then run:
```bash
# Drop/recreate database schema
python reset_db.py

# Re-run migrations
alembic upgrade head
```

### Via SQL:
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
