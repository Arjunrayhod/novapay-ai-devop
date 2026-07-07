# Architecture Decision Records

This document records significant architectural decisions made during the development of the AegisAI Enterprise DevSecOps Control Center. Each entry follows a lightweight ADR format.

---

## ADR-001: Monorepo with pnpm Workspaces

**Date:** 2026-04-01 | **Status:** Accepted

**Context:** Need to share UI components, types, utilities, and hooks across backend and frontend packages.

**Decision:** Use pnpm workspaces monorepo with packages in `dashboard/packages/` and apps in `dashboard/apps/`.

**Trade-offs:**
- + Shared code, single version, consistent tooling
- + Fast installs with pnpm content-addressable store
- - Learning curve for developers new to monorepos
- - Requires disciplined package boundaries

---

## ADR-002: Dual Router Pattern (v1 + module)

**Date:** 2026-04-15 | **Status:** Accepted

**Context:** Need to support both a general-purpose API (`/api/v1/...`) and a dedicated module API (`/api/<module>/...`).

**Decision:** Keep legacy v1 routes in `src/routes/` and new module routes in `src/<module>/router.py` with clean separation.

**Trade-offs:**
- + Backwards compatibility for v1 consumers
- + Clear migration path from v1 to modules
- - Duplicate router registration in main.py
- - Inconsistency in URL prefix patterns

---

## ADR-003: Sync Service Functions with Async Routes

**Date:** 2026-04-15 | **Status:** Accepted

**Context:** Backend services (Docker, K8s, Helm, Terraform) use subprocess or SDK calls that are inherently synchronous.

**Decision:** Write service functions as plain sync functions returning `dict`, call them from async FastAPI routes. FastAPI handles sync-to-async bridging.

**Trade-offs:**
- + Simple, testable service functions
- + No async/await complexity in services
- - Blocks event loop during long operations (mitigated by timeouts)
- - Not suitable for high-concurrency I/O-bound workloads

---

## ADR-004: Lazy Singleton Clients

**Date:** 2026-04-22 | **Status:** Accepted

**Context:** Docker SDK client, httpx client, and CLI checks should be initialized once and reused.

**Decision:** Use module-level `_client = None` with `_get_client()` factory that initializes on first call.

**Trade-offs:**
- + Single connection pool, efficient resource usage
- + Simple implementation without dependency injection
- - Harder to mock in tests (use monkeypatch)
- - Global state complicates lifecycle management

---

## ADR-005: Graceful Degradation Over Fail-Fast

**Date:** 2026-05-06 | **Status:** Accepted

**Context:** Backend services (Docker, K8s, observability) may be unavailable in development or partial deployments.

**Decision:** Every service function catches exceptions and returns empty/fallback data instead of raising. Router endpoints never 500 due to downstream failures.

**Trade-offs:**
- + Resilient frontend that never crashes
- + Useful partial data even when some services are down
- - Can mask real errors in production
- - Requires careful logging to distinguish real failures

---

## ADR-006: Rule-Based AI Panel (No ML)

**Date:** 2026-06-15 | **Status:** Accepted

**Context:** Sprint velocity requires AI features but ML model training and integration would take multiple sprints.

**Decision:** Implement AI panels as rule-based heuristics. Use simple if/then logic to generate insights. No ML models, no external AI APIs.

**Trade-offs:**
- + Delivered in 1 sprint instead of 3+
- + Deterministic, explainable, testable
- - Limited insight quality compared to ML
- - Will need replacement when real AI module ships (Sprint 10)

---

## ADR-007: Frontend Module Pattern (types/services/hooks/components/pages)

**Date:** 2026-04-15 | **Status:** Accepted

**Context:** Every frontend feature module needs a consistent structure for maintainability and developer onboarding.

**Decision:** Enforce a 5-directory module structure: `types/`, `services/`, `hooks/`, `components/`, `pages/`. Services use `api.get<T>()` from `@aegisai/utils`. Hooks use TanStack Query.

**Trade-offs:**
- + Consistent, predictable module layout
- + Easy to onboard new developers
- + TanStack Query provides caching, polling, refetch
- - Boilerplate-heavy for simple features
- - `api.get<T>()` lacks custom header support

---

## ADR-008: httpx for HTTP Calls (Observability)

**Date:** 2026-07-05 | **Status:** Accepted

**Context:** Observability module needs to make HTTP requests to Prometheus, Grafana, Loki, and Tempo REST APIs.

**Decision:** Use `httpx` (already a dependency) with a lazy singleton client. Create `_make_request()` utility that catches all exceptions and returns `None` on failure.

**Trade-offs:**
- + Modern async-capable HTTP client
- + No new dependencies (already in pyproject.toml)
- - First module to use HTTP (inconsistent with subprocess pattern)
- + Graceful return of `None` aligns with ADR-005

---

## ADR-009: Keep a Changelog Format

**Date:** 2026-07-05 | **Status:** Accepted

**Context:** Need a standardized changelog format across all releases. Prior releases were tracked ad-hoc in release notes only.

**Decision:** Adopt [Keep a Changelog](https://keepachangelog.com/) v1.1.0 format with Added/Changed/Fixed/Security sections and SemVer versioning.

**Trade-offs:**
- + Industry standard, widely recognized
- + Machine-readable structure
- - Requires discipline to update on every change
- - Some changes cross categories (Added + Changed)

---

## ADR-010: Per-Sprint Release Notes + Architecture Audit

**Date:** 2026-07-05 | **Status:** Accepted

**Context:** Need to ensure each sprint delivers not just code but also documentation of what was built, validation results, and architectural review.

**Decision:** Every sprint must produce: (1) a release note in `docs/releases/vX.Y.Z-<module>.md`, (2) CHANGELOG entry, (3) architecture audit report. The release process document (`docs/RELEASE_PROCESS.md`) codifies the checklist.

**Trade-offs:**
- + Comprehensive documentation per sprint
- + Audit catches regressions and pattern violations
- - Documentation overhead (~15% of sprint time)
- - Audit requires reviewer with architectural context
