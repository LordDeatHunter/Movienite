# AGENTS.md — MovieNite Agent Operating Guide

This file is for coding agents working in this repository. It documents **verified** commands,
current tooling, and code conventions inferred from the source.

## 1) Project Snapshot

- Backend: FastAPI (Python, `uv` workflow), app entry in `main.py`.
- Frontend: SolidJS + TypeScript + Vite, code under `frontend/src`.
- Database: PostgreSQL via `psycopg`, schema managed by Alembic.
- Realtime: SSE endpoint at `/events`.

## 2) Command Reference (Verified)

Run commands from repo root unless a different directory is stated.

### Backend (Python)

- Install deps: `uv sync`
- Run migrations: `uv run alembic upgrade head`
- Start API (dev): `uv run uvicorn main:app --reload`
- Start API (direct module): `uv run python main.py`

### Frontend (Solid + Vite)

Run from `frontend/`:

- Install deps: `bun install --frozen-lockfile` (CI path)
- Dev server: `bun run dev` (or `npm run dev` / `pnpm dev`)
- Build: `bun run build` (CI uses this in PR checks)
- Lint: `npm run lint`
- Lint autofix: `npm run lint:fix`
- Format check: `npm run format:check`
- Format write: `npm run format:fix`

### Docker

- Dev stack: `docker compose --env-file .env -p movienite -f docker/docker-compose.yml -f docker/docker-compose.dev.yml up -d --build`
- Prod-like stack: `docker compose --env-file .env -p movienite -f docker/docker-compose.yml -f docker/docker-compose.prod.yml up -d --build`

## 3) Test and Single-Test Guidance

Current repository state:

- No backend test suite/config (`pytest` tests not present).
- No frontend test runner scripts (no vitest/jest/playwright scripts in `frontend/package.json`).

What to do today:

- Use lint + build as the primary verification path.
- Validate backend changes via focused manual endpoint checks and migration sanity.

If tests are added later, use these standard single-test forms:

- Pytest single test: `uv run pytest path/to/test_file.py::test_name`
- Vitest single test: `bunx vitest run path/to/file.test.ts -t "test name"`

Only use the above when the corresponding test framework is actually introduced.

## 4) CI/Automation Signals

- PR workflow (`.github/workflows/pr-check.yml`) currently runs:
  - `bun install --frozen-lockfile`
  - `bun run build`
- There is currently **no CI lint or CI test step**.
- Deploy workflow updates `master` and rebuilds Docker services remotely.

## 5) Repository Rules Files (Cursor/Copilot)

Checked and **not found**:

- `.cursorrules`
- `.cursor/rules/`
- `.github/copilot-instructions.md`

If any of these are added later, treat them as highest-priority local instructions.

## 6) Python Code Style (Observed)

### Imports and file layout

- Group imports as: stdlib → third-party → local modules.
- Keep one import per line for clarity.
- Typical modules: `main.py`, `database/db.py`, `discord_oauth.py`, `movienite.py`.

### Naming and typing

- `snake_case` for functions/variables, `UPPER_SNAKE_CASE` for constants.
- Use type hints on function signatures (`str | None`, `dict | None`, etc.).
- Dataclasses are used for domain models (`data.py`).

### Error handling

- Prefer explicit failures with HTTP status + JSON error payload in API routes.
- Log failures with context (`logger.error(...)`, `logger.warning(...)`).
- Avoid broad `except:` in new code; catch specific exceptions where practical.

### Data and API conventions

- JSON/dict keys commonly use `snake_case` (`movie_url`, `avatar_url`, `is_admin`).
- Access control checks happen at route layer (`main.py`) before DB mutation.
- DB helper functions return clear values (`bool | None`, dict rows, or raise `ValueError`).

## 7) Frontend Style (Solid + TypeScript, Observed)

### Imports and modules

- Use path alias `@` for `frontend/src` imports.
- Keep `import type` for type-only imports when useful.
- Vite config defines alias and `/api` proxy to backend (`frontend/vite.config.ts`).

### Naming and component patterns

- Components: PascalCase filenames and exports (`MovieSection`, `AddMovieModal`).
- Local handlers/signals: camelCase (`handleSubmit`, `setFormLoading`).
- Store modules expose state + action functions (`authStore.ts`, `movieStore.ts`).

### Types and strictness

- TypeScript is `strict: true` (`frontend/tsconfig.json`).
- Define shared interfaces in `frontend/src/types.ts` or near domain store.
- Avoid `any` in new code; existing files include legacy `err: any` with eslint suppression.

### UI/state conventions

- Solid primitives used heavily: `createSignal`, `createMemo`, `Show`, `createStore`.
- Side effects (keyboard listeners, SSE reconnect) live in hooks/components via Solid lifecycle APIs.
- API calls centralized in `frontend/src/utils/api.ts` and throw on non-OK responses.

### Lint/format behavior

- ESLint + TypeScript + Solid config is active (`frontend/eslint.config.js`).
- Prettier is used for formatting checks/writes.
- `no-console` and `no-debugger` are off in dev and error in production lint mode.

## 8) Change Checklist for Agents

For backend changes:

1. `uv sync` (if dependencies changed)
2. `uv run alembic upgrade head` (if schema touched)
3. `uv run uvicorn main:app --reload` smoke check endpoints touched

For frontend changes (from `frontend/`):

1. `bun install --frozen-lockfile` (or existing local package manager lock path)
2. `npm run lint`
3. `npm run format:check`
4. `bun run build`

For cross-stack changes:

1. Backend smoke check
2. Frontend lint + build
3. Ensure `/api` proxy interactions still work locally

## 9) Practical Guardrails

- Keep edits minimal and consistent with existing surrounding style.
- Do not introduce new frameworks/toolchains unless required.
- Prefer extending existing stores/utils/routes over creating parallel patterns.
- When introducing tests, also add scripts so single-test execution is first-class.

---

If this file drifts from actual tooling/config, update it in the same PR that changes the tooling.
