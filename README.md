# MyTODO

A personal daily to-do application — create, edit, complete, filter and persist
your tasks. Built to the approved project foundation (React + Vite + Tailwind
frontend, Node HTTP API + PostgreSQL backend) and design system (靛蓝 `#4f46e5`).

> Bootstrapped from a static skeleton by [SuperFactory](https://serion.cc/sf/) as
> an end-to-end test of the factory lifecycle (ideation → spec → plan → build →
> quality_gate → deploy → operate). The original `index.html` / `style.css`
> static site (deployed on Render per `render.yaml`, monitored by UptimeRobot)
> is intentionally left untouched; the application lives in the `frontend/` and
> `backend/` workspaces.

## Layout

```
backend/    Node HTTP API (TypeScript) + PostgreSQL, migrations, fail-closed auth
frontend/   React + Vite + Tailwind single-page app, design-system components
```

## Getting started

```bash
npm install            # install all workspaces
npm test               # run backend + frontend test suites
npm run check          # typecheck + lint + tests across workspaces
```

### Backend

```bash
cp backend/.env.example backend/.env   # set DATABASE_URL / SESSIONS_JSON
npm run dev  --workspace @mytodo/backend    # migrates then serves on :8080
```

Endpoints (all `/todos` routes require `Authorization: Bearer <token>`):

| Method | Path                                    | Purpose                        |
| ------ | --------------------------------------- | ------------------------------ |
| GET    | `/health`                               | Health probe (unauthenticated) |
| GET    | `/todos?status=all\|active\|completed`  | List todos + active count      |
| POST   | `/todos`                                | Create (title, non-empty, ≤200)|
| PATCH  | `/todos/:id`                            | Edit title and/or completed    |
| DELETE | `/todos/:id`                            | Delete a todo                  |

Errors use a uniform envelope: `{ "error": { "code", "message" } }`.

### Frontend

```bash
npm run dev  --workspace @mytodo/frontend   # Vite dev server on :5173, /api proxied to :8080
```

## Capabilities

- **todo-management** — create / view / edit / delete with title validation.
- **todo-completion** — toggle completion, filter by status, active count.
- **todo-persistence** — cross-session persistence, per-user fail-closed auth,
  replayable backward-compatible migrations (add-column, never drop).

Specs: `openspec/changes/todo-f8c546dc/`.
