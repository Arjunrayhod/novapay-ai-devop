#!/usr/bin/env bash
set -euo pipefail

# =============================================================================
# AegisAI Local Lab — Validation Script
# =============================================================================
# Runs comprehensive validation of the entire lab environment.
# Usage: ./scripts/validate.sh [--strict]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
STRICT=false
if [[ "${1:-}" == "--strict" ]]; then
    STRICT=true
fi

PASS=0
FAIL=0
WARN=0

pass() { PASS=$((PASS + 1)); echo "  ✅ $1"; }
fail() { FAIL=$((FAIL + 1)); echo "  ❌ $1"; }
warn() { WARN=$((WARN + 1)); echo "  ⚠️  $1"; }

echo "============================================"
echo "  AegisAI Local Lab — Validation Report"
echo "  Mode: $([ "$STRICT" = true ] && echo 'STRICT' || echo 'NORMAL')"
echo "============================================"
echo ""

# -------------------------------------------------------------------------
echo "[Group 1] Docker Infrastructure"
# -------------------------------------------------------------------------
echo ""

# Docker Compose services
SERVICES=(
    "aegisai-registry:Registry"
    "aegisai-postgres:PostgreSQL"
    "aegisai-redis:Redis"
    "aegisai-minio:MinIO"
    "aegisai-vault:Vault"
    "aegisai-prometheus:Prometheus"
    "aegisai-grafana:Grafana"
    "aegisai-loki:Loki"
    "aegisai-tempo:Tempo"
    "aegisai-otel-collector:OTel Collector"
)

for entry in "${SERVICES[@]}"; do
    container="${entry%%:*}"
    name="${entry#*:}"
    if docker ps --format '{{.Names}}' | grep -q "^${container}$"; then
        status=$(docker inspect "$container" --format '{{.State.Status}}' 2>/dev/null)
        if [ "$status" = "running" ]; then
            pass "$name is running"
        else
            fail "$name status is '$status' (expected 'running')"
        fi
    else
        fail "$name container '$container' not found"
    fi
done

# -------------------------------------------------------------------------
echo ""
echo "[Group 2] API / Health Endpoints"
# -------------------------------------------------------------------------
echo ""

ENDPOINTS=(
    "Registry:http://localhost:5000/v2/"
    "MinIO:http://localhost:9000/minio/health/live"
    "Vault:http://localhost:8200/v1/sys/health"
    "Prometheus:http://localhost:9090/-/healthy"
    "Grafana:http://localhost:3000/api/health"
    "Loki:http://localhost:3100/ready"
    "Tempo:http://localhost:3200/ready"
    "OTel:http://localhost:8889/health"
)

for entry in "${ENDPOINTS[@]}"; do
    name="${entry%%:*}"
    url="http://${entry#*:}"
    if curl -sf -o /dev/null "$url" --max-time 3; then
        pass "$name endpoint reachable"
    else
        if [ "$STRICT" = true ]; then
            fail "$name endpoint NOT reachable ($url)"
        else
            warn "$name endpoint not reachable — may still be starting ($url)"
        fi
    fi
done

# -------------------------------------------------------------------------
echo ""
echo "[Group 3] Kubernetes Cluster"
# -------------------------------------------------------------------------
echo ""

if command -v kind &>/dev/null; then
    if kind get clusters --quiet | grep -q '^aegisai-lab$'; then
        pass "Kind cluster 'aegisai-lab' exists"

        if command -v kubectl &>/dev/null; then
            # API server reachable
            if kubectl cluster-info --request-timeout=5s >/dev/null 2>&1; then
                pass "Kubernetes API server reachable"
            else
                fail "Kubernetes API server NOT reachable"
            fi

            # Nodes
            nodes=$(kubectl get nodes --no-headers 2>/dev/null | wc -l)
            ready=$(kubectl get nodes --no-headers 2>/dev/null | grep -c ' Ready')
            if [ "$nodes" -ge 1 ]; then
                pass "$nodes node(s) in cluster"
                if [ "$ready" -eq "$nodes" ]; then
                    pass "All nodes Ready ($ready/$nodes)"
                else
                    warn "Not all nodes Ready ($ready/$nodes)"
                fi
            else
                fail "No nodes found in cluster"
            fi

            # Platform namespaces
            for ns in aegisai-platform aegisai-workloads monitoring opentelemetry; do
                if kubectl get namespace "$ns" --request-timeout=3s >/dev/null 2>&1; then
                    pass "Namespace '$ns' exists"
                else
                    warn "Namespace '$ns' not found"
                fi
            done
        else
            warn "kubectl not found — skipping K8s checks"
        fi
    else
        fail "Kind cluster 'aegisai-lab' does not exist"
    fi
else
    warn "kind not found — skipping cluster checks"
fi

# -------------------------------------------------------------------------
echo ""
echo "[Group 4] Data Services"
# -------------------------------------------------------------------------
echo ""

# PostgreSQL connection
if command -v psql &>/dev/null; then
    if PGPASSWORD=aegisai_dev_password psql -h localhost -U aegisai -d aegisai_platform -c "SELECT 1;" -t --quiet 2>/dev/null | grep -q '1'; then
        pass "PostgreSQL query succeeds"
    else
        fail "PostgreSQL query failed"
    fi
else
    warn "psql not found — skipping PostgreSQL query test"
fi

# Redis connection
if command -v redis-cli &>/dev/null; then
    if redis-cli -h localhost -a aegisai_dev_password ping 2>/dev/null | grep -q 'PONG'; then
        pass "Redis ping succeeds"
    else
        warn "Redis ping failed (redis-cli may be different version)"
    fi
else
    warn "redis-cli not found — skipping Redis ping test"
fi

# MinIO bucket check
if curl -sf "http://localhost:9000/minio/health/live" >/dev/null 2>&1; then
    pass "MinIO is live"
    # Check at least one bucket was created
    if curl -sf -o /dev/null "http://localhost:9000/aegisai-platform/" --max-time 3; then
        pass "MinIO bucket 'aegisai-platform' exists"
    else
        warn "MinIO buckets may not be created yet (init container may still be running)"
    fi
fi

# -------------------------------------------------------------------------
echo ""
echo "[Group 5] Prometheus Targets"
# -------------------------------------------------------------------------
echo ""

if curl -sf "http://localhost:9090/api/v1/targets" --max-time 5 2>/dev/null | python3 -c "
import sys, json
data = json.load(sys.stdin)
targets = data.get('data', {}).get('activeTargets', [])
up = [t for t in targets if t.get('health') == 'up']
down = [t for t in targets if t.get('health') == 'down']
print(f'{len(up)} up, {len(down)} down')
" 2>/dev/null; then
    :  # output already printed
else
    warn "Could not query Prometheus targets"
fi

# -------------------------------------------------------------------------
echo ""
echo "[Group 6] Grafana Datasources"
# -------------------------------------------------------------------------
echo ""

if curl -sf "http://admin:admin@localhost:3000/api/datasources" --max-time 5 2>/dev/null | python3 -c "
import sys, json
data = json.load(sys.stdin)
for ds in data:
    print(f'  {ds[\"name\"]}: {ds[\"type\"]} ({ds[\"url\"]})')
" 2>/dev/null; then
    :  # output already printed
else
    warn "Could not query Grafana datasources"
fi

# -------------------------------------------------------------------------
echo ""
echo "============================================"
echo "  Results: $PASS passed, $FAIL failed, $WARN warnings"
echo "============================================"

if [ "$FAIL" -gt 0 ]; then
    if [ "$STRICT" = true ]; then
        exit 1
    else
        echo "Run with --strict for exit-on-fail behavior."
    fi
fi
