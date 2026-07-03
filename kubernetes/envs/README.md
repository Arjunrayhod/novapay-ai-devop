# Environment Overlays

Multi-environment Kustomize overlays for dev, staging, and prod.

## Structure

```
envs/
├── base/                    # Common patches applied to all envs (reserved)
├── dev/                     # Dev environment
│   └── kustomization.yaml
├── staging/                 # Staging environment
│   ├── kustomization.yaml
│   └── patches/
│       └── resource-patches.yaml
└── prod/                    # Production environment
    ├── kustomization.yaml
    └── patches/
        └── resource-patches.yaml
```

## Overlay Inheritance

Each environment overlay:
1. Imports all platform components from the root
2. Applies environment-specific patches
3. Sets environment-specific variables

## Environment Differences

| Dimension | Dev | Staging | Prod |
|-----------|-----|---------|------|
| Namespace suffix | -dev | -staging | (none) |
| Replica count | 1 | 2 | 3+ |
| Resource limits | Minimal | Medium | Production |
| Ingress class | aegisai-nginx | aegisai-nginx | aegisai-nginx |
| TLS issuer | letsencrypt-staging | letsencrypt-prod | letsencrypt-prod |
| PSA level | baseline | baseline | baseline + restricted |

## Usage

```bash
# Dev
kustomize build envs/dev | kubectl apply -f -

# Staging
kustomize build envs/staging | kubectl apply -f -

# Prod
kustomize build envs/prod | kubectl apply -f -
```
