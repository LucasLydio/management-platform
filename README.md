# Management Platform

Full-stack task management MVP with Angular, Node.js, PostgreSQL, Redis, Prisma, JWT auth, and Socket.IO.

## Development

```bash
docker compose up -d postgres redis
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate:dev -- --name init
npm run prisma:seed
npm run dev
```

In another terminal:

```bash
cd frontend
npm install
npm start
```

Open `http://localhost:8080`.

## Docker

```bash
docker compose up --build
```

Open `http://localhost:8080`.

Seed the database before first production-like use:

```bash
cd backend
npm run prisma:migrate:deploy
npm run prisma:seed
```

