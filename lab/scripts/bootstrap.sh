#!/usr/bin/env bash
set -euo pipefail

# =============================================================================
# AegisAI Local Lab — Bootstrap Script
# =============================================================================
# Prerequisites: docker, docker-compose, kind, kubectl, helm, curl, jq
# Usage: ./scripts/bootstrap.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LAB_DIR="$(dirname "$SCRIPT_DIR")"
cd "$LAB_DIR"

echo "=== AegisAI Local Lab Bootstrap ==="
echo ""

# -------------------------------------------------------------------------
# 1. Prerequisite check
# -------------------------------------------------------------------------
echo "[1/7] Checking prerequisites..."

PREREQS=(docker docker-compose kind kubectl helm curl jq)
MISSING=()
for cmd in "${PREREQS[@]}"; do
    if ! command -v "$cmd" &>/dev/null; then
        MISSING+=("$cmd")
    fi
done

if [ ${#MISSING[@]} -gt 0 ]; then
    echo "ERROR: Missing prerequisites: ${MISSING[*]}"
    echo "Install missing tools and re-run."
    exit 1
fi

echo "  All prerequisites found."
echo ""

# -------------------------------------------------------------------------
# 2. Create Docker network
# -------------------------------------------------------------------------
echo "[2/7] Creating Docker network..."

if docker network ls --format '{{.Name}}' | grep -q '^aegisai-lab$'; then
    echo "  Network 'aegisai-lab' already exists."
else
    docker network create aegisai-lab --subnet 172.30.0.0/24
    echo "  Network 'aegisai-lab' created."
fi
echo ""

# -------------------------------------------------------------------------
# 3. Start infrastructure services (Docker Compose)
# -------------------------------------------------------------------------
echo "[3/7] Starting infrastructure services..."

docker-compose up -d
echo "  Waiting for services to become healthy..."
echo ""

SERVICES=(
    "registry:localhost:5000/v2/"
    "postgres:localhost:5432"
    "redis:localhost:6379"
    "minio:localhost:9000/minio/health/live"
    "vault:localhost:8200/v1/sys/health"
    "prometheus:localhost:9090/-/healthy"
    "grafana:localhost:3000/api/health"
    "loki:localhost:3100/ready"
    "tempo:localhost:3200/ready"
    "otel-collector:localhost:8889/health"
)

MAX_WAIT=60
for service_entry in "${SERVICES[@]}"; do
    service_name="${service_entry%%:*}"
    service_url="http://${service_entry#*:}"
    echo -n "  Waiting for $service_name "
    waited=0
    while [ $waited -lt $MAX_WAIT ]; do
        if curl -sf "$service_url" >/dev/null 2>&1; then
            echo " — healthy (${waited}s)"
            break
        fi
        sleep 2
        waited=$((waited + 2))
        echo -n "."
    done
    if [ $waited -ge $MAX_WAIT ]; then
        echo ""
        echo "  WARNING: $service_name did not become healthy within ${MAX_WAIT}s."
        echo "  Check docker-compose logs: docker-compose logs $service_name"
    fi
done
echo ""

# -------------------------------------------------------------------------
# 4. Create Kind cluster
# -------------------------------------------------------------------------
echo "[4/7] Creating Kind cluster..."

if kind get clusters --quiet | grep -q '^aegisai-lab$'; then
    echo "  Kind cluster 'aegisai-lab' already exists."
else
    kind create cluster --config kind-config.yaml
    echo "  Kind cluster 'aegisai-lab' created."
fi
echo ""

# -------------------------------------------------------------------------
# 5. Connect Kind cluster to local registry
# -------------------------------------------------------------------------
echo "[5/7] Connecting Kind cluster to local registry..."

REGISTRY_NETWORK="$(docker inspect aegisai-registry --format '{{range $e, $_ := .NetworkSettings.Networks}}{{println $e}}{{end}}' 2>/dev/null || true)"
if [ -z "$REGISTRY_NETWORK" ]; then
    echo "  WARNING: Registry container 'aegisai-registry' not found."
    echo "  Skipping network connect (may already be connected)."
else
    # Connect registry to kind network if not already
    if ! echo "$REGISTRY_NETWORK" | grep -q 'kind'; then
        docker network connect "kind" "aegisai-registry" 2>/dev/null || true
        echo "  Registry connected to Kind network."
    fi
fi

# Apply registry configmap for containerd
cat <<EOF | kubectl apply -f - 2>/dev/null || true
apiVersion: v1
kind: ConfigMap
metadata:
  name: local-registry-hosting
  namespace: kube-public
data:
  localRegistryHosting.v1: |
    host: "localhost:5000"
    help: "https://kind.sigs.k8s.io/docs/user/local-registry/"
EOF
echo "  Registry ConfigMap applied."
echo ""

# -------------------------------------------------------------------------
# 6. Install platform Helm charts
# -------------------------------------------------------------------------
echo "[6/7] Installing platform Helm charts..."

# Add Helm repos
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts 2>/dev/null || true
helm repo add grafana https://grafana.github.io/helm-charts 2>/dev/null || true
helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts 2>/dev/null || true
helm repo update 2>/dev/null || true

# Install Prometheus stack
if ! helm list -n monitoring 2>/dev/null | grep -q 'prometheus'; then
    kubectl create namespace monitoring --dry-run=client -o yaml | kubectl apply -f -
    helm upgrade --install prometheus prometheus-community/kube-prometheus-stack \
        --namespace monitoring \
        --set grafana.enabled=false \
        --set alertmanager.enabled=false \
        --wait \
        --timeout 5m
    echo "  Prometheus stack installed."
fi

# Install OTel Operator
if ! helm list -n opentelemetry 2>/dev/null | grep -q 'opentelemetry'; then
    kubectl create namespace opentelemetry --dry-run=client -o yaml | kubectl apply -f -
    helm upgrade --install opentelemetry open-telemetry/opentelemetry-operator \
        --namespace opentelemetry \
        --wait \
        --timeout 3m
    echo "  OTel Operator installed."
fi
echo ""

# -------------------------------------------------------------------------
# 7. Create namespace for workloads
# -------------------------------------------------------------------------
echo "[7/7] Creating workload namespaces..."

NAMESPACES=(aegisai-platform aegisai-workloads aegisai-ai aegisai-security)
for ns in "${NAMESPACES[@]}"; do
    kubectl create namespace "$ns" --dry-run=client -o yaml | kubectl apply -f -
    echo "  Namespace '$ns' ready."
done
echo ""

echo "=== Bootstrap complete ==="
echo ""
echo "Access URLs:"
echo "  Grafana:   http://localhost:3000 (admin / admin)"
echo "  Prometheus: http://localhost:9090"
echo "  Loki:       http://localhost:3100"
echo "  Tempo:      http://localhost:3200"
echo "  MinIO API:  http://localhost:9000"
echo "  MinIO Console: http://localhost:9001 (aegisai / aegisai_dev_password)"
echo "  Vault:      http://localhost:8200 (token: root-token-12345)"
echo "  Registry:   http://localhost:5000/v2/"
echo "  PostgreSQL: localhost:5432 (aegisai / aegisai_dev_password / aegisai_platform)"
echo "  Redis:      localhost:6379 (password: aegisai_dev_password)"
echo ""
echo "Kubernetes:"
echo "  kubectl get nodes"
echo ""
echo "Run validation: ./scripts/validate.sh"
