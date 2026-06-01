# syntax=docker/dockerfile:1

FROM public.ecr.aws/lambda/python:3.10

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR ${LAMBDA_TASK_ROOT}

RUN pip install --no-cache-dir "poetry==2.1.3" \
    && poetry config virtualenvs.create false

COPY pyproject.toml poetry.lock ./

RUN poetry install --no-root --no-interaction --without test

COPY app ./app

CMD ["app.main.handler"]