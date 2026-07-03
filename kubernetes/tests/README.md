# Test Strategy

Validation and conformance testing for the AegisAI Kubernetes platform.

## Test Types

| Type | Tool | Scope | When |
|------|------|-------|------|
| Conformance | `sonobuoy` | Cluster API conformance | Cluster creation |
| Policy Validation | `kubectl validate`, `conftest` | OPA/Gatekeeper policies | Pre-deploy |
| Network Policy | `kubectl` | Network isolation | Per-release |
| RBAC Validation | `kubectl auth can-i` | Access control | Per-release |
| Resource Quota | `kubectl describe quota` | Quota enforcement | Per-release |

## Test Cases

### Conformance
- Run `sonobuoy run --mode=certified-conformance` on new clusters
- Verify all core Kubernetes APIs respond correctly

### Policy Validation
| Test | Expected | Command |
|------|----------|---------|
| Default deny network policy | No cross-namespace connectivity | `kubectl exec -n ns-a -- curl ns-b` |
| DNS allowed | Pods can resolve DNS | `kubectl exec -- nslookup kubernetes.default` |
| PSA baseline enforced | Privileged pods rejected in baseline NS | `kubectl apply -f privileged-pod.yaml` |

### RBAC Validation
| Test | Expected | Command |
|------|----------|---------|
| Viewer can list pods | Pass | `kubectl auth can-i list pods --as system:serviceaccount:aegisai-system-security:aegisai-readonly` |
| Viewer cannot delete | Fail | `kubectl auth can-i delete pods --as system:serviceaccount:aegisai-system-security:aegisai-readonly` |
| Admin can do all | Pass | `kubectl auth can-i '*' '*' --as system:serviceaccount:aegisai-system-security:aegisai-platform-admin` |

### Storage Validation
| Test | Expected |
|------|----------|
| PVC with aegisai-gp3 | Bound successfully |
| PVC with aegisai-efs | Bound successfully |
| Volume expansion | Expand PVC and verify |

## Directory

```
tests/
├── README.md
├── conformance/
│   └── run.sh                   # Conformance test runner
├── policy-validation/
│   ├── network-policies.sh      # Network policy validation
│   └── rbac-validation.sh       # RBAC validation
└── test-plan.md                 # Detailed test plan
```
