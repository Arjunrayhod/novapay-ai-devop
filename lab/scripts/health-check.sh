#!/usr/bin/env bash
set -euo pipefail

# =============================================================================
# AegisAI Local Lab — Health Check
# =============================================================================
# Queries each service health endpoint and reports status.
# Usage: ./scripts/health-check.sh [--verbose]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VERBOSE=false
if [[ "${1:-}" == "--verbose" ]]; then
    VERBOSE=true
fi

HEADER="%-30s %-15s %s\n"

printf "$HEADER" "SERVICE" "STATUS" "DETAILS"
printf "%0.s-" {1..70}
echo ""

check_endpoint() {
    local service=$1
    local url=$2
    local expected_code=${3:-200}
    local detail=""

    if status=$(curl -sf -o /dev/null -w "%{http_code}" --max-time 5 "$url" 2>/dev/null); then
        if [ "$status" -eq "$expected_code" ]; then
            printf "$HEADER" "$service" "✅ HEALTHY" "HTTP $status"
        else
            printf "$HEADER" "$service" "⚠️  DEGRADED" "Expected $expected_code, got $status"
        fi
    else
        printf "$HEADER" "$service" "❌ DOWN" "Connection failed"
    fi
}

check_tcp() {
    local service=$1
    local host=$2
    local port=$3

    if timeout 3 bash -c "echo >/dev/tcp/$host/$port" 2>/dev/null; then
        printf "$HEADER" "$service" "✅ HEALTHY" "TCP port $port open"
    else
        printf "$HEADER" "$service" "❌ DOWN" "TCP port $port not reachable"
    fi
}

check_process() {
    local service=$1
    local container=$2

    if docker ps --format '{{.Names}}' | grep -q "^${container}$"; then
        local status=$(docker inspect "$container" --format '{{.State.Status}}' 2>/dev/null)
        printf "$HEADER" "$service" "✅ HEALTHY" "Container $status"
    else
        printf "$HEADER" "$service" "❌ DOWN" "Container not running"
    fi
}

# Docker Compose services
check_endpoint "Registry" "http://localhost:5000/v2/"
check_endpoint "PostgreSQL" "http://localhost:5432" 200 2>/dev/null || check_process "PostgreSQL" "aegisai-postgres"
check_endpoint "Redis" "http://localhost:6379" 200 2>/dev/null || check_process "Redis" "aegisai-redis"
check_endpoint "MinIO" "http://localhost:9000/minio/health/live"
check_endpoint "Vault" "http://localhost:8200/v1/sys/health"
check_endpoint "Prometheus" "http://localhost:9090/-/healthy"
check_endpoint "Grafana" "http://localhost:3000/api/health"
check_endpoint "Loki" "http://localhost:3100/ready"
check_endpoint "Tempo" "http://localhost:3200/ready"
check_endpoint "OTel Collector" "http://localhost:8889/health"

# Kind cluster
if command -v kind &>/dev/null; then
    if kind get clusters --quiet | grep -q '^aegisai-lab$'; then
        printf "$HEADER" "Kind Cluster" "✅ HEALTHY" "Cluster 'aegisai-lab' exists"

        # Kubernetes nodes
        if command -v kubectl &>/dev/null; then
            node_count=$(kubectl get nodes --no-headers 2>/dev/null | wc -l)
            ready_count=$(kubectl get nodes --no-headers 2>/dev/null | grep ' Ready' | wc -l)
            printf "$HEADER" "K8s Nodes" "✅ HEALTHY" "${ready_count}/${node_count} ready"
        fi
    else
        printf "$HEADER" "Kind Cluster" "❌ DOWN" "Cluster 'aegisai-lab' not found"
    fi
fi

echo ""
echo "=== Quick Service Details ==="
echo "  Grafana:       http://localhost:3000  (admin / admin)"
echo "  Prometheus:    http://localhost:9090"
echo "  Loki:          http://localhost:3100"
echo "  Tempo:         http://localhost:3200"
echo "  MinIO Console: http://localhost:9001"
echo "  Vault:         http://localhost:8200"
echo "  Registry:      http://localhost:5000/v2/"
echo "  PostgreSQL:    localhost:5432"
echo "  Redis:         localhost:6379"
