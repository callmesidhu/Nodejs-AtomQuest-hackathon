# GoalSync

# Nodejs-AtomQuest-hackathon

GoalSync is a production-oriented in-house goal setting and tracking portal for enterprise HR performance workflows. It includes employee goal creation, L1 manager approvals, quarterly check-ins, admin governance, dashboards, reports, shared goals, email notifications, and audit logs.

## Quick Start From Git
```bash
git clone https://github.com/callmesidhu/Nodejs-AtomQuest-hackathon
cd AtomQuest

cp apps/api/.env.example apps/api/.env
npm run start:full

npm run stop:full
```

## Stack

- Frontend: React, TypeScript, Tailwind CSS, React Router, TanStack Query, Axios, Recharts
- Backend: Node.js, Express.js, TypeScript
- Database: PostgreSQL with Prisma ORM
- Auth: JWT access and refresh tokens, bcrypt password hashing, RBAC middleware
- Ops: Docker, Vercel-ready frontend, Render/Railway-ready API, Supabase/Neon-ready Postgres

## Demo Credentials

- Employee: `employee@goalsync.com` / `password123`
- Manager: `manager@goalsync.com` / `password123`
- Admin: `admin@goalsync.com` / `password123`


## Environment Variables

Backend variables live in `apps/api/.env`.

- `DATABASE_URL`
- `DIRECT_URL`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `ACCESS_TOKEN_TTL`
- `REFRESH_TOKEN_TTL`
- `PORT`
- `WEB_ORIGIN`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `MAIL_FROM`

Frontend variables live in `apps/web/.env`.

- `VITE_API_URL`

## BRD Rules Implemented

- Total submitted goal weightage must equal exactly 100%.
- Minimum weightage per goal is 10%.
- Maximum goals per employee is 8.
- Locked goals cannot be edited or deleted.
- Shared goal title, thrust area, and target are read-only for recipients.
- Only Admin can unlock approved goals.
- Manager approvals lock goals.
- Quarterly check-ins are restricted to active cycle windows.
- Goal edits, approvals, unlocks, target changes, and weightage changes are audited.

## Deployment

### Frontend on Vercel

- Root directory: `apps/web`
- Build command: `npm run build`
- Output directory: `dist`
- Set `VITE_API_URL` to the deployed API URL.

### Backend on Render or Railway

- Root directory: `apps/api`
- Build command: `npm install && npm run build`
- Start command: `npm run start`
- Set all API environment variables and point `DATABASE_URL` to Supabase or Neon.
- For Supabase on Render, use the transaction pooler URL for `DATABASE_URL` and the direct database URL for `DIRECT_URL`.
- Run Prisma migration before first deploy: `npx prisma migrate deploy`.

### Full-Stack Docker on Render

Use this option when you want one Render Web Service to host both the API and React app.

- Runtime: Docker
- Root directory: leave empty or set `.`
- Dockerfile path: `Dockerfile`
- Health check path: `/health`
- The React app is built into `apps/web/dist` and served by Express from the same Render URL.
- Leave `VITE_API_URL` unset for Docker full-stack hosting so the frontend calls the API on the same origin.
- Set `DATABASE_URL` in Render. `DIRECT_URL` is optional here because the Docker entrypoint falls back to `DATABASE_URL` when `DIRECT_URL` is not provided.

### PostgreSQL on Supabase or Neon

- Create a database.
- Copy the pooled PostgreSQL connection string into `DATABASE_URL`.
- Run `npx prisma migrate deploy` and `npm run seed --workspace apps/api`.

## Reports

- `GET /reports/export?format=csv`
- `GET /reports/export?format=xlsx`

## API Overview

- `POST /auth/login`
- `POST /auth/refresh`
- `GET /goals`
- `POST /goals`
- `PUT /goals/:id`
- `DELETE /goals/:id`
- `POST /goals/submit`
- `POST /approval/:id/approve`
- `POST /approval/:id/reject`
- `POST /checkins`
- `GET /checkins/:goalId`
- `GET /reports/dashboard`
- `GET /reports/export`
- `GET /audit-logs`
- `GET /admin/users`
- `POST /admin/users`

## Screenshots
<img width="1920" height="975" alt="{265B3B5A-01A5-4BD3-8892-64D61ED214C5}" src="https://github.com/user-attachments/assets/95497dc1-c5ac-4fdc-b7bd-e261eb712806" />
<img width="1920" height="973" alt="{EED0BFB5-602A-4321-80C4-99EA92AB6620}" src="https://github.com/user-attachments/assets/d64993be-2154-4f4b-84aa-2f76e0b82499" />
<img width="1920" height="973" alt="{C5D6CFE2-7A69-4E1B-BAF4-5926A4A11C8D}" src="https://github.com/user-attachments/assets/942ad164-c92a-408b-bd5f-121111f7509c" />
<img width="1920" height="973" alt="{8982A225-C339-424E-9D33-66F56B8C0461}" src="https://github.com/user-attachments/assets/27ce8765-8703-4211-b624-f2971a3372d5" />
<img width="1920" height="974" alt="{E3BCF041-FE95-41B1-9AD5-A097F291EE8E}" src="https://github.com/user-attachments/assets/bf1446e6-485d-4ae8-8c92-e1bee964853c" />
<img width="1920" height="976" alt="{951C32F2-4DA6-46BA-BA34-6458C0BF190D}" src="https://github.com/user-attachments/assets/e228e49e-c2d1-44c1-b886-4b4e7eae735e" />
<img width="1920" height="982" alt="{8DF7483D-C47E-4FFB-9071-941082D8FD41}" src="https://github.com/user-attachments/assets/5db98479-644c-4185-b461-93afbbe4d463" />
<img width="1920" height="975" alt="{641F9B7C-8B37-4C34-8EC3-F9F9ED8CE50D}" src="https://github.com/user-attachments/assets/e33f920a-9991-47b5-a338-46f52e569840" />






## Architecture

See [docs/architecture.md](docs/architecture.md).
