# ── Base image: Node.js 20 Alpine ─────────────────────────────
# Alpine variant keeps image small (~180MB). Node 20 LTS is
# compatible with Next.js 16.
FROM node:20-alpine

WORKDIR /app

# ── Dependencies ──────────────────────────────────────────────
# Copied before application code for Docker layer caching.
# npm ci: Deterministic installs from lock file, faster than npm install.
COPY package.json package-lock.json ./
RUN npm ci

# ── Application code ─────────────────────────────────────────
COPY . .

# ── Port declaration ─────────────────────────────────────────
EXPOSE 3000

# ── Entrypoint ───────────────────────────────────────────────
# --hostname 0.0.0.0: Next.js defaults to localhost (container-only).
# 0.0.0.0 makes it accessible via Docker port mapping.
CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0"]
