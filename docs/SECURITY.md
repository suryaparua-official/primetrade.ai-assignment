# Security Implementation

## Authentication

### Password Hashing
- Algorithm: `bcryptjs` with **10 salt rounds**
- Plain passwords are never logged, stored, or returned in any response
- Comparison uses `bcrypt.compare()` (timing-safe, not `===`)

### JWT Tokens
- Algorithm: HS256
- Payload: `{ userId, role, iat, exp }`
- Expiry: 7 days
- Secret: stored in environment variable, never hardcoded
- Same `JWT_SECRET` used in both user-service and task-service

### Token Storage
- Stored in browser `localStorage` (demo/development approach)
- For higher security in production: use `HttpOnly` cookies to prevent XSS access

---

## Authorisation

### Role-Based Access Control (RBAC)

| Role  | Can access |
|-------|-----------|
| user  | Own tasks (CRUD), own profile |
| admin | All of the above + list/delete any user |

Two middleware layers:
1. `authMiddleware` — verifies JWT on every protected route
2. `adminOnly` — checks `req.user.role === "admin"`, applied on top of authMiddleware

### Ownership Enforcement
Task operations verify `task.userId === req.user.userId` before allowing update or delete. A user cannot modify another user's tasks even with a valid token.

---

## Input Validation

| Field    | Rule |
|----------|------|
| name     | Required, non-empty |
| email    | Required, RFC 5322 regex |
| password | Required, minimum 6 characters |
| title    | Required, trimmed, non-empty |

Mongoose schema validation provides a second layer — fields not in the schema are rejected.

---

## Rate Limiting

Login and register endpoints are rate-limited to **10 requests per IP per 15 minutes** using `express-rate-limit`. Prevents brute-force credential attacks.

Response when limited:
```json
{ "message": "Too many attempts, please try again later" }
```
HTTP Status: `429 Too Many Requests`

---

## CORS

Managed **only in Nginx** (single source of truth). Express services have no CORS middleware — this prevents duplicate `Access-Control-Allow-Origin` headers which browsers reject.

- `proxy_hide_header` strips any CORS headers from upstream before Nginx adds its own
- OPTIONS preflight handled inside `if` block with `return 204` — headers are included in the same block to ensure they're sent

---

## NoSQL Injection Prevention

- All queries use Mongoose schema methods (`findById`, `findOne`, `create`) which sanitise inputs
- Direct `$where` or `eval` operators are not used anywhere
- Input is validated before reaching the database

---

## Environment Variables

Sensitive values (JWT secret, MongoDB URI, Redis URL) are stored in `.env` files, never committed to version control (`.gitignore` covers `.env`).

`.env.example` files are provided with placeholder values for reference.
