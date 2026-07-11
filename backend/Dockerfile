# ── Base image: Python 3.12 slim ──────────────────────────────
# Slim variant keeps image small (~150MB base) while including
# essential system libraries. Full image is unnecessary overhead.
FROM python:3.12-slim

WORKDIR /app

# ── System dependencies ──────────────────────────────────────
# gcc + libpq-dev: Required by asyncpg (PostgreSQL C extension)
#                  and argon2-cffi (C-based password hashing).
# Cleaned up after install to reduce layer size.
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# ── Python dependencies ──────────────────────────────────────
# Copied before application code for Docker layer caching.
# Code changes won't trigger a full pip install.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# ── Application code ─────────────────────────────────────────
COPY . .

# ── Port declaration ─────────────────────────────────────────
EXPOSE 8000

# ── Entrypoint ───────────────────────────────────────────────
# --host 0.0.0.0 is required to be reachable from outside the container.
# Migrations are handled by docker-compose command override.
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
