# AegisAI Local Enterprise Development Lab

A fully containerized local development environment that mirrors the production
AegisAI platform infrastructure. Runs entirely on your workstation with no
cloud dependencies.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        AegisAI Local Lab                                │
│                                                                         │
│  ┌────────────────────────────────────────────────────────┐            │
│  │                  Docker Compose                         │            │
│  │                                                         │            │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐ │            │
│  │  │PostgreSQL│  │  Redis   │  │  MinIO   │  │ Vault  │ │            │
│  │  │  :5432   │  │  :6379   │  │:9000/9001│  │ :8200  │ │            │
│  │  └──────────┘  └──────────┘  └──────────┘  └────────┘ │            │
│  │       │              │             │             │      │            │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐ │            │
│  │  │Prometheus│  │  Grafana │  │   Loki   │  │  Tempo │ │            │
│  │  │  :9090   │  │  :3000   │  │  :3100   │  │ :3200  │ │            │
│  │  └──────────┘  └──────────┘  └──────────┘  └────────┘ │            │
│  │       │                            │             │      │            │
│  │  ┌─────────────────────────────────────────────────┐    │            │
│  │  │          OpenTelemetry Collector                 │    │            │
│  │  │              :4317 / :4318                       │    │            │
│  │  └─────────────────────────────────────────────────┘    │            │
│  │       │                                                  │            │
│  │  ┌─────────────────────────────────────────────────┐    │            │
│  │  │          Local Registry                          │    │            │
│  │  │                  :5000                           │    │            │
│  │  └─────────────────────┬───────────────────────────┘    │            │
│  └────────────────────────┼────────────────────────────────┘            │
│                           │                                            │
│  ┌────────────────────────┼────────────────────────────────────────────┐│
│  │                  Kind Cluster                                       ││
│  │  ┌─────────────────────┴───────────────────────────┐                ││
│  │  │              Control Plane (1)                   │                ││
│  │  └─────────────────────┬───────────────────────────┘                ││
│  │  ┌─────────────────────┴───────────────────────────┐                ││
│  │  │              Worker Node (2-3)                    │                ││
│  │  │  ┌─────────────┐  ┌─────────────┐  ┌──────────┐  │                ││
│  │  │  │ monitoring/ │  │opentelemetry│  │ platform │  │                ││
│  │  │  │  Prometheus │  │    OTel     │  │workloads │  │                ││
│  │  │  └─────────────┘  └─────────────┘  └──────────┘  │                ││
│  │  └───────────────────────────────────────────────────┘                ││
│  └────────────────────────────────────────────────────────────────────────┘│
└───────────────────────────────────────────────────────────────────────────┘
```

### Service Topology

```
External → Grafana(:3000)──→ Prometheus(:9090)──→ All service /metrics
                              → Loki(:3100)      → Logs from Fluent Bit
                              → Tempo(:3200)     → Traces via OTel
                              → PostgreSQL(:5432)
                              → Redis(:6379)
                              → MinIO(:9000)
                              → Vault(:8200)

Apps     → OTel Collector(:4317)──→ Tempo (traces)
                                   → Prometheus (metrics via OTel)
                                   → debug output

CI/CD    → Registry(:5000)  → Images pushed to local registry
         → Kind cluster     → Deploy to local Kubernetes
```

## Prerequisites

| Tool | Version | Purpose |
|---|---|---|
| Docker | 24+ | Container runtime |
| Docker Compose | 2.24+ | Service orchestration (included with Docker Desktop) |
| Kind | 0.23+ | Local Kubernetes |
| kubectl | 1.30+ | Kubernetes CLI |
| Helm | 3.15+ | Package management |
| curl | 7+ | Health checks |
| jq | 1.7+ | JSON processing |

Optional but recommended:

| Tool | Purpose |
|---|---|
| `psql` (PostgreSQL client) | Database inspection |
| `redis-cli` | Redis inspection |
| `vault` CLI | Vault operations |
| `stern` | Multi-pod log tailing |

## Quick Start

### 1. Clone and enter the lab

```bash
cd lab/
```

### 2. Full bootstrap

```bash
make bootstrap
```

This runs the bootstrap script which:
1. Checks prerequisites
2. Creates Docker network
3. Starts all infrastructure containers
4. Creates Kind cluster
5. Connects Kind to local registry
6. Installs Prometheus stack and OTel Operator

### 3. Seed sample data (optional)

```bash
make seed
```

### 4. Validate everything

```bash
make validate
```

## Step-by-Step Manual Setup

If you prefer to run each step individually:

### Infrastructure services

```bash
# Start all Docker Compose services
docker-compose up -d

# Check they're healthy
make status
```

### Kind cluster

```bash
# Create cluster
make kind-up

# Verify
kubectl get nodes
```

### Helm charts (in-cluster)

```bash
# Add repos
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update

# Install kube-prometheus-stack (without Grafana — using compose one)
kubectl create namespace monitoring --dry-run=client -o yaml | kubectl apply -f -
helm upgrade --install prometheus prometheus-community/kube-prometheus-stack \
    --namespace monitoring \
    --set grafana.enabled=false \
    --set alertmanager.enabled=false \
    --wait
```

## Service Reference

| Service | Internal Hostname | Port(s) | Auth | Health Endpoint |
|---|---|---|---|---|
| **PostgreSQL** | `postgres.aegisai.local` | `5432` | `aegisai / aegisai_dev_password` | `pg_isready` |
| **Redis** | `redis.aegisai.local` | `6379` | `aegisai_dev_password` | `PING` |
| **MinIO API** | `minio.aegisai.local` | `9000` | `aegisai / aegisai_dev_password` | `/minio/health/live` |
| **MinIO Console** | `minio.aegisai.local` | `9001` | `aegisai / aegisai_dev_password` | — |
| **Vault** | `vault.aegisai.local` | `8200` | Token: `root-token-12345` | `/v1/sys/health` |
| **Prometheus** | `prometheus.aegisai.local` | `9090` | None | `/-/healthy` |
| **Grafana** | `grafana.aegisai.local` | `3000` | `admin / admin` | `/api/health` |
| **Loki** | `loki.aegisai.local` | `3100` | None | `/ready` |
| **Tempo** | `tempo.aegisai.local` | `3200` / `4317`(gRPC) | None | `/ready` |
| **OTel Collector** | `otel.aegisai.local` | `4317` / `4318` / `8888` | None | `/health` |
| **Registry** | `registry.aegisai.local` | `5000` | None | `/v2/` |

## Credentials

All credentials are for **local development only** and must never be used outside the lab.

```
PostgreSQL:  aegisai / aegisai_dev_password / aegisai_platform
Redis:       password = aegisai_dev_password
MinIO:       aegisai / aegisai_dev_password
Grafana:     admin / admin
Vault:       token = root-token-12345
```

## Working with the Lab

### Build and push an image

```bash
docker build -t localhost:5000/my-service:latest .
docker push localhost:5000/my-service:latest
```

### Deploy to Kind cluster

```bash
kubectl create deployment my-service --image=localhost:5000/my-service:latest
```

### Port-forward for testing

```bash
kubectl port-forward deployment/my-service 8080:80
```

### View logs

```bash
# Service logs
kubectl logs deployment/my-service

# Infrastructure logs
make logs service=prometheus
```

### Query observability

- **Metrics:** Open Prometheus at http://localhost:9090
- **Dashboards:** Open Grafana at http://localhost:3000 (admin/admin)
- **Logs:** Grafana Explore → Loki datasource
- **Traces:** Grafana Explore → Tempo datasource

## Use with Application Code

### Python / FastAPI

```python
import psycopg2
import redis

# PostgreSQL
conn = psycopg2.connect(
    host="localhost",
    port=5432,
    user="aegisai",
    password="aegisai_dev_password",
    dbname="aegisai_platform",
)

# Redis
r = redis.Redis(
    host="localhost",
    port=6379,
    password="aegisai_dev_password",
)

# MinIO (S3)
from minio import Minio
client = Minio(
    "localhost:9000",
    access_key="aegisai",
    secret_key="aegisai_dev_password",
    secure=False,
)
```

### OpenTelemetry tracing

```python
from opentelemetry import trace
from opentelemetry.exporter.otlp.proto.grpc.exporter import OTLPSpanExporter
from opentelemetry.sdk.trace import TracerProvider

provider = TracerProvider()
provider.add_span_processor(
    BatchSpanProcessor(OTLPSpanExporter(endpoint="http://localhost:4317"))
)
trace.set_tracer_provider(provider)
```

## Destroying the Lab

```bash
# Stop everything (keeps data volumes)
make down

# Full reset (destroys volumes + cluster)
make reset

# Complete cleanup
make clean
```

## Commands Reference

```bash
make help           # Show all commands
make up             # Start all services
make down           # Stop all services
make status         # Health check
make bootstrap      # Full setup
make validate       # Comprehensive validation
make seed           # Seed sample data
make logs service=X # Tail logs for service X
make reset          # Full reset
make kind-up        # Create Kind cluster
make kind-down      # Destroy Kind cluster
make kind-load img=X # Load image into Kind
make psql           # Connect to PostgreSQL
make redis-cli      # Connect to Redis
```

## Troubleshooting

### Port conflicts

If ports 3000, 5432, 6379, or 9000 are already in use, edit `docker-compose.yml`
to map different host ports.

### Docker Compose services not starting

```bash
# Check logs
docker-compose logs <service-name>

# Rebuild
docker-compose up -d --force-recreate <service-name>
```

### Kind cluster creation fails

```bash
# Delete and retry
kind delete cluster --name aegisai-lab
kind create cluster --config kind-config.yaml
```

### MinIO buckets not created

The `minio-init` container runs once after MinIO starts. Check its logs:

```bash
docker logs aegisai-minio-init
```

If it failed, re-run it:

```bash
docker-compose up minio-init
```

### Prometheus targets down

Verify targets at http://localhost:9090/targets. If the in-cluster Prometheus
cannot scrape Docker-based services, ensure the `monitoring` namespace has the
correct ServiceMonitor configurations.

## Validation Checklist

Use `make validate` or run through this checklist manually:

| Check | Command | Expected |
|---|---|---|
| Docker Compose services | `docker ps --format '{{.Names}} {{.Status}}'` | All 10 containers running |
| Registry API | `curl -sf http://localhost:5000/v2/` | `{}` |
| PostgreSQL | `PGPASSWORD=aegisai_dev_password psql -h localhost -U aegisai -d aegisai_platform -c "SELECT 1;"` | `1` |
| Redis | `redis-cli -h localhost -a aegisai_dev_password ping` | `PONG` |
| MinIO | `curl -sf http://localhost:9000/minio/health/live` | `ok` |
| MinIO buckets | `curl -sf http://localhost:9000/aegisai-platform/` | `ListBucketResult` |
| Vault | `curl -sf http://localhost:8200/v1/sys/health` | Initialized, sealed=false |
| Prometheus | `curl -sf http://localhost:9090/-/healthy` | `Prometheus is Healthy` |
| Prometheus targets | `curl -sf http://localhost:9090/api/v1/targets` | Active targets > 0 |
| Grafana | `curl -sf http://localhost:3000/api/health` | `"ok"` |
| Grafana datasources | `curl -sf http://admin:admin@localhost:3000/api/datasources` | 4+ datasources |
| Loki | `curl -sf http://localhost:3100/ready` | `Ready` |
| Tempo | `curl -sf http://localhost:3200/ready` | `Ready` |
| OTel Collector | `curl -sf http://localhost:8889/health` | `{"status":"ok"}` |
| Kind cluster | `kind get clusters` | `aegisai-lab` |
| K8s nodes | `kubectl get nodes` | 3 nodes Ready |
| K8s namespaces | `kubectl get ns` | aegisai-platform, aegisai-workloads, monitoring, opentelemetry |
| Helm releases | `helm list -n monitoring` | prometheus deployed |
