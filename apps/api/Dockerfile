# syntax=docker/dockerfile:1

FROM python:3.10.12

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# Install Poetry globally and avoid per-project virtualenvs so dependencies stay available
RUN pip install --no-cache-dir "poetry==2.1.3" \
    && poetry config virtualenvs.create false

# Install only runtime dependencies to keep the image slim
COPY pyproject.toml poetry.lock ./
RUN poetry install --no-root --no-interaction --without test

# Copy application source
COPY app ./app
COPY test_endpoints.sh ./

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
