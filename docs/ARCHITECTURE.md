# Architecture Overview

## System Diagram

```
┌─────────────────────────────────────────────────────────┐
│               Browser / Frontend (Next.js)              │
│                   http://localhost:3000                  │
│  • Register / Login                                     │
│  • Protected Dashboard (JWT required)                   │
│  • Task CRUD UI                                         │
│  • Admin panel (admin role only)                        │
└─────────────────────┬───────────────────────────────────┘
                      │ HTTP requests from browser
                      ▼
┌─────────────────────────────────────────────────────────┐
│              Nginx Gateway  (:8000 → :80)               │
│  • Single CORS source of truth                         │
│  • Regex location blocks (no trailing-slash redirects)  │
│  • Routes /api/v1/auth/*  → user-service               │
│  • Routes /api/v1/tasks/* → task-service               │
│  • proxy_hide_header strips upstream CORS headers       │
└──────────────┬──────────────────────────┬───────────────┘
               │                          │
               ▼                          ▼
┌──────────────────────┐    ┌─────────────────────────────┐
│    user-service      │    │       task-service          │
│    Node.js :5000     │    │       Node.js :5001         │
│                      │    │                             │
│  POST /auth/register │    │  GET    /api/v1/tasks       │
│  POST /auth/login    │    │  POST   /api/v1/tasks       │
│  GET  /auth/me       │    │  PUT    /api/v1/tasks/:id   │
│  GET  /auth/users ★  │    │  DELETE /api/v1/tasks/:id   │
│  DEL  /auth/users ★  │    │                             │
│                      │    │  Redis cache:               │
│  Rate limiting:      │    │  • GET tasks → cache 60s   │
│  10 req/15min on     │    │  • write ops → invalidate  │
│  login & register    │    │                             │
└──────────┬───────────┘    └──────────┬──────────────────┘
           │                           │
           └─────────────┬─────────────┘
                         │
           ┌─────────────┴──────────────────────┐
           │                                    │
           ▼                                    ▼
┌─────────────────────┐            ┌────────────────────────┐
│   MongoDB :27017    │            │    Redis :6379         │
│   db: primetrade    │            │                        │
│   • users           │            │  Key: tasks:{userId}   │
│   • tasks           │            │  TTL: 60 seconds       │
│   Index: tasks.userId│           │  Invalidated on write  │
└─────────────────────┘            └────────────────────────┘

★ = admin role required
```

---

## Service Responsibilities

### Nginx (Gateway)
- Single entry point for all API traffic
- Handles CORS entirely — services have no CORS middleware
- `proxy_hide_header` removes upstream CORS headers to prevent duplicates
- Regex `location ~` blocks prevent 301 redirects on OPTIONS preflight
- Routes requests to the correct microservice

### user-service (Port 5000)
- JWT generation and validation
- User registration with bcrypt password hashing
- Admin-only user management routes
- Rate limiting on auth endpoints (10 req / 15 min per IP)
- Swagger UI at `/api-docs`

### task-service (Port 5001)
- Full task CRUD, scoped to the authenticated user
- Redis caching: `GET /tasks` (page 1) cached 60 seconds
- Cache invalidated automatically on create, update, delete
- Pagination: `?page=N&limit=N` (max 100 per page)
- `userId` index on tasks collection for O(log n) lookups
- Swagger UI at `/api-docs`

### MongoDB
- Persistent data store for users and tasks
- `users.email` — unique index
- `tasks.userId` — query index (added in this version)
- Data persisted via Docker named volume `mongo_data`

### Redis
- In-memory cache for task list responses
- Cache key pattern: `tasks:{userId}`
- TTL: 60 seconds
- Write-through invalidation: any mutation deletes the cache key
- Data persisted via Docker named volume `redis_data`

### Frontend (Next.js — Port 3000)
- `output: standalone` for minimal Docker image
- Client-side routing with protected routes (JWT check)
- `AppContext` — global state via React Context API
- Toast notifications for all API responses
- Admin panel conditionally rendered based on JWT role claim

---

## Request Flow Examples

### Login request
```
Browser
  → POST http://localhost:8000/api/v1/auth/login
  → Nginx (regex match ^/api/v1/auth)
  → proxy_pass http://user_service (port 5000)
  → Rate limiter check (10 req/15min)
  → auth.controller.login()
  → bcrypt.compare(password, hash)
  → generateToken(user) — JWT with userId + role
  → 200 { token }
  ← Nginx adds CORS headers
  ← Browser stores token in localStorage
```

### Fetch tasks (cache hit)
```
Browser
  → GET http://localhost:8000/api/v1/tasks
  → Nginx (regex match ^/api/v1/tasks)
  → proxy_pass http://task_service (port 5001)
  → authMiddleware — verify JWT
  → getTasks() — redis.get("tasks:{userId}")
  → Cache HIT → return { tasks, fromCache: true }
  ← ~2ms response (no DB query)
```

### Create task (cache invalidation)
```
Browser
  → POST http://localhost:8000/api/v1/tasks
  → task-service → createTask()
  → Task.create({ title, userId })
  → redis.del("tasks:{userId}")  ← cache invalidated
  → 201 task object
  ← Next GET /tasks fetches fresh from MongoDB
```

---

## Horizontal Scaling

All services are stateless (JWT auth = no session state). Scale with:

```bash
docker compose up --scale user-service=3 --scale task-service=2
```

Nginx round-robins across all instances. Redis ensures cache is consistent across task-service replicas (shared cache, not per-instance).

For production, move Redis and MongoDB to managed services (Redis Cloud / MongoDB Atlas) and deploy services on Kubernetes with HPA.
