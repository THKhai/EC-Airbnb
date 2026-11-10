# Backend (FastAPI). Deps come from requirements.lock.txt (exact set verified by scripts/smoke_demo.py).
FROM python:3.12-slim AS build
RUN apt-get update && apt-get install -y --no-install-recommends build-essential libpq-dev \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY requirements.lock.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.lock.txt

FROM python:3.12-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
RUN apt-get update && apt-get install -y --no-install-recommends libpq5 \
    && rm -rf /var/lib/apt/lists/* \
    && useradd --create-home --uid 10001 app
COPY --from=build /install /usr/local
WORKDIR /app
COPY --chown=app:app app ./app
COPY --chown=app:app scripts ./scripts
# loguru writes logs/*.log relative to the working dir
RUN mkdir -p /app/logs && chown app:app /app/logs
USER app
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD python -c "import urllib.request,sys; sys.exit(0 if urllib.request.urlopen('http://127.0.0.1:8000/api/v1/health', timeout=4).status == 200 else 1)"
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--proxy-headers", "--forwarded-allow-ips", "*"]
