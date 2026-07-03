# Observability Framework

Monitoring, logging, and tracing foundation for the AegisAI platform.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Grafana (UI Layer)                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  Metrics     │  │   Logs       │  │     Traces           │  │
│  │  Dashboards  │  │   Dashboards │  │     Dashboards       │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘  │
│         │                 │                      │              │
│         ▼                 ▼                      ▼              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  Prometheus  │  │    Loki      │  │     Tempo            │  │
│  │  + Alertmgr  │  │              │  │                      │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘  │
│         │                 │                      │              │
│         ▼                 ▼                      ▼              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                 OpenTelemetry Collector                    │   │
│  │  (Metrics + Logs + Traces pipeline)                       │   │
│  └──────────────────────────┬───────────────────────────────┘   │
│                             │                                    │
│                             ▼                                    │
│                    Applications & Platform                       │
└─────────────────────────────────────────────────────────────────┘
```

## Components

| Component | Type | CRDs | Data Source |
|-----------|------|------|-------------|
| Prometheus | Metrics | ServiceMonitor, PodMonitor, PrometheusRule | All pods |
| Grafana | Visualization | GrafanaDashboard | Prometheus, Loki, Tempo |
| Loki | Logs | N/A | All stdout/stderr |
| Tempo | Traces | N/A | OTLP from apps |
| OpenTelemetry | Collector | OpenTelemetryCollector | App instrumentation |
| kube-state-metrics | Metrics | N/A | Kubernetes API |
| node-exporter | Metrics | N/A | Node-level metrics |
| Alertmanager | Alerting | AlertmanagerConfig | Prometheus |

## Storage Strategy

| Data Type | Storage | Retention | Backup |
|-----------|---------|-----------|--------|
| Prometheus metrics | EBS (gp3, 100Gi) | 15 days | Snapshot |
| Loki logs | EBS (gp3, 200Gi) | 7 days | Snapshot |
| Tempo traces | S3 bucket | 7 days | S3 replication |

## Scrape Targets

| Target | Interval | Port |
|--------|----------|------|
| kubelet / cadvisor | 30s | 10250 |
| kube-state-metrics | 30s | 8080 |
| node-exporter | 30s | 9100 |
| ingress-nginx | 30s | 10254 |
| cert-manager | 30s | 9402 |
| Application pods | 30s | 9090 (annotation-based) |

## Directory

```
observability/
├── README.md
├── kustomization.yaml
├── monitoring/
│   ├── prometheus/              # Prometheus CR + ServiceMonitors
│   ├── alertmanager/            # Alertmanager configuration
│   └── grafana/                 # Grafana datasources, dashboards
├── logging/
│   └── loki/                    # Loki config, storage, retention
└── tracing/
    └── tempo/                   # Tempo config, storage
```
