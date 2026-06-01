# Task Manager

A production-ready, full-stack task management system built on a microservices architecture. Features JWT authentication with role-based access control, Redis caching, rate limiting, and a modern Next.js frontend — fully containerised and runnable with a single command.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE.md)

> | Guide                                        | Description                     |
> | -------------------------------------------- | ------------------------------- |
> | [Setup Guide](./docs/SETUP_GUIDE.md)         | Docker & local dev setup        |
> | [API Reference](./docs/API_REFERENCE.md)     | All endpoints with examples     |
> | [Architecture](./docs/ARCHITECTURE.md)       | System design & request flows   |
> | [Database Schema](./docs/DATABASE_SCHEMA.md) | Collections, fields, indexes    |
> | [Redis Caching](./docs/REDIS_CACHING.md)     | Cache strategy & verification   |
> | [Security](./docs/SECURITY.md)               | Auth, RBAC, rate limiting, CORS |

---

## Quick Start

```bash
git clone https://github.com/suryaparua-official/Distributed-Task-Management-System.git
cd Distributed-Task-Management-System
docker compose up --build
```

All services start and health-check automatically. Once all containers are healthy (~30s), open:

| Service                  | URL                            |
| ------------------------ | ------------------------------ |
| **Frontend**             | http://localhost:3000          |
| **API Gateway**          | http://localhost:8080          |
| **User Service Swagger** | http://localhost:5000/api-docs |
| **Task Service Swagger** | http://localhost:5001/api-docs |

---

## Tech Stack

| Layer        | Technology                                           |
| ------------ | ---------------------------------------------------- |
| Frontend     | Next.js 15 · React 19 · TypeScript · Tailwind CSS v4 |
| Gateway      | Nginx (reverse proxy, CORS)                          |
| Auth Service | Node.js 22 · Express 5 · TypeScript · JWT · bcryptjs |
| Task Service | Node.js 22 · Express 5 · TypeScript · Redis          |
| Cache        | Redis 7 (60s TTL, write-through invalidation)        |
| Database     | MongoDB 6 · Mongoose                                 |
| Validation   | Zod                                                  |
| Logging      | Winston (structured JSON)                            |
| API Docs     | Swagger UI                                           |
| Containers   | Docker · Docker Compose                              |

---

## Features

**Authentication & Authorisation**

- JWT (HS256, 7-day expiry) — stateless and horizontal-scale ready
- Role-based access control: `user` and `admin` roles
- Rate limiting on auth endpoints (10 req / 15 min per IP)

**Task Management**

- Full CRUD with per-user ownership enforcement
- Pagination (`GET /tasks?page=1&limit=20`, max 100/page)
- Redis-cached task list (60s TTL, invalidated on write)
- Compound MongoDB index on `userId` for O(log n) lookups

**Frontend**

- Sign-in / sign-up with toast notifications
- Protected dashboard with task progress overview
- Inline task editing, completion toggle, delete
- Admin panel — view and remove users (admin role only)

**Infrastructure**

- Healthcheck-gated startup — each service waits for its dependencies
- Named volumes for persistent MongoDB and Redis data
- Multi-stage Dockerfiles for lean production images
- Next.js `output: standalone` for a minimal frontend container

---

## API Reference

| Method   | Endpoint                 | Auth   | Description         |
| -------- | ------------------------ | ------ | ------------------- |
| `POST`   | `/api/v1/auth/register`  | —      | Register            |
| `POST`   | `/api/v1/auth/login`     | —      | Login, receive JWT  |
| `GET`    | `/api/v1/auth/me`        | Bearer | Own profile         |
| `GET`    | `/api/v1/tasks`          | Bearer | List tasks (cached) |
| `POST`   | `/api/v1/tasks`          | Bearer | Create task         |
| `PUT`    | `/api/v1/tasks/:id`      | Bearer | Update task         |
| `DELETE` | `/api/v1/tasks/:id`      | Bearer | Delete task         |
| `GET`    | `/api/v1/auth/users`     | Admin  | List all users      |
| `DELETE` | `/api/v1/auth/users/:id` | Admin  | Delete a user       |

Full request/response examples: [docs/API_REFERENCE.md](./docs/API_REFERENCE.md)

---

## Project Structure

```
.
├── docker-compose.yml
├── docs/
├── frontend/                   # Next.js 15 (standalone)
│   └── src/
│       ├── app/                # login · register · dashboard
│       ├── components/         # Navbar · Sidebar · Loader
│       └── context/            # Global auth & task state
└── services/
    ├── nginx/                  # Gateway — CORS, routing
    ├── user-service/           # Auth (port 5000)
    └── task-service/           # Tasks + Redis cache (port 5001)
```

---

## Admin Access

Register a normal account, then promote it via the MongoDB shell:

```bash
docker compose exec mongo mongosh
use taskmanager
db.users.updateOne({ email: "your@email.com" }, { $set: { role: "admin" } })
exit
```

Log out and back in — the **Admin** tab appears in the sidebar.

---

## Configuration

Works out of the box with safe defaults. To set a custom JWT secret:

```bash
cp .env.example .env   # then edit JWT_SECRET
docker compose up --build
```

For a clean rebuild:

```bash
docker compose down -v --remove-orphans
docker compose up --build
```

---

## License

MIT — see [LICENSE.md](LICENSE.md)

## Author

Surya Parua
