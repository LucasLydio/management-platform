# Backend Codex Prompt Guide

Use this file as the default prompt context for work inside `management-platform/backend`.

## Project Context

- Project: Management Tasks backend MVP.
- Stack: Node.js, TypeScript, Express 5, Prisma, PostgreSQL, Redis with in-memory fallback, Socket.IO, Zod, Jest.
- API base path: `/${API_PREFIX}/v1`, usually `/api/v1`.
- Main domains:
  - auth with JWT access token and HTTP-only refresh cookie
  - task management with owner/admin access rules
  - integrations endpoints
  - health check
- Architecture style: modular backend with separated config, HTTP, realtime, cache, auth, tasks, integrations, and database layers.

## Architecture Map

- `src/core/config`
  - Environment parsing and app configuration.
- `src/core/http`
  - Shared errors, middlewares, route composition.
- `src/core/database`
  - Prisma client wiring.
- `src/core/cache`
  - Cache abstraction with Redis and memory fallback.
- `src/core/realtime`
  - Event emitter and Socket.IO server bridge.
- `src/modules/auth`
  - Register, login, Google auth, refresh, me, logout, token handling.
- `src/modules/tasks`
  - Task schemas, repository, service, routes, permissions.
- `src/modules/integrations`
  - Integration endpoints and Notion callback flow.
- `src/infra/database`
  - Prisma schema, migrations, seed.
- `src/tests`
  - Unit, integration, and e2e tests.

## Current Business Rules

- Protected routes require a valid Bearer access token and use `requireAuth`.
- Refresh uses the HTTP-only cookie, not the access token.
- Logout revokes all refresh sessions by incrementing `tokenVersion`.
- Access tokens and refresh tokens carry:
  - `sub`
  - `email`
  - `name`
  - `role`
  - `tokenVersion`
  - `type`
- Auth endpoints are rate-limited under `/${API_PREFIX}/v1/auth`.
- Google login is only enabled when `GOOGLE_CLIENT_ID` exists.
- Users have roles:
  - `ADMIN`
  - `COMMON`
- Task statuses are fixed:
  - `TODO`
  - `IN_PROGRESS`
  - `DONE`
  - `ARCHIVED`
- Task priorities are fixed:
  - `LOW`
  - `MEDIUM`
  - `HIGH`
- Common users can access only their own tasks.
- Admin users can list and access all tasks.
- Task reads are cached and task mutations must invalidate task cache entries.
- Task mutations must emit realtime `task.changed` events.
- Delete emits `{ id, deleted: true }` for realtime clients.
- Validation errors return `422`.
- Known domain errors use `AppError` with the intended HTTP status.

## Required Code Patterns

- Keep validation in Zod schemas close to the module that owns the route.
- Keep route handlers thin:
  - parse input
  - call service
  - send response
  - pass errors to `next`
- Keep business logic in services, not in routes.
- Keep database access in repositories or core database helpers, not in routes.
- Reuse Prisma enums and existing types when possible instead of redefining domain constants in multiple places.
- Prefer centralized error handling through `AppError` and `errorHandler`.
- Preserve the modular folder structure before adding new abstractions.
- Keep env access centralized through `src/core/config/env.ts`.
- Follow the existing response shape:
  - single resource: `{ data: ... }`
  - paginated list: `{ data: [...], meta: ... }`

## Runtime Safety Rules

- Do not trust `request.user`, headers, cookies, params, query, or body without validation or auth middleware.
- Guard against missing or invalid env values by extending the Zod env schema instead of reading raw `process.env`.
- Do not bypass token verification helpers in `token.service.ts`.
- Do not call Prisma with unchecked IDs or payloads when a Zod schema should validate them first.
- Preserve async error forwarding with `try/catch` plus `next(error)` in routes unless a shared async wrapper is intentionally introduced.
- Do not return raw internal errors, stack traces, secrets, tokens, hashes, or provider credentials in API responses.
- When adding cache reads, always define the invalidation path for related writes.
- When adding realtime events, ensure the payload is stable and scoped to the correct user room.
- Do not assume Redis is available; the app must still work with memory fallback.
- Keep pagination normalization safe:
  - page minimum `1`
  - limit minimum `1`
  - limit maximum `50`

## Rules To Avoid Breaking Business Logic

- Do not remove or weaken owner/admin authorization checks for tasks.
- Do not change auth cookie behavior casually:
  - cookie name
  - `httpOnly`
  - `sameSite`
  - `secure`
  - max age
  - path
- Do not make refresh depend on the Authorization header.
- Do not change token payload structure or `tokenVersion` semantics unless the request is explicitly about auth redesign.
- Do not change route paths like `/auth/login`, `/auth/refresh`, `/tasks`, `/tasks/all`, or `/integrations/notion/callback` unless requested.
- Do not skip cache invalidation after create, update, or delete of tasks.
- Do not skip realtime emit after task mutations.
- Do not convert archive behavior into delete semantics.
- Do not remove the admin-vs-common task visibility rule.
- Do not break the redirect-based Notion callback flow.

## Rules To Avoid Breaking Code Pattern

- Prefer extending an existing module over creating parallel services or duplicate repositories.
- Keep security-sensitive code explicit and readable, even if it is slightly more verbose.
- Add new middleware only when the concern is cross-cutting.
- Add new env variables to `env.ts`, README if relevant, and the code path that consumes them.
- Keep Prisma schema changes, migrations, and code changes aligned.
- Avoid introducing a new ORM, validation library, logger pattern, or stateful singleton unless explicitly requested.
- Do not move business rules into controllers or middleware when they belong in services.

## Database And Schema Rules

- Update `src/infra/database/schema.prisma` carefully; preserve existing model names and mappings unless the task requires a migration.
- Keep Prisma model-to-table mappings stable when possible.
- If schema changes are required, make sure related repository, service, validation, and API response code are updated together.
- Do not change enum values casually because they are part of persisted data and API contracts.
- Preserve cascading behavior such as task ownership and Notion connection ownership unless the request explicitly changes it.

## Testing And Validation Expectations

- Prefer targeted tests for business logic, validation, pagination, auth, or permission changes.
- Reuse existing test style with Jest.
- Validation commands when possible:
  - `npm run typecheck`
  - `npm test`
  - `npm run build`
- If Prisma or schema behavior changes, also consider:
  - `npm run prisma:generate`

## How Codex Should Work

- First inspect related modules, schemas, routes, and tests before editing.
- Make the smallest safe change that satisfies the request.
- Preserve API contracts unless the request explicitly changes them.
- Mention assumptions briefly if a request leaves domain behavior unclear.
- If a requested change conflicts with access control, token flow, cache correctness, or realtime correctness, stop and explain the risk before changing it.

## Request Template

Paste your request below when asking Codex to work on this backend.

```md
Task:

Goal:

Scope:

Relevant modules or endpoints:

Business rules to preserve:

Acceptance criteria:

Validation to run:
```

## Ready-To-Use Prompt

```md
You are working only in `management-platform/backend`.

Read `prompt.md` first and follow it as the project contract.

Before editing:
- inspect the related files
- preserve auth flow, access control, route contracts, cache behavior, and realtime behavior
- reuse existing schemas, services, repositories, middlewares, and module structure

When implementing:
- keep validation in Zod
- keep business logic in services
- keep database access in repositories or core database helpers
- use `AppError` for known domain failures
- guard against invalid input, missing auth, missing env, and runtime null cases
- make the smallest safe change

After implementing:
- run relevant validation if possible
- summarize what changed, any assumptions, and any remaining risk

User request:
[replace this section with your request]
```
