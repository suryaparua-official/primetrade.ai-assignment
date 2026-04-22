# API Reference

**Base URL (via Nginx gateway):** `http://localhost:8000/api/v1`

**Direct service URLs (dev only):**
- User Service: `http://localhost:5000/api/v1`
- Task Service: `http://localhost:5001/api/v1`

**Interactive Swagger Docs:**
- User Service: http://localhost:5000/api-docs
- Task Service: http://localhost:5001/api-docs

---

## Authentication

All protected endpoints require:
```
Authorization: Bearer <jwt_token>
```

---

## Auth Endpoints

### POST /auth/register
Register a new user.

**Body:**
```json
{
  "name": "Surya Parua",
  "email": "surya@example.com",
  "password": "password123"
}
```

**Responses:**
| Code | Body |
|------|------|
| 201  | `{ "message": "Registered successfully" }` |
| 400  | `{ "message": "User already exists" }` |
| 400  | `{ "message": "Invalid email format" }` |
| 400  | `{ "message": "Password must be at least 6 characters" }` |
| 429  | `{ "message": "Too many attempts, please try again later" }` |

---

### POST /auth/login
Login and receive a JWT token.

**Body:**
```json
{
  "email": "surya@example.com",
  "password": "password123"
}
```

**Responses:**
| Code | Body |
|------|------|
| 200  | `{ "message": "Login successful", "token": "<jwt>" }` |
| 400  | `{ "message": "Invalid credentials" }` |
| 429  | `{ "message": "Too many attempts, please try again later" }` |

---

### GET /auth/me
Get the currently logged-in user's profile.

**Headers:** `Authorization: Bearer <token>`

**Response 200:**
```json
{
  "message": "User profile fetched",
  "user": {
    "_id": "64f1a2b3c4d5e6f7890abc12",
    "name": "Surya Parua",
    "email": "surya@example.com",
    "role": "user",
    "createdAt": "2026-04-22T10:00:00Z"
  }
}
```

---

## Task Endpoints

All task endpoints require `Authorization: Bearer <token>`.

Tasks are user-scoped — you can only see and modify your own tasks.

---

### GET /tasks
Get the current user's tasks. Supports pagination.

**Query params (optional):**
| Param  | Default | Description            |
|--------|---------|------------------------|
| page   | 1       | Page number            |
| limit  | 20      | Items per page (max 100) |

**Response 200:**
```json
{
  "tasks": [
    {
      "_id": "64f1a2b3c4d5e6f7890abc12",
      "title": "Build API",
      "description": "Create REST API with auth",
      "completed": false,
      "userId": "64f1a2b3c4d5e6f7890abc13",
      "createdAt": "2026-04-22T10:00:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "totalPages": 1,
  "fromCache": false
}
```

> `fromCache: true` means the response was served from Redis (faster, no DB hit).

---

### POST /tasks
Create a new task.

**Body:**
```json
{
  "title": "Build API",
  "description": "Create REST API with authentication"
}
```

**Responses:**
| Code | Body |
|------|------|
| 201  | Full task object |
| 400  | `{ "message": "Title required" }` |

---

### PUT /tasks/:id
Update a task. All fields are optional.

**Body:**
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "completed": true
}
```

**Responses:**
| Code | Body |
|------|------|
| 200  | Updated task object |
| 403  | `{ "message": "Not allowed" }` (not your task) |
| 404  | `{ "message": "Task not found" }` |

---

### DELETE /tasks/:id
Delete a task.

**Responses:**
| Code | Body |
|------|------|
| 200  | `{ "message": "Deleted" }` |
| 403  | `{ "message": "Not allowed" }` |
| 404  | `{ "message": "Task not found" }` |

---

## Admin Endpoints

Require a JWT with `role: "admin"`. Regular user tokens return `403`.

### GET /auth/users
List all registered users.

**Response 200:**
```json
[
  {
    "_id": "64f1a2b3c4d5e6f7890abc12",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "createdAt": "2026-04-22T10:00:00Z"
  }
]
```

### DELETE /auth/users/:id
Delete a user by ID.

**Response 200:** `{ "message": "User deleted" }`

---

## Status Codes

| Code | Meaning                              |
|------|--------------------------------------|
| 200  | Success                              |
| 201  | Created                              |
| 204  | No Content (CORS preflight)          |
| 400  | Bad Request / Validation error       |
| 401  | Unauthorized — missing/invalid token |
| 403  | Forbidden — insufficient permissions |
| 404  | Resource not found                   |
| 429  | Too Many Requests (rate limited)     |
| 500  | Internal Server Error                |
