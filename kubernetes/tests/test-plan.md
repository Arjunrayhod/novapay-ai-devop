# Kubernetes Platform Test Plan

## Pre-Deployment Validation

| Check | Tool | Command |
|-------|------|---------|
| YAML syntax | `kubectl create --dry-run=client` | `kustomize build envs/dev \| kubectl apply --dry-run=client -f -` |
| Kustomize build | `kustomize` | `kustomize build envs/dev > /dev/null` |
| Terraform plan | `terraform` | `terraform plan -out=tfplan` |

## Post-Deployment Validation

### Cluster Health
```bash
kubectl get nodes -o wide
kubectl get componentstatuses
kubectl get pods -A | grep -v Running | grep -v Completed
```

### Platform Components
```bash
kubectl get pods -n aegisai-platform-ingress-nginx
kubectl get pods -n aegisai-platform-cert-manager
kubectl get pods -n aegisai-platform-metrics-server
kubectl get pods -n aegisai-platform-external-dns
kubectl get pods -n aegisai-system-monitoring
```

### Storage
```bash
kubectl get storageclass
kubectl apply -f tests/storage/test-pvc.yaml
kubectl get pvc
```

### Network Policies
```bash
kubectl get networkpolicies -A
kubectl describe networkpolicies -n aegisai-system-security aegisai-default-deny-all
```

### RBAC
```bash
kubectl auth can-i list pods \
  --as system:serviceaccount:aegisai-system-security:aegisai-readonly
kubectl auth can-i delete pods \
  --as system:serviceaccount:aegisai-system-security:aegisai-readonly
```

### Certificates
```bash
kubectl get certificates -A
kubectl get certificaterequests -A
kubectl describe clusterissuer aegisai-letsencrypt-prod
```

## Regression Tests

Run these on every platform change:

1. `kustomize build envs/dev | kubectl apply --dry-run=client -f -`
2. `kubectl get pods -A — all pods Running or Completed
3. Network policy isolation: verify cross-namespace denied
4. DNS resolution: verify pod can resolve `kubernetes.default`
5. Storage class: verify PVC binds with correct SC
6. Ingress: verify ingress-nginx responds on expected IP
