# Scalability Note

## What's Implemented

| Feature              | Where                      | Detail                                            |
| -------------------- | -------------------------- | ------------------------------------------------- |
| Microservices        | user-service, task-service | Independent deploy & scale                        |
| Stateless JWT        | Both services              | No session state — horizontal scale ready         |
| Redis caching        | task-service               | GET /tasks cached 60s, write-through invalidation |
| Rate limiting        | user-service               | 10 req/15min on login & register                  |
| DB indexing          | tasks collection           | `userId` index — O(log n) vs O(n) collection scan |
| Pagination           | GET /tasks                 | `?page=1&limit=20`, max 100 per page              |
| Health checks        | All services               | Docker healthcheck-gated `depends_on`             |
| Nginx load balancing | Gateway                    | Round-robin across service replicas               |

---

## Horizontal Scaling Right Now

Because all services are stateless, you can scale immediately:

```bash
docker compose up --scale user-service=3 --scale task-service=2
```

Nginx automatically distributes traffic. Redis keeps the task cache consistent across all task-service replicas.

---

## Redis Caching Strategy

**Cache key:** `tasks:{userId}`
**TTL:** 60 seconds
**Scope:** Page 1 / limit 20 (default request) only

**Cache hit flow:**

```
GET /tasks → Redis.get("tasks:userId123") → HIT → return JSON (~2ms)
```

**Cache miss flow:**

```
GET /tasks → Redis.get(...) → MISS → MongoDB.find({userId}) → store in Redis → return
```

**Invalidation (write-through):**

```
POST/PUT/DELETE /tasks → DB write → Redis.del("tasks:userId123")
```

This approach avoids stale data — users always see accurate task lists after any modification.

---

## Production Scaling Roadmap

### 1. Rate Limiting — Distributed (Redis-backed)

Current rate limiting is per-process. With multiple replicas, each instance has its own counter. Fix:

```bash
npm install rate-limit-redis
```

```ts
import RedisStore from "rate-limit-redis";
const authLimiter = rateLimit({
  store: new RedisStore({ client: redisClient }),
  windowMs: 15 * 60 * 1000,
  max: 10,
});
```

### 2. MongoDB Replica Set

```
Primary  ←→  Secondary 1  ←→  Secondary 2
  ↓ writes        ↓ reads         ↓ reads
```

Automatic failover, read scaling, zero-downtime backups.
Easiest path: MongoDB Atlas M10+ cluster.

### 3. Kubernetes with HPA

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: task-service-hpa
spec:
  scaleTargetRef:
    kind: Deployment
    name: task-service
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
```

### 4. Structured Logging (Winston)

```ts
import winston from "winston";
const logger = winston.createLogger({
  format: winston.format.json(),
  transports: [new winston.transports.Console()],
});
logger.info("Task created", { userId, taskId });
logger.error("DB error", { message: err.message });
```

Ship logs to ELK Stack or DataDog for alerting.

### 5. Monitoring (Prometheus + Grafana)

```ts
import promClient from "prom-client";
promClient.collectDefaultMetrics();
app.get("/metrics", (req, res) => {
  res.set("Content-Type", promClient.register.contentType);
  res.end(promClient.register.metrics());
});
```

---

## Summary

| Concern          | Current                 | Production Path                |
| ---------------- | ----------------------- | ------------------------------ |
| Auth             | ✅ JWT stateless        | No change needed               |
| Rate limiting    | ✅ Per-process          | Redis store for multi-replica  |
| Caching          | ✅ Redis (task-service) | Expand to user profiles        |
| DB indexes       | ✅ userId on tasks      | Add compound indexes as needed |
| Pagination       | ✅ Done                 | No change needed               |
| Horizontal scale | ✅ Docker Compose       | Kubernetes + HPA               |
| DB replication   | ⬜ Single instance      | MongoDB Atlas / Replica Set    |
| Logging          | ⬜ console.log          | Winston + ELK / DataDog        |
| Monitoring       | ⬜ None                 | Prometheus + Grafana           |
| CDN              | ⬜ None                 | CloudFront / Cloudflare        |
