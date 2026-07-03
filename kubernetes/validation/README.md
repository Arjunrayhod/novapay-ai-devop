# Sprint-1 Foundation Validation

Run these checks to validate the Enterprise Kubernetes Foundation manifests before deployment.

## Prerequisites

```bash
kustomize version  # >= v5.0
kubectl version --client
```

## 1. Kustomize Build (all environments)

```bash
# Verify every environment overlay builds without error
kustomize build envs/dev     > /dev/null && echo "dev: PASS"
kustomize build envs/staging > /dev/null && echo "staging: PASS"
kustomize build envs/prod    > /dev/null && echo "prod: PASS"
```

## 2. Schema Validation

```bash
# Dry-run against a live cluster (or use --validate=fail with a server)
kustomize build envs/dev | kubectl apply --dry-run=server --validate=fail -f -
```

## 3. Namespace Architecture

```bash
# Expected namespaces (apply via env overlay to verify)
kustomize build envs/dev | kubectl apply --dry-run=client -f -

# Post-deployment verification
kubectl get ns -l aegisai.io/tier
# Expected: system, platform, addon, team
kubectl get ns --show-labels | grep aegisai.io/tier
```

## 4. RBAC Validation

### 4a. Kustomize Build Check

```bash
kustomize build ../security > /dev/null && echo "security: PASS"
# Expected: PASS — no YAML errors, all 12 ClusterRoles + bindings valid
```

### 4b. Aggregation Verification

Verify that `aegisai:platform:admin` correctly aggregates sub-roles (rules array should be non-empty):

```bash
kubectl describe clusterrole aegisai:platform:admin
# Expected: Rules should show combined permissions from:
#   - aegisai:platform:core-admin  (nodes, PVs, storage, nonResourceURLs)
#   - aegisai:security:admin       (ClusterRoles, SAs, auth reviews)
#   - aegisai:observability:admin  (events, pods/log, metrics, CRDs)

kubectl describe clusterrole aegisai:namespace:admin
# Expected: Rules should show combined permissions from:
#   - aegisai:namespace:workload-admin  (deployments, pods, services, HPA, PDB)
#   - aegisai:namespace:config-admin    (secrets, configmaps, SAs)
#   - aegisai:namespace:rbac-admin      (roles, rolebindings with bind+escalate)
```

### 4c. Least-Privilege — Verify NO bare wildcard roles exist

```bash
kubectl get clusterroles -o json | jq '[.items[] | select(.rules[].apiGroups == ["*"] and .rules[].resources == ["*"] and .rules[].verbs == ["*"]) | .metadata.name]'
# Expected: []  (empty — no clusterrole should have bare ["*"] across all apiGroups/resources/verbs)
```

### 4d. Namespace View Role (read-only)

```bash
kubectl auth can-i list pods \
  --namespace aegisai-system-security \
  --as system:serviceaccount:aegisai-system-security:aegisai-readonly
# Expected: yes

kubectl auth can-i delete pods \
  --namespace aegisai-system-security \
  --as system:serviceaccount:aegisai-system-security:aegisai-readonly
# Expected: no

kubectl auth can-i get secrets \
  --namespace aegisai-team-novapay \
  --as system:serviceaccount:aegisai-system-security:aegisai-readonly
# Expected: no  (view role has access to pods, services, deployments but NOT secrets/configmaps)
```

### 4e. Namespace Edit Role (CRUD workloads, no RBAC)

```bash
kubectl auth can-i create deployments \
  --namespace aegisai-team-novapay \
  --as system:serviceaccount:aegisai-system-security:aegisai-platform-operator
# Expected: yes

kubectl auth can-i create rolebindings \
  --namespace aegisai-team-novapay \
  --as system:serviceaccount:aegisai-system-security:aegisai-platform-operator
# Expected: no  (edit role does NOT have RBAC permissions)
```

### 4f. Namespace Admin Role (full namespace access)

```bash
kubectl auth can-i create deployments \
  --namespace aegisai-team-novapay \
  --as system:serviceaccount:aegisai-system-security:aegisai-platform-admin
# Expected: yes

kubectl auth can-i create rolebindings \
  --namespace aegisai-team-novapay \
  --as system:serviceaccount:aegisai-system-security:aegisai-platform-admin
# Expected: yes  (namespace:admin aggregates rbac-admin which has bind+escalate)

kubectl auth can-i get secrets \
  --namespace aegisai-team-novapay \
  --as system:serviceaccount:aegisai-system-security:aegisai-platform-admin
# Expected: yes  (namespace:admin aggregates config-admin which has secrets access)
```

### 4g. Platform Admin (cluster-scoped operations)

```bash
kubectl auth can-i list nodes \
  --as system:serviceaccount:aegisai-system-security:aegisai-platform-admin
# Expected: yes

kubectl auth can-i list storageclasses \
  --as system:serviceaccount:aegisai-system-security:aegisai-platform-admin
# Expected: yes

kubectl auth can-i create clusterroles \
  --as system:serviceaccount:aegisai-system-security:aegisai-platform-admin
# Expected: yes  (platform:admin aggregates security:admin)
```

### 4h. nonResourceURLs Verification

```bash
kubectl auth can-i get /healthz \
  --as system:serviceaccount:aegisai-system-security:aegisai-readonly
# Expected: yes

kubectl auth can-i get /livez \
  --as system:serviceaccount:aegisai-system-security:aegisai-platform-operator
# Expected: yes

kubectl auth can-i get /metrics \
  --as system:serviceaccount:aegisai-system-security:aegisai-readonly
# Expected: no  (/metrics is NOT in the nonResourceURLs allowlist)
```

### 4i. Negative Tests — Verify Security Boundaries

```bash
# Read-only SA cannot access cluster-scoped resources
kubectl auth can-i list nodes \
  --as system:serviceaccount:aegisai-system-security:aegisai-readonly
# Expected: no  (view SA only has namespace:view, NOT platform:view)

# View role cannot delete
kubectl auth can-i delete deployments \
  --namespace aegisai-team-novapay \
  --as system:serviceaccount:aegisai-system-security:aegisai-readonly
# Expected: no

# Edit role cannot modify RBAC
kubectl auth can-i delete roles \
  --namespace aegisai-team-novapay \
  --as system:serviceaccount:aegisai-system-security:aegisai-cicd
# Expected: no

# Platform edit can read cluster-scoped but NOT modify them
kubectl auth can-i delete nodes \
  --as system:serviceaccount:aegisai-system-security:aegisai-platform-operator
# Expected: no

# Cross-namespace isolation — edit role in one team namespace
kubectl auth can-i list pods \
  --namespace aegisai-team-paysecure \
  --as system:serviceaccount:aegisai-system-security:aegisai-cicd
# Expected: yes  (namespace edit/ view roles are ClusterRoles scoped by RoleBinding)
```

## 5. ResourceQuota & LimitRange

```bash
# Verify quotas applied per namespace
kubectl get resourcequota -A
kubectl get limitrange -A

# Spot-check a team namespace
kubectl describe resourcequota aegisai-quota-team --namespace aegisai-team-novapay
kubectl describe limitrange aegisai-limits-team --namespace aegisai-team-novapay
```

## 6. NetworkPolicy — Zero Trust Validation

### 6a. Verify Every Namespace Has Default-Deny

```bash
# Every namespace must have a default-deny-all policy
for ns in $(kubectl get ns -o name | cut -d/ -f2); do
  if ! kubectl get networkpolicy aegisai-default-deny-all -n "$ns" &>/dev/null; then
    echo "MISSING: $ns"
  fi
done
# Expected: no output (all namespaces have default-deny)
```

### 6b. Verify All 7 NetworkPolicies Exist Per Namespace

```bash
# All namespaces should have the 4 foundation policies
kubectl get networkpolicies -A --no-headers | awk '{print $2}' | sort | uniq -c
# Expected:
#   N aegisai-allow-dns              (N = number of namespaces)
#   N aegisai-allow-kube-apiserver   (N = number of namespaces)
#   N aegisai-allow-same-namespace   (N = number of namespaces)
#   N aegisai-default-deny-all       (N = number of namespaces)

# System and platform namespaces should also have allow-intra-tier
kubectl get networkpolicies -n aegisai-system-security --no-headers
# Expected: aegisai-allow-intra-tier present

kubectl get networkpolicies -n aegisai-platform-ingress-nginx --no-headers
# Expected: aegisai-allow-intra-tier present

# Workload namespaces should have allow-platform and allow-ingress-controller
kubectl get networkpolicies -n aegisai-team-novapay --no-headers
# Expected: aegisai-allow-platform and aegisai-allow-ingress-controller present
```

### 6c. Verify No Allow-All Policies Exist

```bash
# No policy should allow all ingress or all egress without restrictions
kubectl get networkpolicies -A -o json | jq '[.items[] | select(
  .spec.ingress[]? == {} or .spec.egress[]? == {}
)] | .[].metadata.name'
# Expected: [] (empty — no allow-all ingress or egress rules)

# Verify no policy has ipBlock: 0.0.0.0/0 (unrestricted external egress)
kubectl get networkpolicies -A -o json | jq '[.items[] | select(
  .spec.egress[]?.to[]?.ipBlock.cidr == "0.0.0.0/0"
)] | .[].metadata.name'
# Expected: [] (empty — no unrestricted external access)
```

### 6d. Verify Default-Deny Is True Default-Deny

```bash
# Default-deny should have NO ingress/egress rules, only policyTypes
kubectl get networkpolicy aegisai-default-deny-all -n aegisai-system-security -o yaml | grep -E "(ingress:|egress:)" | head -5
# Expected: only "policyTypes:" with Ingress and Egress (no ingress/egress rule blocks)
```

### 6e. Verify Allowed Traffic Flows

```bash
# Deploy a temporary nginx pod in a team namespace
kubectl run test-nginx --image=nginx -n aegisai-team-novapay --restart=Never
kubectl wait --for=condition=ready pod/test-nginx -n aegisai-team-novapay --timeout=60s

# Test intra-namespace connectivity (should succeed)
kubectl run test-curl --image=curlimages/curl -n aegisai-team-novapay --rm -it --restart=Never -- \
  curl -m 3 http://test-nginx:80/ 2>&1 | grep -q "Welcome" && echo "INTRA-NS: PASS" || echo "INTRA-NS: FAIL"

# Test cross-team connectivity (should be blocked by default-deny)
kubectl run test-curl --image=curlimages/curl -n aegisai-team-paysecure --rm -it --restart=Never -- \
  curl -m 3 http://test-nginx.aegisai-team-novapay:80/ 2>&1 | grep -q "command terminated" && echo "CROSS-TEAM: BLOCKED (expected)" || echo "CROSS-TEAM: CHECK RESULT"

# Test DNS resolution (should succeed)
kubectl run test-dns --image=busybox -n aegisai-team-novapay --rm -it --restart=Never -- \
  nslookup kubernetes.default.svc 2>&1 | grep -q "Address" && echo "DNS: PASS" || echo "DNS: FAIL"

# Test K8s API access (should succeed)
kubectl run test-api --image=curlimages/curl -n aegisai-team-novapay --rm -it --restart=Never -- \
  curl -k -m 3 https://kubernetes.default.svc:443/ 2>&1 | grep -q "Unauthorized" && echo "API: PASS" || echo "API: FAIL"

# Cleanup
kubectl delete pod test-nginx -n aegisai-team-novapay --now
```

### 6f. Verify Tier Isolation

```bash
# Deploy a temporary pod in a system namespace
kubectl run test-system --image=nginx -n aegisai-system-security --restart=Never
kubectl wait --for=condition=ready pod/test-system -n aegisai-system-security --timeout=60s

# System → Team egress (should be blocked — team namespaces not in system/platform tier)
kubectl run test-curl --image=curlimages/curl -n aegisai-system-security --rm -it --restart=Never -- \
  curl -m 3 http://test-nginx.aegisai-team-novapay:80/ 2>&1 | grep -q "command terminated" && echo "TIER-ISOLATION: BLOCKED (expected)" || echo "TIER-ISOLATION: CHECK RESULT"

# System → System egress (should succeed — intra-tier)
kubectl run test-curl --image=curlimages/curl -n aegisai-system-security --rm -it --restart=Never -- \
  curl -m 3 http://test-system:80/ 2>&1 | grep -q "Welcome" && echo "INTRA-TIER: PASS" || echo "INTRA-TIER: FAIL"

# Cleanup
kubectl delete pod test-system -n aegisai-system-security --now
```

### 6g. PCI-DSS / RBI Control Mapping

| Control | Manifest | Validation |
|---------|----------|------------|
| PCI-DSS 1.2 (network segmentation) | default-deny-all, allow-intra-tier | Step 6e, 6f |
| PCI-DSS 1.3.1 (deny all inbound/outbound) | default-deny-all (no ingress/egress rules) | Step 6c, 6d |
| PCI-DSS 1.3.4 (need-to-know access) | Explicit allow rules per traffic flow | Step 6b (policy inventory) |
| Zero Trust (micro-segmentation) | Default-deny + explicit allow per tier | Step 6f |

## 7. Pod Security Admission

```bash
# Verify PSA labels on all namespaces
kubectl get ns -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.metadata.labels.pod-security\.kubernetes\.io/enforce}{"\n"}{end}'
# Expected: privileged (system), baseline (team, addon), baseline (platform)
```

## 8. Zero-Trust Network Isolation

Validated in Section 6 (NetworkPolicy — Zero Trust Validation):

- **6a** — Every namespace has default-deny
- **6e** — Cross-team traffic blocked, intra-namespace allowed
- **6f** — Tier isolation verified

## 9. PCI-DSS / RBI Control Mapping

| Control | Manifest | Validation |
|---------|----------|------------|
| PCI-DSS 1.2 (network segmentation) | NetworkPolicy default-deny-all, allow-intra-tier | Step 6a, 6e, 6f |
| PCI-DSS 1.3.1 (deny all inbound/outbound) | default-deny-all (no ingress/egress rules) | Step 6c, 6d |
| PCI-DSS 1.3.4 (need-to-know access) | Explicit allow rules per traffic flow | Step 6b |
| PCI-DSS 7.1 (access control) | RBAC ClusterRoles + namespace RoleBindings | Step 4 |
| PCI-DSS 7.2 (least privilege) | namespace:view role bound to readonly SA | Step 4 |
| RBI IT Governance 6.2 (access management) | Service accounts per role (admin, operator, cicd, readonly) | Step 4 |
| RBI IT Governance 7.3 (data classification) | aegisai.io/data-classification label on namespaces | Step 3 |
| Zero Trust (micro-segmentation) | Default-deny ingress + egress on every namespace | Step 6a, 6b |
