# Known Limitations

## Current

These limitations exist in the current codebase and are accepted for now.

| Limitation | Module | Impact | Target |
|---|---|---|---|
| No authentication/authorization | Global | Anyone with network access to the API can read/write data | Sprint 13 |
| No WebSocket/SSE for live logs | Observability | Loki logs poll at 10s instead of streaming | Post-v1.0 |
| OTel collector URL hardcoded | Observability | `otel_service.py` uses `http://localhost:4318` instead of settings | Sprint 9 |
| No Tempo API version setting | Observability | Uses v1 search API which may not exist in all Tempo versions | Sprint 9 |
| AI panel is rule-based (no ML) | Terraform, Observability | Insights are limited to simple heuristics | Sprint 10 |
| `api.get<T>()` lacks custom headers | Frontend Utils | Cannot set auth tokens or custom headers on API calls | Sprint 13 |
| Service functions block event loop | All Backend | Sync functions called from async routes block the event loop | Post-v1.0 |
| No request logging middleware | Global | Observability API calls not logged in debug mode | Sprint 9 |
| No rate limiting | Global | API can be overwhelmed by aggressive polling | Sprint 12 |
| Frontend build output not tested | Web | Only `typecheck` runs in CI; `build` is manual | Sprint 11 |

## Planned

These limitations are known and scheduled for resolution in upcoming sprints.

| Limitation | Target Sprint | Resolution |
|---|---|---|
| Authentication & RBAC | Sprint 13 | OAuth2/SSO with role-based access |
| AI/ML integration | Sprint 10 | Anomaly detection, predictive analytics |
| CI/CD pipeline integration | Sprint 11 | GitHub Actions, pipeline monitoring |
| Settings & configuration | Sprint 12 | User prefs, themes, notification channels |
| Production hardening | Sprint 14 | Performance, error budgets, rate limiting |
| Unit test coverage < 90% | Sprint 14 | Coverage targets for all backend services |
| No E2E tests | Sprint 14 | Playwright/Cypress test suite |

## Won't Fix

These limitations are acknowledged but will not be addressed.

| Limitation | Reason |
|---|---|
| No mobile app | Out of scope for v1.0; consider post-v1.0 |
| No plugin system | Out of scope for v1.0; consider post-v1.0 |
| No multi-cluster K8s | Out of scope for v1.0; consider post-v1.0 |
| No cost analysis | Requires cloud provider APIs; future theme |
| No compliance report generation | SOC2/PCI-DSS reports are post-v1.0 features |
| No Windows-native installer | All deployment targets Linux containers |
