# Management Tasks Frontend

Angular standalone frontend for the Management Tasks MVP.

## Stack

- Angular 19, TypeScript, RxJS, Reactive Forms
- Lazy routes, auth guard, HTTP interceptors
- Reusable UI components and smart/presentational task components
- Bootstrap CSS, responsive SCSS, Docker + Nginx
- Socket.IO client for real-time task refresh

## Run locally

Start the backend first, then:

```bash
npm install
npm start
```

Frontend URL: `http://localhost:8080`

The dev server proxies `/api/v1` to `http://localhost:3333`.

## Main screens

- `/auth/login`: local login and Google ID-token login
- `/auth/register`: local account creation
- `/`: guarded task dashboard with create, search, filter, paginate, status update, and delete

## Architecture

- `app/core`: guards, interceptors, services, API types
- `app/features`: lazy auth and home/task dashboard features
- `app/layout`: authenticated shell
- `app/shared`: reusable UI and directives
- `environments`: API and Socket.IO URLs

## Validation

```bash
npm run typecheck
npm run build
```

## Production

The frontend Docker image builds Angular and serves it with Nginx. Nginx proxies:

- `/api/v1/*` to the backend
- `/socket.io/*` to the backend Socket.IO server

