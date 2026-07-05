# Changelog

All notable changes to the AegisAI Enterprise DevSecOps Control Center are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned

- Security Center — SAST, dependency scanning, policy enforcement
- AI Center — ML-powered insights, anomaly detection
- CI/CD Pipeline Manager — GitHub Actions integration, pipeline monitoring
- Settings & Configuration — User preferences, theme customization

## [0.7.0] — 2026-07-05

### Added

- Observability Control Center module with 13 read-only API endpoints
- Prometheus integration: metrics query, targets, rules, alerts
- Grafana integration: health, dashboards, datasources
- Loki integration: log query, label discovery
- Tempo integration: trace search, service graph
- OpenTelemetry collector health check
- Frontend Observability Center page with 11 components
- AI Insights panel (rule-based placeholder)
- Export to JSON/Markdown and clipboard diagnostics

### Architecture

- First module using direct HTTP calls via `httpx` (all prior modules use subprocess)
- Lazy singleton HTTP client pattern
- Graceful degradation when observability services are unavailable

### Validation

- Ruff: 0 errors after auto-fix
- TypeScript typecheck: 0 errors
- Architecture audit completed

## [0.6.1] — 2026-06-15

### Added

- Terraform Control Center module with 9 API endpoints
- State inspection, module listing, resource tree, provider list
- Plan analysis with add/change/destroy counts
- Output viewer with sensitive value masking
- Frontend Terraform Center page with AI panel and health panel
- Architecture audit report generation

### Fixed

- Missing `app.include_router()` for terraform module router in main.py

### Validation

- Ruff: 0 errors (2 auto-fixed)
- TypeScript typecheck: 0 errors

## [0.6.0] — 2026-06-01

### Added

- Helm Center module with 10 API endpoints
- Release management: list, inspect, history, values
- Chart management: search, repositories, dependencies
- Frontend Helm Center with release table, chart browser
- Lazy singleton CLI availability check with caching

### Validation

- Ruff: 0 errors
- TypeScript typecheck: 0 errors

## [0.5.0] — 2026-05-06

### Added

- Kubernetes integration with 20+ API endpoints
- Pod, deployment, service, namespace, node, event management
- ConfigMap and Secret inspection
- Frontend K8s Center with resource tables and pod logs
- In-cluster and kubeconfig-based authentication support

### Validation

- Ruff: 0 errors
- TypeScript typecheck: 0 errors

## [0.4.0] — 2026-04-22

### Added

- Docker Engine integration via official Docker SDK
- Container management: list, inspect, start, stop, restart, logs
- Image management: list, pull, remove, prune
- System info, disk usage, live events, container stats
- 15 API endpoints under `/api/docker`
- Frontend Docker Center with container table and stats

### Validation

- Ruff: 0 errors
- TypeScript typecheck: 0 errors

## [0.3.0] — 2026-04-15

### Added

- Environment detection module with 6 API endpoints
- System, Python, Network, Storage, Process, Security detectors
- Frontend Environment overview page
- Established services directory pattern with sync functions returning dict
- Established router + schema validation pattern

### Validation

- Ruff: 0 errors
- TypeScript typecheck: 0 errors

## [0.2.0] — 2026-04-08

### Added

- `@aegisai/ui` shared component library
- DashboardLayout with sidebar navigation
- Card, GlassCard, MetricCard, StatusBadge components
- Search input component
- Dark mode support via Tailwind
- Typography system, color palette, spacing scale

### Validation

- TypeScript strict mode passes
- All components render with light and dark themes

## [0.1.0] — 2026-04-01

### Added

- Project scaffold with FastAPI backend and Next.js frontend
- pnpm monorepo with 7 packages
- Docker Compose development environment
- Basic settings and configuration module
- API health endpoint
- CORS middleware

### Validation

- Python project initialized with pyproject.toml
- Next.js project initialized with TypeScript
- pnpm workspace configured

---

[unreleased]: https://github.com/aegisai/dashboard/compare/v0.7.0...HEAD
[0.7.0]: https://github.com/aegisai/dashboard/releases/tag/v0.7.0
[0.6.1]: https://github.com/aegisai/dashboard/releases/tag/v0.6.1
[0.6.0]: https://github.com/aegisai/dashboard/releases/tag/v0.6.0
[0.5.0]: https://github.com/aegisai/dashboard/releases/tag/v0.5.0
[0.4.0]: https://github.com/aegisai/dashboard/releases/tag/v0.4.0
[0.3.0]: https://github.com/aegisai/dashboard/releases/tag/v0.3.0
[0.2.0]: https://github.com/aegisai/dashboard/releases/tag/v0.2.0
[0.1.0]: https://github.com/aegisai/dashboard/releases/tag/v0.1.0
