# GoalSync Architecture

```mermaid
flowchart LR
  Employee[Employee Portal] --> Web[React + TypeScript + Tailwind]
  Manager[Manager Portal] --> Web
  Admin[Admin / HR Portal] --> Web
  Web -->|JWT + Axios| API[Express TypeScript API]
  API --> Auth[Auth + RBAC Middleware]
  API --> Goals[Goal Workflow Services]
  API --> Reports[Reports + Export Services]
  API --> Mail[Nodemailer Templates]
  Goals --> Audit[Audit Log Service]
  Reports --> Audit
  API --> Prisma[Prisma ORM]
  Prisma --> Postgres[(PostgreSQL)]
  Web --> Charts[Recharts Dashboards]
```

## Domain Boundaries

- Auth owns JWT login, refresh tokens, password hashing, and role authorization.
- Goals owns validation rules, approval workflow, shared goals, locking, unlocks, and progress scoring.
- Check-ins owns quarterly window enforcement and achievement updates.
- Reports owns dashboard summaries plus CSV and Excel exports.
- Audit logs record goal edits, approvals, unlocks, target changes, and weightage changes.
