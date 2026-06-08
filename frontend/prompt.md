# Frontend Codex Prompt Guide

Use this file as the default prompt context for work inside `management-platform/frontend`.

## Project Context

- Project: Management Tasks frontend MVP.
- Stack: Angular 19 standalone components, TypeScript, RxJS, Reactive Forms, SCSS, Bootstrap, Angular CDK drag and drop, Socket.IO client.
- Runtime shape:
  - Auth pages at `/auth/login` and `/auth/register`.
  - Protected app at `/` behind `authGuard`.
  - HTTP configured with `authInterceptor` and `errorInterceptor`.
  - Backend API base URL comes from `src/environments/environment*.ts` and currently uses `/api/v1`.
  - Realtime task refresh uses Socket.IO through `TaskService.connectRealtime()`.
- Main domain: authenticated users manage their own tasks with create, list, filter, update status, archive, restore, delete, and realtime refresh.

## Architecture Map

- `src/app/core`
  - Guards, interceptors, services, and shared domain types.
- `src/app/features/auth`
  - Login, register, Google sign-in flow, guest-only routes.
- `src/app/features/home`
  - Main task dashboard, task creation flow, filters, board columns, drag and drop.
- `src/app/layout`
  - Authenticated shell and page structure.
- `src/app/shared`
  - Reusable UI components, directives, shared styles.
- `src/environments`
  - Environment-specific API, socket, and Google config.

## Current Business Rules

- Authentication is required for the root app area. Do not expose dashboard routes without `authGuard`.
- Auth pages must stay guest-only through `guestGuard`.
- Session state is persisted in `localStorage` by `AuthService` using token plus user.
- All API requests must continue going through Angular `HttpClient`.
- Requests must preserve `withCredentials` behavior because auth and refresh flows depend on it.
- Authorization header injection must remain centralized in `authInterceptor`.
- On `401` errors outside `/auth/login`, the app logs out and redirects to `/auth/login`.
- Task status values are fixed:
  - `TODO`
  - `IN_PROGRESS`
  - `DONE`
  - `ARCHIVED`
- Task priority values are fixed:
  - `LOW`
  - `MEDIUM`
  - `HIGH`
- Task card status progression is currently:
  - `TODO -> IN_PROGRESS`
  - `IN_PROGRESS -> DONE`
  - `DONE -> ARCHIVED`
  - `ARCHIVED -> TODO`
- Archive is not delete. Do not merge or confuse these actions.
- Realtime updates are additive support for the UI, not a replacement for API correctness.

## Required Code Patterns

- Prefer standalone Angular components and lazy route loading, matching the existing app.
- Follow the existing split:
  - `core` for app-wide services, guards, interceptors, types.
  - `features` for user-facing screens and feature-specific components.
  - `shared` for reusable UI building blocks.
- Reuse existing types from `core/types` instead of redefining task, auth, user, or API response shapes.
- Use Reactive Forms for forms already following that pattern.
- Use Angular signals where the codebase already uses signals for local UI state.
- Use RxJS streams for async data flow from services and route/query param reactions.
- Keep API access inside services, not directly in components.
- Prefer strongly typed inputs, outputs, and service responses.
- Preserve lazy imports in route files.
- Keep environment access centralized through the existing environment files.

## Runtime Safety Rules

- Do not introduce direct `window`, `document`, or browser API usage in components when Angular injection already exists for it.
- When reading optional data from API, route params, query params, or form controls, guard against `null` and empty values.
- Do not assume `task.dueDate`, `task.description`, `authService.token()`, or `currentUser` are always present.
- Do not bypass form validation before submit handlers.
- When converting dates, preserve the current API contract:
  - `dueDate` is `null` or ISO string.
- Do not mutate readonly signal-driven state in ad hoc ways; update through the existing service or signal setters.
- When subscribing in components, make cleanup explicit or use the Angular destroy helpers already present in the codebase.
- Do not create duplicate Socket.IO connections. Respect the safeguards already present in `TaskService`.
- Avoid changing interceptor behavior unless the task explicitly requires auth flow changes.
- Do not hardcode production URLs in components or services.
- Do not silently swallow API errors that the UI currently surfaces to users.

## Rules To Avoid Breaking Business Logic

- Do not rename or change the meaning of task status and priority enums without updating all dependent UI and API flows.
- Do not change route paths such as `/`, `/auth/login`, or `/auth/register` unless the request explicitly includes navigation changes.
- Do not move auth persistence out of `AuthService` unless the request is specifically about auth architecture.
- Do not bypass `TaskService` for task CRUD or realtime task updates.
- Do not change the login, register, refresh, logout, or Google auth endpoints casually.
- Do not change query param handling for integration feedback unless the task explicitly concerns integrations.
- Do not break drag-and-drop status updates by changing the column status mapping without updating drop logic.
- Do not convert archive into a hard delete flow.
- Do not remove `withCredentials` from auth-related requests.

## Rules To Avoid Breaking Code Pattern

- Match the existing naming and folder structure before creating new abstractions.
- Prefer extending an existing service, type file, or shared component before adding parallel versions.
- Keep components focused on presentation and orchestration; keep backend communication in services.
- Reuse `AppButtonComponent`, `AppInputComponent`, `AppSelectComponent`, and shared directives when suitable.
- Keep styles in component SCSS files or shared style layers already used by the app.
- Avoid introducing a state library, custom event bus, or global singleton pattern unless explicitly requested.
- Avoid mixing template-driven forms into flows already built with Reactive Forms.

## Definition Of Done For Codex Changes

- The requested change is implemented in the correct feature or shared layer.
- No existing auth, task, filter, or realtime behavior is accidentally removed.
- Types compile without unsafe shape drift.
- Imports are valid and consistent with standalone Angular usage.
- New UI states handle loading, empty, success, and error cases when relevant.
- Validation commands are run when possible:
  - `npm run typecheck`
  - `npm run build`

## How Codex Should Work

- First inspect related files before editing.
- Make the smallest change that satisfies the request.
- Prefer safe refactors over broad rewrites.
- Call out assumptions briefly if the request leaves domain behavior unclear.
- If a requested change conflicts with the business rules above, stop and explain the risk before changing it.

## Request Template

Paste your request below when asking Codex to work on this frontend.

```md
Task:

Goal:

Scope:

Relevant files or screens:

Business rules to preserve:

Acceptance criteria:

Validation to run:
```

## Ready-To-Use Prompt

```md
You are working only in `management-platform/frontend`.

Read `prompt.md` first and follow it as the project contract.

Before editing:
- inspect the related files
- preserve business rules, routing, auth flow, task flow, and realtime behavior
- reuse existing types, services, shared UI, and Angular standalone patterns

When implementing:
- keep API access in services
- keep `withCredentials` and interceptor-driven auth behavior intact
- guard against null and undefined values
- avoid runtime errors from optional data, subscriptions, and browser APIs
- make the smallest safe change

After implementing:
- run relevant validation if possible
- summarize what changed, any assumptions, and any remaining risk

User request:
[replace this section with your request]
```
