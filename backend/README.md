# Team Report Management System — Backend

REST API built with **FastAPI** and **PostgreSQL** for the Weekly Report Generator & Team Dashboard.

## Tech Stack

- **Framework:** FastAPI 0.115
- **Database:** PostgreSQL with SQLAlchemy 2.0 (async)
- **Migrations:** Alembic
- **Auth:** JWT (HttpOnly cookies) + Argon2 password hashing
- **Validation:** Pydantic v2

## Prerequisites

- Python 3.12+
- PostgreSQL 16+

## Setup

### 1. Create Virtual Environment

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/macOS
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment

```bash
# Copy the example env file
cp .env.example .env

# Edit .env with your database credentials
# Required: DATABASE_URL, JWT_SECRET_KEY
```

### 4. Create Database

```sql
-- In PostgreSQL
CREATE DATABASE team_reports_db;
```

### 5. Run Migrations

```bash
alembic upgrade head
```

### 6. Start Development Server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at: `http://localhost:8000`  
Interactive docs (Swagger UI): `http://localhost:8000/docs`

## Project Structure

```
backend/
├── alembic/              # Database migrations
├── app/
│   ├── core/             # Cross-cutting concerns (DB, auth, exceptions)
│   ├── models/           # SQLAlchemy ORM models
│   ├── schemas/          # Pydantic DTOs (request/response validation)
│   ├── repositories/     # Data access layer (Repository Pattern)
│   ├── services/         # Business logic layer
│   ├── routers/          # API route handlers
│   ├── middleware/        # Custom middleware
│   ├── config.py         # Environment-driven configuration
│   └── main.py           # FastAPI app factory
├── tests/                # Test suite
├── .env.example          # Environment variables template
├── alembic.ini           # Alembic configuration
└── requirements.txt      # Python dependencies
```

## Architecture

**Layered Architecture:** Router → Service → Repository → Model → Database

- **Routers** handle HTTP concerns (routing, validation, status codes)
- **Services** enforce business rules and orchestrate data
- **Repositories** abstract database access (CRUD + queries)
- **Models** define the database schema via SQLAlchemy ORM
