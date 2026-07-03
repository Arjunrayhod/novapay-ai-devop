#!/usr/bin/env bash
set -euo pipefail

# =============================================================================
# AegisAI Local Lab — Seed Data
# =============================================================================
# Seeds sample data into PostgreSQL, MinIO, Vault, and Grafana for demo/testing.
# Usage: ./scripts/seed-data.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LAB_DIR="$(dirname "$SCRIPT_DIR")"
cd "$LAB_DIR"

echo "=== Seeding AegisAI Lab with Sample Data ==="
echo ""

# -------------------------------------------------------------------------
# Seed PostgreSQL
# -------------------------------------------------------------------------
echo "[1/4] Seeding PostgreSQL..."

PG_DSN="postgresql://aegisai:aegisai_dev_password@localhost:5432/aegisai_platform"

# Insert sample deployments
if command -v psql &>/dev/null; then
    PGPASSWORD=aegisai_dev_password psql -h localhost -U aegisai -d aegisai_platform <<'SQL'
INSERT INTO aegisai_platform.deployments (service_id, version, environment, status, started_at, completed_at)
SELECT
    id,
    '1.0.0',
    'lab',
    'success',
    NOW() - INTERVAL '1 hour',
    NOW() - INTERVAL '55 minutes'
FROM aegisai_platform.services
WHERE name = 'aegisai-orchestrator'
ON CONFLICT DO NOTHING;

INSERT INTO aegisai_platform.deployments (service_id, version, environment, status, started_at, completed_at)
SELECT
    id,
    '0.9.0',
    'lab',
    'failed',
    NOW() - INTERVAL '2 hours',
    NOW() - INTERVAL '1 hour 58 minutes'
FROM aegisai_platform.services
WHERE name = 'aegisai-orchestrator'
ON CONFLICT DO NOTHING;
SQL
    echo "  Sample deployment records inserted."
else
    echo "  Skipping (psql not available)."
fi

# -------------------------------------------------------------------------
# Seed MinIO
# -------------------------------------------------------------------------
echo ""
echo "[2/4] Seeding MinIO..."

# Create a sample file
echo "{\"service\": \"aegisai-orchestrator\", \"version\": \"1.0.0\", \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}" > /tmp/sample-artifact.json

if curl -sf -X PUT \
    -H "Content-Type: application/json" \
    -T /tmp/sample-artifact.json \
    "http://aegisai:aegisai_dev_password@localhost:9000/aegisai-artifacts/samples/sample-artifact.json" \
    --max-time 5 >/dev/null 2>&1; then
    echo "  Sample artifact uploaded to MinIO (aegisai-artifacts/samples/)."
else
    echo "  Skipping (MinIO may not be ready or auth failed)."
fi

rm -f /tmp/sample-artifact.json

# -------------------------------------------------------------------------
# Seed Vault (additional secrets)
# -------------------------------------------------------------------------
echo ""
echo "[3/4] Seeding Vault..."

VAULT_TOKEN="root-token-12345"
export VAULT_ADDR="http://localhost:8200"

if curl -sf -H "X-Vault-Token: $VAULT_TOKEN" "$VAULT_ADDR/v1/sys/health" --max-time 3 >/dev/null 2>&1; then
    curl -sf -X POST \
        -H "X-Vault-Token: $VAULT_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{"data": {"api_key": "sk-lab-sample-key-for-dev", "jwt_secret": "lab-jwt-secret-not-for-prod", "encryption_key": "lab-enc-key-32chars!!!"}}' \
        "$VAULT_ADDR/v1/secret/data/aegisai/api" \
        --max-time 3 >/dev/null 2>&1 || true
    echo "  Sample secrets written to Vault (secret/aegisai/api)."
else
    echo "  Skipping (Vault not reachable)."
fi

# -------------------------------------------------------------------------
# Seed Grafana annotations
# -------------------------------------------------------------------------
echo ""
echo "[4/4] Creating Grafana annotations..."

GRAFANA_URL="http://admin:admin@localhost:3000"

if curl -sf "$GRAFANA_URL/api/health" --max-time 3 >/dev/null 2>&1; then
    # Create annotation for bootstrap event
    curl -sf -X POST \
        -H "Content-Type: application/json" \
        -d "{\"text\": \"Lab seeded with sample data\", \"tags\": [\"aegisai\", \"bootstrap\"]}" \
        "$GRAFANA_URL/api/annotations" \
        --max-time 3 >/dev/null 2>&1 || true
    echo "  Grafana annotation created."
else
    echo "  Skipping (Grafana not reachable)."
fi

echo ""
echo "=== Seed complete ==="
echo "Sample data is ready for exploration."
