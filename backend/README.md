# Management Tasks Backend

Node.js + TypeScript API for the Management Tasks MVP.

## Stack

- Express 5, TypeScript, Prisma, PostgreSQL
- JWT access tokens + HTTP-only refresh cookie
- Redis-backed cache with in-memory fallback
- Socket.IO real-time task updates
- Jest unit tests and Docker support

## Run locally

```bash
npm install
npm run db:up
npm run prisma:generate
npm run prisma:migrate:dev -- --name init
npm run prisma:seed
npm run dev
```

API base URL: `http://localhost:3333/api/v1`

Seeded admin:

- E-mail: `admin@management.local`
- Password: `Admin@12345`

## Environment

Copy `.env.example` to `.env` and adjust secrets before deploying.

Required values:

- `DATABASE_URL`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `CORS_ORIGINS`
- `REDIS_URL` when Redis is available
- `GOOGLE_CLIENT_ID` to enable Google ID-token login

## Endpoints

- `GET /api/v1/health`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/google`
- `POST /api/v1/auth/refresh`
- `GET /api/v1/auth/me`
- `POST /api/v1/auth/logout`
- `GET /api/v1/tasks?page=1&limit=10&status=TODO&search=text`
- `POST /api/v1/tasks`
- `PATCH /api/v1/tasks/:id`
- `DELETE /api/v1/tasks/:id`

## Rules kept

- Modular structure: config, HTTP, cache, realtime, auth, tasks, health
- REST status codes, pagination, validation, and centralized errors
- Task reads are cached with TTL and invalidated on mutation
- Common users see only their tasks; admins can list all tasks

## Validation

```bash
npm run typecheck
npm test
```

