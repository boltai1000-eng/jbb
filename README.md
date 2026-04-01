# JBB Tables Dashboard

Full-stack sales dashboard for table installations with:

- JWT authentication
- sales CRUD with multi-table line items
- analytics dashboard with KPI cards and charts
- India map view with cached OpenStreetMap geocoding
- Gemini `gemini-2.5-flash` insights and chat
- PostgreSQL-ready backend for permanent hosted storage

## Stack

- Frontend: React, TypeScript, Vite, React Router, TanStack Query, Recharts, React Leaflet
- Backend: Node.js, Express, TypeScript, PostgreSQL (`pg`)

## Run

1. Copy [`apps/server/.env.example`](./apps/server/.env.example) to `apps/server/.env`.
2. Make sure PostgreSQL is available locally and update `DATABASE_URL`.
3. Install dependencies:

```bash
pnpm install
```

4. Start both apps:

```bash
pnpm dev
```

5. Open `http://localhost:5173`.

## Default login

- Email: `admin@jbbtables.com`
- Password: `admin123`

Change these after first run in production.

## Render

Use [`render.yaml`](./render.yaml) to provision:

- one web service for the full app
- one managed PostgreSQL database

The Express server serves the built React frontend in production.
