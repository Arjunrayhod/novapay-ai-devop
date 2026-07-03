#!/usr/bin/env bash
# RBAC validation for AegisAI platform.
set -euo pipefail

echo "=== RBAC Validation ==="

# Test: readonly can list pods (should pass)
echo "Test 1: readonly can list pods (expect: PASS)"
kubectl auth can-i list pods \
  --as system:serviceaccount:aegisai-system-security:aegisai-readonly \
  --namespace aegisai-system-security

# Test: readonly cannot delete pods (should fail)
echo "Test 2: readonly cannot delete pods (expect: FAIL)"
kubectl auth can-i delete pods \
  --as system:serviceaccount:aegisai-system-security:aegisai-readonly \
  --namespace aegisai-system-security && exit 1 || echo "  -> Correctly denied"

# Test: platform-admin can do everything (should pass)
echo "Test 3: platform-admin can delete pods (expect: PASS)"
kubectl auth can-i delete pods \
  --as system:serviceaccount:aegisai-system-security:aegisai-platform-admin \
  --namespace aegisai-system-security

# Test: platform-operator can create deployments (should pass)
echo "Test 4: platform-operator can create deployments (expect: PASS)"
kubectl auth can-i create deployments \
  --as system:serviceaccount:aegisai-system-security:aegisai-platform-operator \
  --namespace aegisai-system-security

echo "=== RBAC validation complete ==="
