# PrimeTrade.ai - Scalable REST API with Authentication & Role-Based Access

A production-ready backend system with secure JWT authentication, role-based access control (RBAC), and task management CRUD APIs. Built with Node.js microservices, MongoDB, and Docker with full API documentation.

---

## Features

### Backend (Microservices Architecture)

- **User Authentication**: Registration & login with password hashing (bcrypt) and JWT tokens
- **Role-Based Access Control (RBAC)**: User vs Admin roles with protected endpoints
- **Task Management**: Full CRUD APIs for task management
- **JWT Security**: Secure token-based authentication with expiration
- **Input Validation**: Comprehensive validation and sanitization of all inputs
- **Error Handling**: Structured error responses with proper HTTP status codes
- **API Versioning**: `/api/v1/` endpoint versioning for scalability
- **Swagger Documentation**: Interactive API docs for all endpoints
- **MongoDB**: NoSQL database with Mongoose ODM

### Frontend (Next.js)

- **User Registration & Login**: Secure authentication flow with JWT storage
- **Protected Dashboard**: JWT-required access with role-based visibility
- **Task Management UI**: Create, read, update, delete tasks
- **Error/Success Messages**: Real-time feedback from API responses
- **Responsive Design**: Modern UI with Tailwind CSS
- **Context API**: Global state management for auth and tasks

### Security & Scalability

- **CORS Support**: Properly configured cross-origin requests via Nginx
- **Password Hashing**: bcryptjs with salt rounds
- **JWT Tokens**: Secure token generation and validation
- **Environment Variables**: Sensitive data management via `.env` files
- **Docker Containerization**: Production-ready deployment
- **Nginx Reverse Proxy**: Load balancing and request routing
- **Microservices**: Separated user and task services for independent scaling
- **Database Indexes**: Unique email index on users collection

---

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 22+ (for local development)
- npm or yarn

### Option 1: Run with Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/suryaparua-official/primetrade.ai-assignment.git
cd primetrade.ai-assignment

# Build and start all services
docker-compose up --build

# Services will be available at:
# - Frontend: http://localhost:3000
# - API Gateway (Nginx): http://localhost:8000/api/v1
# - User Service Swagger: http://localhost:5000/api-docs
# - Task Service Swagger: http://localhost:5001/api-docs
# - MongoDB: mongodb://localhost:27017
```

### Option 2: Run Locally (Development)

```bash
# Install dependencies for each service
cd services/user-service && npm install
cd ../task-service && npm install
cd ../../frontend && npm install

# Set up environment variables
cp .env.example .env.local

# Start services in separate terminals
# Terminal 1: User Service
cd services/user-service && npm run dev

# Terminal 2: Task Service
cd services/task-service && npm run dev

# Terminal 3: Frontend
cd frontend && npm run dev

# MongoDB (install locally or use Docker)
docker run -p 27017:27017 mongo:6
```

---

## API Documentation

### Base URL

- **With Nginx**: `http://localhost:8000/api/v1`
- **Direct Services**:
  - User Service: `http://localhost:5000/api/v1`
  - Task Service: `http://localhost:5001/api/v1`

### Interactive Swagger Docs

- **User Service**: http://localhost:5000/api-docs
- **Task Service**: http://localhost:5001/api-docs

### Authentication Endpoints

#### 1. Register User

```http
POST /auth/register
Content-Type: application/json

{
  "name": "Surya Parua",
  "email": "surya@example.com",
  "password": "password123"
}

Response (201):
{
  "message": "Registered successfully"
}
```

#### 2. Login User

```http
POST /auth/login
Content-Type: application/json

{
  "email": "surya@example.com",
  "password": "password123"
}

Response (200):
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 3. Get Current User Profile

```http
GET /auth/me
Authorization: Bearer <jwt_token>

Response (200):
{
  "message": "User profile fetched",
  "user": {
    "_id": "64f1a2b3c4d5e6f7890abc12",
    "name": "Surya Parua",
    "email": "surya@example.com",
    "role": "user"
  }
}
```

### Task Management Endpoints

#### 4. Get All Tasks (Protected)

```http
GET /tasks
Authorization: Bearer <jwt_token>

Response (200):
[
  {
    "_id": "64f1a2b3c4d5e6f7890abc12",
    "title": "Build API",
    "description": "Create REST API with auth",
    "userId": "64f1a2b3c4d5e6f7890abc13",
    "completed": false,
    "createdAt": "2026-04-22T10:00:00Z"
  }
]
```

#### 5. Create Task (Protected)

```http
POST /tasks
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "title": "Build API",
  "description": "Create REST API with authentication"
}

Response (201):
{
  "_id": "64f1a2b3c4d5e6f7890abc12",
  "title": "Build API",
  "description": "Create REST API with authentication",
  "userId": "64f1a2b3c4d5e6f7890abc13",
  "completed": false
}
```

#### 6. Update Task (Protected)

```http
PUT /tasks/:id
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "title": "Build API",
  "description": "Updated description",
  "completed": true
}

Response (200):
{
  "_id": "64f1a2b3c4d5e6f7890abc12",
  "title": "Build API",
  "description": "Updated description",
  "completed": true
}
```

#### 7. Delete Task (Protected)

```http
DELETE /tasks/:id
Authorization: Bearer <jwt_token>

Response (200):
{
  "message": "Deleted"
}
```

### Admin Endpoints (Admin Only)

#### 8. Get All Users (Admin Only)

```http
GET /auth/users
Authorization: Bearer <admin_jwt_token>

Response (200):
[
  {
    "_id": "64f1a2b3c4d5e6f7890abc12",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
]
```

#### 9. Delete User (Admin Only)

```http
DELETE /auth/users/:id
Authorization: Bearer <admin_jwt_token>

Response (200):
{
  "message": "User deleted"
}
```

---

## Security Implementation

### Password Security

- **Hashing**: bcryptjs with 10 salt rounds
- **Never stored**: Plain passwords are never logged or stored
- **Comparison**: Secure comparison using bcrypt.compare()

### JWT Authentication

- **Token Generation**: HS256 algorithm with secret key
- **Payload**: Contains userId, role, issued time, and expiration
- **Expiration**: 7 days (604,800 seconds)
- **HttpOnly Cookies**: Optional for enhanced security (currently using localStorage for demo)

### Input Validation

- **Email**: RFC 5322 regex validation
- **Password**: Minimum 6 characters
- **Trimming**: All string inputs are trimmed
- **Required Fields**: Enforced for all endpoints

### CORS Security

- **Nginx Headers**: Proper CORS headers added at gateway level
- **Origin**: Configured to accept requests from frontend
- **Methods**: GET, POST, PUT, DELETE allowed
- **Credentials**: Enabled for cookie-based auth

### Database Security

- **Unique Index**: Email field has unique constraint
- **Connection String**: Stored in environment variables
- **NoSQL Injection**: Protected via Mongoose schema validation
- **Connection Pooling**: Mongoose handles connection management

---

## Architecture & Scalability

### Microservices Design

```
┌─────────────────────────────────────────────────────┐
│                  Frontend (Next.js)                 │
│              http://localhost:3000                  │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼─────────────────────────────────┐
│           Nginx Reverse Proxy (Gateway)              │
│         http://localhost:8000/api/v1                 │
│  • CORS Headers                                      │
│  • Load Balancing                                    │
│  • Request Routing                                   │
└────┬─────────────────────────────────────────┬───────┘
     │                                         │
┌────▼──────────────────┐      ┌───────────────▼──────┐
│   User Service        │      │   Task Service       │
│ http://localhost:5000 │      │ http://localhost:5001│
│ • Authentication      │      │ • CRUD Operations    │
│ • Role Management     │      │ • Task Logic         │
│ • JWT Validation      │      │ • User Tasks Only    │
└────┬──────────────────┘      └──────────────┬───────┘
     │                                        │
     └────────────────┬───────────────────││──┘
                      │
          ┌───────────▼─────────────┐
          │  MongoDB   │
          │ • users collection      │
          │ • tasks collection      │
          │ • Email unique index    │
          └─────────────────────────┘
```

### Scalability Strategies

#### 1. **Horizontal Scaling**

```yaml
# Multiple instances of each microservice
docker-compose up --scale user-service=3 --scale task-service=2
# Nginx will load-balance across instances
```

#### 2. **Redis Caching** (Future)

```javascript
// Cache frequently accessed data
const cacheTasks = await redis.get(`tasks:${userId}`);
if (!cacheTasks) {
  const tasks = await Task.find({ userId });
  await redis.setex(`tasks:${userId}`, 3600, JSON.stringify(tasks));
}
```

#### 3. **Database Optimization**

- Indexed queries on `userId` in tasks collection
- Pagination for large result sets
- Connection pooling via Mongoose

#### 4. **Load Balancing**

- Nginx upstream configuration handles traffic distribution
- Multiple backend instances behind proxy
- Session persistence via JWT (stateless)

#### 5. **Rate Limiting** (Future)

```javascript
const rateLimit = require("express-rate-limit");
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use("/api/v1/", limiter);
```

#### 6. **Monitoring & Logging** (Future)

```javascript
// ELK Stack (Elasticsearch, Logstash, Kibana)
// Winston/Morgan for structured logging
logger.info("Task created", { userId, taskId, timestamp });
```

---

## Project Structure

```
primetrade.ai-assignment/
├── frontend/                      # Next.js Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx        # Root layout
│   │   │   ├── page.tsx          # Home page
│   │   │   ├── login/page.tsx    # Login page
│   │   │   ├── register/page.tsx # Register page
│   │   │   └── dashboard/page.tsx# Dashboard (protected)
│   │   ├── components/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Loader.tsx
│   │   └── context/
│   │       └── AppContext.tsx    # Global auth & tasks state
│   ├── package.json
│   └── Dockerfile
│
├── services/
│   ├── user-service/              # Auth Microservice
│   │   ├── src/
│   │   │   ├── index.ts          # Express app setup
│   │   │   ├── config/db.ts      # MongoDB connection
│   │   │   ├── controllers/auth.controller.ts
│   │   │   ├── middleware/
│   │   │   │   ├── auth.middleware.ts
│   │   │   │   └── admin.middleware.ts
│   │   │   ├── models/user.model.ts
│   │   │   ├── routes/auth.routes.ts
│   │   │   └── utils/jwt.ts
│   │   ├── package.json
│   │   └── Dockerfile
│   │
│   ├── task-service/              # Task Management Microservice
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── config/db.ts
│   │   │   ├── controllers/task.controller.ts
│   │   │   ├── middleware/auth.middleware.ts
│   │   │   ├── models/task.model.ts
│   │   │   │── routes/task.routes.ts
│   │   │
│   │   │── package.json
│   │   │── Dockerfile
│   │
│   └── nginx/                     # Reverse Proxy
│       ├── nginx.conf             # CORS & routing config
│       └── Dockerfile
│
├── docker-compose.yml             # Multi-container orchestration
└── README.md                       # This file
```

---

## Environment Variables

### User Service (`.env`)

```env
MONGO_URI=mongodb://mongo:27017/primetrade
JWT_SECRET=your_secret_key_here
PORT=5000
```

### Task Service (`.env`)

```env
MONGO_URI=mongodb://mongo:27017/primetrade
JWT_SECRET=your_secret_key_here
PORT=5001
```

### Frontend (`.env.local`)

```env
NEXT_PUBLIC_USER_API=http://localhost:8000/api/v1
NEXT_PUBLIC_TASK_API=http://localhost:8000/api/v1
```

---

## Testing the APIs

### Using cURL

```bash
# 1. Register
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Surya Parua","email":"surya@example.com","password":"password123"}'

# 2. Login (save token)
TOKEN=$(curl -s -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"surya@example.com","password":"password123"}' | jq -r '.token')

# 3. Get user profile
curl -X GET http://localhost:8000/api/v1/auth/me \
  -H "Authorization: Bearer $TOKEN"

# 4. Create task
curl -X POST http://localhost:8000/api/v1/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Build API","description":"Create REST API"}'

# 5. Get all tasks
curl -X GET http://localhost:8000/api/v1/tasks \
  -H "Authorization: Bearer $TOKEN"
```

### Using Swagger UI

1. Open http://localhost:5000/api-docs (User Service)
2. Open http://localhost:5001/api-docs (Task Service)
3. Click "Authorize" and enter: `Bearer <your_jwt_token>`
4. Try endpoints directly from the UI

---

## Troubleshooting

### Port Already in Use

```bash
# Find and kill process using port
lsof -ti:3000 | xargs kill -9  # Frontend
lsof -ti:5000 | xargs kill -9  # User Service
lsof -ti:5001 | xargs kill -9  # Task Service
```

### MongoDB Connection Failed

```bash
# Verify MongoDB is running
docker ps | grep mongo

# Check connection string in .env
# Default: mongodb://mongo:27017/primetrade
```

### CORS Errors

```bash
# Check nginx.conf has correct CORS headers
# Verify frontend API base URL matches docker-compose setup
```

### JWT Token Invalid

```bash
# Token may have expired (7 days)
# Re-login to get a new token
# Verify JWT_SECRET is same across services
```

---

## Database Schema

### Users Collection

```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique, indexed),
  password: String (hashed),
  role: String (enum: ['user', 'admin']),
  createdAt: Date,
  updatedAt: Date
}
```

### Tasks Collection

```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  userId: ObjectId (reference to users),
  completed: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Performance Considerations

| Aspect             | Current          | Recommended for Scale        |
| ------------------ | ---------------- | ---------------------------- |
| **Cache**          | None             | Redis (1-hour TTL)           |
| **Database**       | MongoDB (single) | MongoDB Replica Set          |
| **API Rate Limit** | None             | 100 req/15min per IP         |
| **Logging**        | Console          | ELK Stack or DataDog         |
| **Monitoring**     | None             | Prometheus + Grafana         |
| **CDN**            | None             | CloudFlare or AWS CloudFront |

---

## Deployment

### Docker Compose (Local/Dev)

```bash
docker-compose up --build
```

### Production Deployment

```bash
# Build images
docker build -t user-service:1.0 ./services/user-service
docker build -t task-service:1.0 ./services/task-service
docker build -t frontend:1.0 ./frontend

# Push to registry
docker push user-service:1.0
docker push task-service:1.0
docker push frontend:1.0

# Deploy with Kubernetes or Docker Swarm
kubectl apply -f deployment.yaml
```

---

## API Response Status Codes

| Code    | Meaning                              |
| ------- | ------------------------------------ |
| **200** | Success                              |
| **201** | Created                              |
| **204** | No Content                           |
| **400** | Bad Request (validation error)       |
| **401** | Unauthorized (missing/invalid token) |
| **403** | Forbidden (insufficient permissions) |
| **404** | Not Found                            |
| **500** | Internal Server Error                |

---

## Contributing

1. Create a new branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -am 'Add feature'`
3. Push to branch: `git push origin feature/your-feature`
4. Submit pull request

---

## License

MIT License - See LICENSE file for details

---

## Author

Surya Parua
