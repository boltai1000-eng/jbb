# JBB Tables Dashboard

Full-stack sales dashboard for table installations with:

- JWT authentication
- sales CRUD with multi-table line items
- analytics dashboard with KPI cards and charts
- India map view with cached OpenStreetMap geocoding
- Gemini `gemini-2.5-flash` insights and chat
- SQLite storage for a single-computer internal deployment

## Stack

- Frontend: React, TypeScript, Vite, React Router, TanStack Query, Recharts, React Leaflet
- Backend: Node.js, Express, TypeScript, SQLite (`better-sqlite3`)

## Run

1. Copy [`apps/server/.env.example`](./apps/server/.env.example) to `apps/server/.env`.
2. Optional: set `DATA_DIR` to a local folder on the machine that will host the app. If left blank, the app stores its database in `%USERPROFILE%\.jbb-tables-dashboard`.
3. Install dependencies:

```bash
pnpm install
```

4. Start both apps:

```bash
pnpm dev
```

5. Open `http://localhost:5173`.

## Self-hosted Production

For one-computer use, build the frontend and run the server:

```bash
pnpm --filter @jbb/client build
pnpm --filter @jbb/server build
cd apps/server
$env:NODE_ENV="production"
node dist/index.js
```

Then open `http://localhost:4000`.

## Database Location

- Default SQLite path: `%USERPROFILE%\.jbb-tables-dashboard\jbb.db`
- Override with `DATA_DIR` in `apps/server/.env`
- Keep this folder on a local disk, not a synced/network drive

## Backups

Use the included PowerShell backup script:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\backup-db.ps1
```

It creates timestamped copies in `backups/`. Run it daily with Windows Task Scheduler for safety.

## Default login

- Email: `admin@jbbtables.com`
- Password: `admin123`

Change these after first run in production.
