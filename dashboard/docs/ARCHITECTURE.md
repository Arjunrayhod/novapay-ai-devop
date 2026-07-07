# AegisAI Dashboard Architecture

## Overview

AegisAI is an Enterprise AI DevSecOps Control Center for the NovaPay platform.
It is a self-contained monorepo under `dashboard/` that does not modify existing infrastructure.

## Monorepo Structure

```
dashboard/
├── apps/
│   ├── web/          # Next.js 15 frontend
│   ├── api/          # FastAPI backend
│   └── ai-engine/    # Reserved for AI/ML (future)
├── packages/
│   ├── ui/           # shadcn/ui + custom components
│   ├── theme/        # Design tokens
│   ├── types/        # TypeScript domain models
│   ├── utils/        # Shared utilities
│   ├── hooks/        # React hooks
│   └── config/       # ESLint, TypeScript configs
├── docker/           # Docker Compose + Dockerfiles
├── docs/             # Architecture documentation + ADRs
└── validation/       # Validation scripts
```

## Key Decisions

- Turborepo + pnpm for monorepo management
- Tailwind CSS v4 with `@theme` directive for design tokens
- shadcn/ui for foundational component library
- TypeScript strict mode with path aliases (`@aegisai/*`)
- FastAPI with Pydantic v2 for backend
- Independent `docker-compose.yml` connects to existing `lab/docker-compose.yml`

## Design System

- Colors: Primary (blue), semantic success/warning/danger, neutral grays
- Typography: Inter (sans), JetBrains Mono (mono)
- Components: shadcn/ui base + custom enterprise components
- Dark mode: Supported via Tailwind `dark:` variant

## API Architecture

- RESTful JSON API under `/api/v1/`
- Routes: docker, kubernetes, terraform, helm, github, monitoring, security, system, ai, environment
- Async endpoints with Pydantic request/response models
