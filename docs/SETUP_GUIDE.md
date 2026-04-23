# Setup Guide

## Prerequisites

| Tool           | Version | Install                                                  |
| -------------- | ------- | -------------------------------------------------------- |
| Docker         | 24+     | https://docs.docker.com/get-docker/                      |
| Docker Compose | v2      | Included with Docker Desktop                             |
| Node.js        | 22+     | https://nodejs.org (dev only)                            |
| jq             | any     | `brew install jq` / `apt install jq` (for cURL examples) |

---

## Option 1 — Docker (Recommended)

```bash
# 1. Clone
git clone https://github.com/suryaparua-official/primetrade.ai-assignment.git
cd primetrade.ai-assignment

# 2. Start everything
docker compose up --build

# 3. Wait ~30 seconds for all healthchecks to pass, then visit:
#    Frontend:             http://localhost:3000
#    API Gateway:          http://localhost:8000
#    User Service Swagger: http://localhost:5000/api-docs
#    Task Service Swagger: http://localhost:5001/api-docs
#    Redis:                localhost:6379
#    MongoDB:              localhost:27017
```

### Stop services

```bash
docker compose down          # stop containers, keep volumes
docker compose down -v       # stop + delete all data (fresh start)
```

### Rebuild a single service after code change

```bash
docker compose build task-service
docker compose up -d task-service
```

---

## Option 2 — Local Development

Run each service in its own terminal.

### Terminal 1 — MongoDB + Redis via Docker

```bash
docker run -d --name mongo  -p 27017:27017 mongo:6
docker run -d --name redis  -p 6379:6379   redis:7-alpine
```

### Terminal 2 — User Service

```bash
cd services/user-service
cp .env.example .env
# Edit .env:
#   MONGO_URI=mongodb://localhost:27017/primetrade
#   JWT_SECRET=devsecret
#   PORT=5000
npm install
npm run dev
```

### Terminal 3 — Task Service

```bash
cd services/task-service
cp .env.example .env
# Edit .env:
#   MONGO_URI=mongodb://localhost:27017/primetrade
#   JWT_SECRET=devsecret
#   PORT=5001
#   REDIS_URL=redis://localhost:6379
npm install
npm run dev
```

### Terminal 4 — Frontend

```bash
cd frontend
# Create frontend/.env.local:
echo "NEXT_PUBLIC_USER_API=http://localhost:5000/api/v1" > .env.local
echo "NEXT_PUBLIC_TASK_API=http://localhost:5001/api/v1" >> .env.local
npm install
npm run dev
```

> In local dev mode the frontend talks **directly to each service** — no Nginx in between. The env vars above point to the individual service ports.

---

## Create an Admin User

After starting, register a normal user, then promote them:

```bash
docker exec -it mongo mongosh
use primetrade
db.users.updateOne(
  { email: "your@email.com" },
  { $set: { role: "admin" } }
)
exit
```

Log out and log back in — the Admin panel will appear in the sidebar.

---

## Environment Variables

### User Service — `services/user-service/.env`

```env
MONGO_URI=mongodb://mongo:27017/primetrade
JWT_SECRET=your_strong_secret_here_change_in_production
PORT=5000
```

### Task Service — `services/task-service/.env`

```env
MONGO_URI=mongodb://mongo:27017/primetrade
JWT_SECRET=your_strong_secret_here_change_in_production
PORT=5001
REDIS_URL=redis://redis:6379
```

### Frontend — `frontend/.env.local` (local dev only)

```env
NEXT_PUBLIC_USER_API=http://localhost:5000/api/v1
NEXT_PUBLIC_TASK_API=http://localhost:5001/api/v1
```

> **Docker note:** Frontend env vars are passed as build args in `docker-compose.yml`. Next.js bakes `NEXT_PUBLIC_*` into the JS bundle at build time, so they must be set before `docker compose build`.

---

## Verify Everything Is Working

```bash
# Check all containers are healthy
docker compose ps

# Test nginx gateway
curl http://localhost:8000
# → "Nginx Gateway Running"

# Test user service health
curl http://localhost:5000/health
# → {"status":"OK"}

# Test task service health
curl http://localhost:5001/health
# → {"status":"OK"}

# Test Redis
docker exec -it redis redis-cli ping
# → PONG

# Register a user
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"password123"}'
# → {"message":"Registered successfully"}
```

---
