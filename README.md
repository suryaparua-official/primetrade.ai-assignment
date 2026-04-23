# PrimeTrade.ai — Scalable REST API with Auth & Role-Based Access

A production-ready backend system built as a microservices architecture with JWT authentication, RBAC, Redis caching, rate limiting, and a Next.js frontend — fully containerised with Docker.

> See the [`docs/`](./docs/) folder for detailed guides:
>
> - [API Reference](./docs/API_REFERENCE.md)
> - [Setup Guide](./docs/SETUP_GUIDE.md)
> - [Architecture](./docs/ARCHITECTURE.md)
> - [Redis Caching](./docs/REDIS_CACHING.md)
> - [Security](./docs/SECURITY.md)
> - [Database Schema](./docs/DATABASE_SCHEMA.md)
> - [Scalability Note](./docs/SCALABILITY_NOTE.md)

---

## Tech Stack

| Layer      | Technology                       |
| ---------- | -------------------------------- |
| Backend    | Node.js + Express 5 + TypeScript |
| Auth       | JWT + bcryptjs                   |
| Cache      | **Redis 7** (task list caching)  |
| Database   | MongoDB 6 + Mongoose             |
| Frontend   | Next.js 15 + Tailwind CSS        |
| Gateway    | Nginx (reverse proxy + CORS)     |
| Deployment | Docker + Docker Compose          |
| API Docs   | Swagger UI                       |

---

## Quick Start

```bash
git clone https://github.com/suryaparua-official/primetrade.ai-assignment.git
cd primetrade.ai-assignment

docker compose up --build
```

| Service      | URL                            |
| ------------ | ------------------------------ |
| Frontend     | http://localhost:3000          |
| API Gateway  | http://localhost:8000          |
| User Swagger | http://localhost:5000/api-docs |
| Task Swagger | http://localhost:5001/api-docs |
| MongoDB      | localhost:27017                |
| Redis        | localhost:6379                 |

**→ Full setup instructions:** [docs/SETUP_GUIDE.md](./docs/SETUP_GUIDE.md)

---

## Features

### Backend

- JWT authentication (register, login, protected routes)
- Role-based access: `user` vs `admin`
- Task CRUD with ownership enforcement
- **Redis caching** — task list cached 60s, write-through invalidation
- **Rate limiting** — 10 req/15min on login & register
- **Pagination** — `GET /tasks?page=1&limit=20`
- `userId` index on tasks collection
- API versioning at `/api/v1/`
- Swagger docs on both services
- Health endpoints for Docker healthchecks

### Frontend (Next.js)

- Register / login with toast feedback
- Protected dashboard (JWT-gated)
- Task CRUD: create, inline edit, toggle complete, delete
- Admin panel: list all users, delete users
- Role-based sidebar (Admin tab visible only to admins)

### Infrastructure

- 6-container Docker Compose setup (mongo, redis, user-service, task-service, nginx, frontend)
- Healthcheck-gated `depends_on` — nginx waits for backends, backends wait for mongo/redis
- Nginx regex location blocks (no trailing-slash 301 redirect on OPTIONS preflight)

---

## API Quick Reference

| Method | Endpoint        | Auth         | Description         |
| ------ | --------------- | ------------ | ------------------- |
| POST   | /auth/register  | None         | Register user       |
| POST   | /auth/login     | None         | Login, get JWT      |
| GET    | /auth/me        | Bearer token | Get own profile     |
| GET    | /tasks          | Bearer token | List tasks (cached) |
| POST   | /tasks          | Bearer token | Create task         |
| PUT    | /tasks/:id      | Bearer token | Update task         |
| DELETE | /tasks/:id      | Bearer token | Delete task         |
| GET    | /auth/users     | Admin only   | List all users      |
| DELETE | /auth/users/:id | Admin only   | Delete a user       |

**→ Full API docs:** [docs/API_REFERENCE.md](./docs/API_REFERENCE.md)

---

## Project Structure

```
primetrade.ai-assignment/
├── README.md
├── docker-compose.yml
├── docs/                          ← All documentation
│   ├── API_REFERENCE.md
│   ├── SETUP_GUIDE.md
│   ├── ARCHITECTURE.md
│   ├── REDIS_CACHING.md
│   ├── SECURITY.md
│   ├── DATABASE_SCHEMA.md
│   └── SCALABILITY_NOTE.md
├── frontend/                      ← Next.js app
│   ├── Dockerfile
│   ├── next.config.ts             (output: standalone)
│   └── src/
│       ├── app/ (login, register, dashboard)
│       ├── components/ (Navbar, Sidebar, Loader)
│       └── context/AppContext.tsx
└── services/
    ├── nginx/
    │   ├── Dockerfile
    │   └── nginx.conf             (regex locations, CORS, proxy_hide_header)
    ├── user-service/              ← Auth microservice
    │   ├── Dockerfile
    │   ├── package.json
    │   └── src/
    │       ├── index.ts           (rate limiting)
    │       ├── config/db.ts
    │       ├── controllers/auth.controller.ts
    │       ├── middleware/ (auth, admin)
    │       ├── models/user.model.ts
    │       ├── routes/auth.routes.ts
    │       └── utils/jwt.ts
    └── task-service/              ← Task microservice
        ├── Dockerfile
        ├── package.json           (+ redis)
        └── src/
            ├── index.ts           (+ connectRedis on boot)
            ├── config/
            │   ├── db.ts
            │   └── redis.ts       ← Redis client
            ├── controllers/task.controller.ts
            ├── middleware/auth.middleware.ts
            ├── models/task.model.ts
            └── routes/task.routes.ts
```

---

## Author

Surya Parua — [GitHub](https://github.com/suryaparua-official)

## License

MIT — see [LICENSE.md](LICENSE.md)
