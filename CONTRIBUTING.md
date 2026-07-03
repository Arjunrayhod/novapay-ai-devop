# Contributing to AegisAI

## Welcome

Thank you for contributing to the AegisAI Enterprise Autonomous DevSecOps Platform.
All contributors must follow the engineering standards defined in ENGINEERING_STANDARDS.md
and respect the architectural decisions in PROJECT_CONTEXT.md and SYSTEM_ARCHITECTURE.md.

## How to Contribute

### 1. Understand the Architecture

Before making any change, read:
- PROJECT_CONTEXT.md — governing document (Single Source of Truth)
- SYSTEM_ARCHITECTURE.md — technical blueprint
- ENGINEERING_STANDARDS.md — mandatory engineering standards

### 2. Pick an Issue

Start with issues labeled `good-first-issue` or `help-wanted`.
Comment on the issue to let others know you are working on it.

### 3. Branch Strategy

We use trunk-based development with short-lived feature branches:

- `main` — production-ready (protected, requires 2 approvals)
- `staging` — pre-production (protected, requires 1 approval)
- `dev` — integration branch
- `feature/<description>` — short-lived feature branches
- `hotfix/<description>` — emergency fixes

Branch naming: `feat/`, `fix/`, `docs/`, `chore/`, `refactor/`, `sec/`, `infra/`
followed by a short kebab-case description.

### 4. Commit Convention

Use Conventional Commits format:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `sec`, `infra`

### 5. Pull Request Process

1. Create a feature branch from `dev`.
2. Make your changes following ENGINEERING_STANDARDS.md.
3. Run pre-commit hooks locally: `pre-commit run --all-files`
4. Push your branch and open a PR against `dev`.
5. Fill out the PR template completely.
6. Ensure all CI checks pass.
7. Get approval from the owning team (see CODEOWNERS).
8. Squash-merge to `dev`.

### 6. PR Requirements

- Title must follow conventional commit format
- Description must explain what and why
- PR must be under 400 lines changed
- All CI checks must pass
- At least one approval from the owning team
- No TODO/FIXME without linked issues

### 7. Code Quality

- Python: ruff, mypy strict mode, pytest with 80%+ coverage
- Terraform: fmt, validate, Checkov, tfsec
- Kubernetes: kubeconform, OPA dry-run validation
- All code must pass pre-commit hooks

### 8. Security

- Never commit secrets, credentials, or tokens
- Run detect-secrets pre-commit hook before every commit
- Report security vulnerabilities to the Security team via SECURITY.md
- Follow the Security Coding Standards in ENGINEERING_STANDARDS.md §20

### 9. Documentation

- Update README.md for user-facing changes
- Update or create ADR for architectural changes
- Update API docs for endpoint changes
- Write Google-style docstrings for all public Python functions

### 10. Need Help?

- Check existing documentation in `/docs/`
- Ask in the #aegisai-dev channel on Slack
- Attend platform engineering office hours (weekly, see calendar)
- File an issue for documentation gaps
