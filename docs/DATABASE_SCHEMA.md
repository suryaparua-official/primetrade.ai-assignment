# Database Schema

**Database:** MongoDB 6
**ODM:** Mongoose
**Database name:** `primetrade`

---

## Collections

### `users`

Managed by: `user-service`

| Field       | Type     | Constraints                        | Notes                         |
|-------------|----------|------------------------------------|-------------------------------|
| `_id`       | ObjectId | Auto-generated                     | Primary key                   |
| `name`      | String   | Required                           |                               |
| `email`     | String   | Required, unique, indexed          | RFC 5322 validated on input   |
| `password`  | String   | Required                           | bcrypt hash, never returned   |
| `role`      | String   | Enum: `"user"` \| `"admin"`, default `"user"` |            |
| `createdAt` | Date     | Auto (timestamps: true)            |                               |
| `updatedAt` | Date     | Auto (timestamps: true)            |                               |

**Indexes:**
- `email` — unique index (enforced by Mongoose schema + MongoDB)

**Example document:**
```json
{
  "_id": "64f1a2b3c4d5e6f7890abc12",
  "name": "Surya Parua",
  "email": "surya@example.com",
  "password": "$2b$10$...",
  "role": "user",
  "createdAt": "2026-04-22T10:00:00.000Z",
  "updatedAt": "2026-04-22T10:00:00.000Z"
}
```

---

### `tasks`

Managed by: `task-service`

| Field         | Type     | Constraints            | Notes                              |
|---------------|----------|------------------------|------------------------------------|
| `_id`         | ObjectId | Auto-generated         | Primary key                        |
| `title`       | String   | Required, trimmed      |                                    |
| `description` | String   | Optional, trimmed      |                                    |
| `completed`   | Boolean  | Default: `false`       |                                    |
| `userId`      | ObjectId | Required, ref: `User`  | Ownership — tasks are user-scoped  |
| `createdAt`   | Date     | Auto (timestamps: true)|                                    |
| `updatedAt`   | Date     | Auto (timestamps: true)|                                    |

**Indexes:**
- `userId` — query index (added explicitly via `taskSchema.index({ userId: 1 })`)
  - Without this, every `Task.find({ userId })` does a full collection scan — O(n)
  - With this index, the query is O(log n) — critical at scale

**Example document:**
```json
{
  "_id": "64f1a2b3c4d5e6f7890abc99",
  "title": "Build REST API",
  "description": "Implement authentication and CRUD",
  "completed": false,
  "userId": "64f1a2b3c4d5e6f7890abc12",
  "createdAt": "2026-04-22T10:05:00.000Z",
  "updatedAt": "2026-04-22T10:05:00.000Z"
}
```

---

## Relationships

```
users (1) ──────────────── (many) tasks
  _id          →          userId
```

- One user can have many tasks
- Each task belongs to exactly one user
- No join queries needed — task-service queries by `userId` directly

---

## Inspect the Database

```bash
# Open Mongo shell
docker exec -it mongo mongosh

# Switch to database
use primetrade

# Count documents
db.users.countDocuments()
db.tasks.countDocuments()

# List all users (without password)
db.users.find({}, { password: 0 })

# List tasks for a specific user
db.tasks.find({ userId: ObjectId("64f1a2b3c4d5e6f7890abc12") })

# Show indexes
db.users.getIndexes()
db.tasks.getIndexes()

# Promote a user to admin
db.users.updateOne(
  { email: "your@email.com" },
  { $set: { role: "admin" } }
)
```
