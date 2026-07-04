# AegisAI Enterprise DevSecOps Control Center

Enterprise dashboard for the NovaPay AI DevOps platform. Provides unified visibility and control over Kubernetes, Docker, Terraform, Helm, GitHub, monitoring, security, and AI infrastructure.

## Architecture

```
dashboard/
├── apps/
│   ├── web/          Next.js 15 frontend (App Router)
│   ├── api/          FastAPI backend
│   └── ai-engine/    AI/ML engine (reserved)
├── packages/
│   ├── ui/           Design system & shared components
│   ├── theme/        Design tokens (colors, typography, spacing)
│   ├── hooks/        Shared React hooks
│   ├── types/        TypeScript domain models
│   ├── utils/        Shared utilities
│   └── config/       ESLint & TypeScript presets
├── docker/           Docker Compose & Dockerfiles
├── validation/       Validation utilities
└── docs/             Architecture decision records
```

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development
pnpm dev
```

## Environment

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

## Services

| Service | URL | Description |
|---|---|---|
| Dashboard UI | http://localhost:3000 | Next.js frontend |
| API | http://localhost:8000 | FastAPI backend |
| API Docs | http://localhost:8000/docs | OpenAPI documentation |

## Integration Points

The dashboard connects to existing infrastructure without modifying it:

| System | Connection | Purpose |
|---|---|---|
| Kubernetes | K8s API | Cluster state, pods, deployments |
| Docker | Docker socket | Container management |
| Terraform | State file / Cloud API | Infrastructure visualization |
| Helm | Chart directory | Release management |
| GitHub | REST API | CI/CD pipeline status |
| Prometheus | HTTP API | Metrics & alerting |
| Loki | HTTP API | Log aggregation |
| Tempo | HTTP API | Distributed tracing |
| Grafana | HTTP API | Dashboard embedding |

## Development

```bash
pnpm dev          # Start all dev servers
pnpm lint         # Lint all packages
pnpm build        # Build all packages
pnpm typecheck    # TypeScript checking
```
