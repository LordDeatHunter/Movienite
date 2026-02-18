# MovieNite

Web app for keeping track of a shared watched/upcoming list of movies.

Made to be used for organizing movie nights for specific discord servers.

![Movienite](.github/assets/movienite.png)

## Setup

### Docker

**Development:**
```bash
docker-compose --env-file .env -p movienite -f docker/docker-compose.yml -f docker/docker-compose.dev.yml up -d --build
```

**Production:**
```bash
docker-compose --env-file .env -p movienite -f docker/docker-compose.yml -f docker/docker-compose.prod.yml up -d --build
```

### Local Development

**Backend:**
```bash
uv sync
uv run alembic upgrade head
uv run uvicorn main:app --reload
```

**Frontend:**
```bash
cd frontend

# npm
npm i
npm run dev

# pnpm
pnpm i
pnpm dev

# bun
bun i
bun dev
```
