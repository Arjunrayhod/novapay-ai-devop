#!/usr/bin/env bash
# Network policy validation for AegisAI platform.
set -euo pipefail

echo "=== Network Policy Validation ==="

# Test default-deny: cross-namespace ping should fail
echo "Test 1: Cross-namespace connectivity denied (expect: FAIL)"
kubectl run -n aegisai-system-security test-ping \
  --image=busybox --rm --restart=Never \
  -- sh -c "ping -c1 -W2 aegisai-platform-ingress-nginx" 2>&1 || true

# Test DNS: pod should resolve kubernetes.default
echo "Test 2: DNS resolution (expect: PASS)"
kubectl run -n aegisai-system-security test-dns \
  --image=busybox --rm --restart=Never \
  -- nslookup kubernetes.default 2>&1

# Test ingress-nginx: service should be reachable from platform NS
echo "Test 3: Platform namespace ingress (expect: PASS)"
kubectl run -n aegisai-platform-ingress-nginx test-platform \
  --image=curlimages/curl --rm --restart=Never \
  -- curl -s -o /dev/null -w "%{http_code}" localhost:10254/metrics 2>&1

echo "=== Network policy validation complete ==="
