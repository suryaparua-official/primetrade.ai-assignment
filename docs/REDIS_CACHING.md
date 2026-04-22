# Redis Caching Guide

## Overview

Redis is used in the **task-service** to cache task list responses, reducing MongoDB read load for frequently accessed data.

## Configuration

| Setting | Value |
|---------|-------|
| Docker service | `redis:7-alpine` |
| Port | 6379 |
| Env var | `REDIS_URL=redis://redis:6379` |
| Cache TTL | 60 seconds |
| Persistence | Docker named volume `redis_data` |

## What Gets Cached

Only the **default task list** (page 1, limit 20) per user is cached.

**Cache key format:** `tasks:{userId}`

Example: `tasks:64f1a2b3c4d5e6f7890abc13`

## Cache Lifecycle

```
Request: GET /tasks (page=1, limit=20)
    │
    ▼
Redis.get("tasks:{userId}")
    │
    ├─ HIT  → return cached JSON immediately (~2ms)
    │          { tasks, total, page, totalPages, fromCache: true }
    │
    └─ MISS → Query MongoDB
               → Redis.setEx("tasks:{userId}", 60, JSON)
               → return { ..., fromCache: false }
```

**Cache invalidation** (write-through):

Any mutation immediately deletes the cache key:
```
POST   /tasks     → Task.create()     → Redis.del("tasks:{userId}")
PUT    /tasks/:id → task.save()       → Redis.del("tasks:{userId}")
DELETE /tasks/:id → task.deleteOne()  → Redis.del("tasks:{userId}")
```

This means users always see accurate data after any write operation.

## `fromCache` Flag

The API response includes `fromCache: true/false` so you can verify caching is working:

```bash
# First call — cache miss
curl http://localhost:8000/api/v1/tasks -H "Authorization: Bearer $TOKEN"
# → { ..., "fromCache": false }

# Second call within 60s — cache hit
curl http://localhost:8000/api/v1/tasks -H "Authorization: Bearer $TOKEN"
# → { ..., "fromCache": true }
```

## Files

| File | Purpose |
|------|---------|
| `services/task-service/src/config/redis.ts` | Redis client, connect/disconnect helpers |
| `services/task-service/src/controllers/task.controller.ts` | Cache read/write/invalidation logic |
| `services/task-service/src/index.ts` | Calls `connectRedis()` on boot |
| `docker-compose.yml` | Redis service + `redis_data` volume |

## Verify Redis Is Working

```bash
# Connect to Redis CLI
docker exec -it redis redis-cli

# List all cache keys
KEYS tasks:*

# Inspect a cached value
GET tasks:64f1a2b3c4d5e6f7890abc13

# Check TTL remaining
TTL tasks:64f1a2b3c4d5e6f7890abc13

# Manually flush all cache (useful for testing)
FLUSHALL
```

## Future Improvements

**Distributed rate limiting** — use Redis as the store for `express-rate-limit` so all user-service replicas share the same counter:

```ts
import RedisStore from "rate-limit-redis";
const limiter = rateLimit({
  store: new RedisStore({ client: redisClient }),
  windowMs: 15 * 60 * 1000,
  max: 10,
});
```

**Session caching** — cache decoded JWT payloads to avoid repeated `jwt.verify()` calls on high-traffic endpoints.

**Cache warming** — pre-populate cache after service startup for power users with large task lists.
