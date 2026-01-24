FROM alpine:latest

WORKDIR /app

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

COPY pyproject.toml uv.lock ./
COPY database/db.py /app/database/db.py
COPY *.py /app/

RUN uv sync --frozen --no-dev

EXPOSE 23245

CMD ["uv", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "23245"]
