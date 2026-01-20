FROM alpine:latest

WORKDIR /app

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

COPY *.py /app/
COPY ../database/db.py /app/database/db.py
COPY ../pyproject.toml uv.lock ./

RUN uv sync --frozen --no-dev

COPY ../static /app/static/

EXPOSE 8000

CMD ["uv", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
