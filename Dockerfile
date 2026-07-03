# syntax=docker/dockerfile:1
FROM python:3.14-slim AS builder
WORKDIR /build
COPY pyproject.toml .
RUN pip install --no-cache-dir build
COPY . .
RUN python -m build --wheel

FROM python:3.14-slim
WORKDIR /app
COPY --from=builder /build/dist/*.whl /tmp/
RUN pip install --no-cache-dir /tmp/*.whl && rm /tmp/*.whl
RUN addgroup --system --gid 1001 app && \
    adduser --system --uid 1001 --gid 1001 app && \
    chown -R app:app /app
USER app
HEALTHCHECK NONE
LABEL org.opencontainers.image.source="https://github.com/novapay-ai/aegisai-platform" \
      org.opencontainers.image.description="AegisAI Enterprise Autonomous DevSecOps Platform" \
      org.opencontainers.image.licenses="Proprietary"
CMD ["python3"]
