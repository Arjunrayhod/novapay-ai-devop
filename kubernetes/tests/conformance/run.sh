#!/usr/bin/env bash
# Sonobuoy conformance test runner for AegisAI EKS clusters.
# https://sonobuoy.io/
set -euo pipefail

CLUSTER_NAME="${1:-aegisai}"
CONTEXT="${2:-}"

echo "=== AegisAI Conformance Test Suite ==="
echo "Cluster: ${CLUSTER_NAME}"

# Check sonobuoy installed
if ! command -v sonobuoy &> /dev/null; then
  echo "ERROR: sonobuoy not found. Install from https://sonobuoy.io/"
  exit 1
fi

# Run conformance tests
echo "Running sonobuoy conformance tests..."
sonobuoy run --mode=certified-conformance --wait

# Get results
echo "Retrieving results..."
RESULTS_DIR=$(sonobuoy retrieve)
sonobuoy results "${RESULTS_DIR}"

# Cleanup
sonobuoy delete --wait

echo "=== Conformance tests complete ==="
