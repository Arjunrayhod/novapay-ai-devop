# Contributing

> **Note:** The authoritative contribution guide is at the repository root: [CONTRIBUTING.md](../CONTRIBUTING.md).
>
> This document supplements it with project-specific conventions for the **dashboard** application.

## Branch Naming

Use conventional branch prefixes:

```
feat/add-observability-module
fix/terraform-router-registration
docs/changelog-format
chore/update-dependencies
refactor/k8s-client-pattern
sec/fix-sql-injection
infra/add-docker-compose
```

## Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(observability): add Prometheus metrics endpoint
fix(terraform): register missing module router
docs(changelog): adopt Keep a Changelog format
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `sec`, `infra`

Scopes map to modules: `docker`, `k8s`, `helm`, `terraform`, `observability`, `security`, `ai`, `ui`, `api`, `web`

## PR Checklist

Before opening a PR, verify:

- [ ] Code passes `ruff check` (Python) or `pnpm typecheck` (TypeScript)
- [ ] Endpoints return proper Pydantic schemas (not raw dicts)
- [ ] Graceful degradation for unavailable dependencies
- [ ] Frontend uses `@aegisai/ui` components (not raw HTML)
- [ ] TanStack Query hooks use proper query key namespacing
- [ ] No secrets, credentials, or hardcoded URLs in code
- [ ] Prefer pull requests under 400 lines where practical; larger architectural changes are acceptable when justified and well-reviewed
- [ ] Commit messages follow Conventional Commits
- [ ] Release note created/updated if user-facing change
- [ ] ADR recorded if architectural decision

## Coding Standards

### Python (Backend)

- Module structure: `services/` directory with sync functions returning `dict`
- HTTP calls: use `_make_request()` from `utils.py` (catches exceptions, returns `None`)
- Lazy singleton: `_client = None; def _get_client()` pattern
- Imports: relative imports from `..utils`, `..schemas`
- Router: use `APIRouter()`, validate responses with Pydantic models
- Graceful degradation: never crash on downstream failures; return empty data

### TypeScript (Frontend)

- Module structure: `types/`, `services/`, `hooks/`, `components/`, `pages/`
- Services: use `api.get<T>()` from `@aegisai/utils`
- Hooks: use `@tanstack/react-query` with proper `queryKey` namespacing
- Components: use `@aegisai/ui` shared components
- Component naming: `PascalCase`, match file name (e.g., `health-panel.tsx` → `HealthPanel`)
- Pages: compose components in `pages/<module>-center-page.tsx`

## Validation Checklist

Every sprint must pass before release:

- [ ] Ruff: 0 errors (`ruff check src/`)
- [ ] Python type hints: valid (no `Any` where concrete type exists)
- [ ] TypeScript: 0 errors (`pnpm typecheck`)
- [ ] Build: succeeds (`pnpm build`)
- [ ] Architecture audit: no pattern violations
- [ ] Release note: created in `docs/releases/`
- [ ] CHANGELOG: updated with sprint changes
- [ ] Manual review: completed by at least one reviewer
