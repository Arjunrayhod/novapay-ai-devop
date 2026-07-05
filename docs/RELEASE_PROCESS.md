# Release Process

## Overview

Each sprint produces a tagged release. The release process ensures code quality, documentation completeness, and architectural consistency.

## Prerequisites

- All sprint tasks are complete
- All tests pass
- No known P0/P1 bugs remain
- Architecture audit is clean

## Step-by-Step Process

### 1. Code Validation

```bash
# Python linting
ruff check src/observability/ src/terraform_center/ src/helm_center/ ...

# TypeScript typecheck (from dashboard/)
pnpm typecheck

# Build (from dashboard/)
pnpm build
```

**Acceptance criteria:** 0 errors across all checks.

### 2. Architecture Audit

Run the architecture audit checklist:

- [ ] New module follows established directory structure
- [ ] Service functions are sync, return `dict`
- [ ] Router validates responses with Pydantic models
- [ ] Frontend uses `@aegisai/ui` components
- [ ] TanStack Query hooks follow namespacing convention
- [ ] Graceful degradation implemented
- [ ] No mutation endpoints where read-only is expected
- [ ] All imports use relative paths within module
- [ ] No secrets or hardcoded credentials

### 3. Documentation

- [ ] Release note created at `docs/releases/v<version>-<module>.md`
- [ ] `docs/releases/README.md` updated with new entry
- [ ] `docs/CHANGELOG.md` updated with Added/Changed/Fixed sections
- [ ] `docs/ARCHITECTURE_DECISIONS.md` updated if new ADRs needed
- [ ] `docs/KNOWN_LIMITATIONS.md` updated if new limitations discovered

### 4. Version Bump

Update the version in:

- `dashboard/apps/api/src/settings.py` — `VERSION` field
- `docs/releases/v<version>.md` — release date

### 5. Manual Review

- [ ] Reviewer confirms all validation checks passed
- [ ] Reviewer confirms documentation is complete
- [ ] Reviewer approves the release

### 6. Tag and Release

```bash
# Create git tag
git tag -a v<version> -m "v<version> — <module>"

# Push tag
git push origin v<version>

# Create GitHub Release (via UI or gh CLI)
gh release create v<version> \
  --title "v<version> — <module>" \
  --notes-file docs/releases/v<version>-<module>.md
```

### 7. Post-Release

- [ ] Verify GitHub Release page renders correctly
- [ ] Announce in team channels
- [ ] Update sprint tracking board

## Release Note Template

Every release note must include:

```markdown
# v<version> — <Module Name>

**Release Date:** YYYY-MM-DD

## Features

- Bullet list of major features

## Bug Fixes

- Bullet list of fixes (if any)

## Architecture

- Key architectural decisions and pattern changes

## Validation

- Ruff: X errors
- TypeScript typecheck: X errors
- Build: passes/fails
- Architecture audit: passes/clean/flags

## Known Limitations

- New limitations introduced in this sprint
```

## Hotfix Process

For critical fixes between sprints:

1. Create `hotfix/<description>` branch from the release tag
2. Apply the minimal fix
3. Bump patch version (e.g., `v0.7.1`)
4. Follow steps 1-7 above (with expedited review)
5. Merge hotfix back to main

## Release Frequency

- **Regular sprints:** Every 1-2 weeks
- **Hotfixes:** As needed for P0/P1 issues
- **Release candidates:** Prefixed with `v1.0.0-rc.1` etc.
