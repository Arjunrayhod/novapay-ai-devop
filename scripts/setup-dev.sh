#!/usr/bin/env bash
set -euo pipefail

# =============================================================================
# AegisAI Enterprise Dev Environment Setup
# =============================================================================
# Installs all required tools for platform development.
# Supports: Linux (apt), macOS (brew), Windows (MINGW64/Git Bash)
#
# Usage:
#   ./scripts/setup-dev.sh            # Full setup
#   ./scripts/setup-dev.sh --check    # Check only, no installs
#   ./scripts/setup-dev.sh --list     # List tools and versions
# =============================================================================

BINDIR="${HOME}/bin"
REQUIRE_BINDIR=false

# Detect Python binary (python3 on Linux/macOS, python on Windows/MSYS2)
PYTHON=""
for candidate in python3 python; do
  if command -v "$candidate" &>/dev/null; then
    PYTHON="$candidate"
    break
  fi
done
PIP="${PYTHON} -m pip"

# Tool versions (pin for reproducibility)
TERRAFORM_VERSION="1.9.5"
KUBECTL_VERSION="1.30.3"
HELM_VERSION="3.16.1"
KIND_VERSION="0.24.0"
KUSTOMIZE_VERSION="5.4.3"
AWS_CLI_VERSION="2.17.0"
GH_CLI_VERSION="2.55.0"
YQ_VERSION="4.44.3"
JQ_VERSION="1.7.1"
TRIVY_VERSION="0.54.0"
GITLEAKS_VERSION="8.18.3"
DOCKER_COMPOSE_VERSION="2.29.0"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

pass() { printf "  ${GREEN}[PASS]${NC} %s\n" "$1"; }
fail() { printf "  ${RED}[FAIL]${NC} %s\n" "$1"; }
warn() { printf "  ${YELLOW}[WARN]${NC} %s\n" "$1"; }
info() { printf "  ${BLUE}[INFO]${NC} %s\n" "$1"; }
header() { printf "\n${BOLD}%s${NC}\n" "$1"; }

detect_os() {
  case "$(uname -s)" in
    Linux*)  echo "linux";;
    Darwin*) echo "darwin";;
    MINGW*|MSYS*|CYGWIN*) echo "windows";;
    *)       echo "unknown";;
  esac
}

detect_arch() {
  case "$(uname -m)" in
    x86_64|amd64) echo "amd64";;
    aarch64|arm64) echo "arm64";;
    *) echo "$(uname -m)";;
  esac
}

OS=$(detect_os)
ARCH=$(detect_arch)

version_ok() {
  local cmd=$1 min=$2
  local ver
  ver=$("$cmd" --version 2>/dev/null | head -1 | grep -oE '[0-9]+\.[0-9]+(\.[0-9]+)?' | head -1 || echo "0")
  if [ "$(printf '%s\n' "$min" "$ver" | sort -V | head -1)" = "$min" ]; then
    return 0
  fi
  return 1
}

is_installed() {
  command -v "$1" &>/dev/null
}

# ---------------------------------------------------------------------------
# Tool definitions: label | binary | min_version | install function
# ---------------------------------------------------------------------------
declare -A TOOLS
TOOLS=(
  [git]="git:2.30:install_git"
  [docker]="docker:24.0:install_docker"
  [docker-compose]="docker-compose:2.20:install_docker_compose"
  [terraform]="terraform:1.9:install_terraform"
  [kubectl]="kubectl:1.30:install_kubectl"
  [helm]="helm:3.16:install_helm"
  [kind]="kind:0.24:install_kind"
  [kustomize]="kustomize:5.4:install_kustomize"
  [aws]="aws:2.17:install_aws_cli"
  [gh]="gh:2.55:install_gh_cli"
  [yq]="yq:4.44:install_yq"
  [jq]="jq:1.7:install_jq"
  [pre-commit]="pre-commit:3.0:install_pre_commit"
  [python3]="python3:3.11:install_python"
  [ruff]="ruff:0.5:install_python_tools"
  [mypy]="mypy:1.10:install_python_tools"
  [trivy]="trivy:0.54:install_trivy"
  [checkov]="checkov:3.0:install_python_tools"
  [semgrep]="semgrep:1.70:install_python_tools"
  [gitleaks]="gitleaks:8.18:install_gitleaks"
)

install_git()       { install_package "git"; }
install_jq()        { install_package "jq"; }
install_python()    { :; }  # Already handled during detection

install_package() {
  local pkg=$1
  case "$OS" in
    linux)
      if is_installed apt-get; then
        sudo apt-get update -qq && sudo apt-get install -y -qq "$pkg"
      elif is_installed yum; then
        sudo yum install -y -q "$pkg"
      else
        fail "No known package manager (apt/yum)"
        return 1
      fi
      ;;
    darwin)
      if is_installed brew; then
        brew install "$pkg"
      else
        fail "Homebrew not found. Install from https://brew.sh"
        return 1
      fi
      ;;
    windows)
      if is_installed choco; then
        choco install -y "$pkg"
      elif is_installed winget; then
        winget install --id "$pkg" --silent 2>/dev/null || true
      else
        fail "No package manager (choco/winget). Install $pkg manually."
        return 1
      fi
      ;;
  esac
}

install_from_github() {
  local repo=$1 binary=$2 version=$3 tarball=$4
  local url="https://github.com/${repo}/releases/download/${binary}/${tarball}"
  info "Downloading ${repo} ${version}..."
  mkdir -p "$BINDIR"
  REQUIRE_BINDIR=true
  curl -fsSL "$url" -o "/tmp/${binary}.tgz" 2>/dev/null || { fail "Download failed for ${repo}"; return 1; }
  tar -xzf "/tmp/${binary}.tgz" -C "/tmp/" 2>/dev/null
  local found
  found=$(find /tmp -maxdepth 2 -name "${binary}*" -type f 2>/dev/null | head -1)
  if [ -n "$found" ]; then
    mv "$found" "$BINDIR/${binary}" 2>/dev/null && chmod +x "$BINDIR/${binary}"
    pass "${binary} installed"
  else
    fail "Binary not found in archive for ${repo}"
    return 1
  fi
  rm -f "/tmp/${binary}.tgz"
}

install_docker() {
  if ! is_installed docker; then
    case "$OS" in
      linux)
        warn "Docker not found. Install manually: https://docs.docker.com/engine/install/"
        return 1
        ;;
      darwin)
        warn "Docker Desktop not found. Install from: https://docs.docker.com/desktop/install/mac/"
        return 1
        ;;
      windows)
        warn "Docker Desktop not found. Install from: https://docs.docker.com/desktop/install/windows-install/"
        return 1
        ;;
    esac
  fi
}

install_docker_compose() {
  if is_installed docker && docker compose version &>/dev/null; then
    pass "docker compose v2 already available (bundled with Docker)"
    return 0
  fi
  local ver=$DOCKER_COMPOSE_VERSION
  local url="https://github.com/docker/compose/releases/download/v${ver}/docker-compose-${OS}-${ARCH}"
  mkdir -p "$BINDIR"
  REQUIRE_BINDIR=true
  info "Downloading docker-compose ${ver}..."
  curl -fsSL "$url" -o "$BINDIR/docker-compose" && chmod +x "$BINDIR/docker-compose"
}

install_terraform() {
  local ver=$TERRAFORM_VERSION
  local url="https://releases.hashicorp.com/terraform/${ver}/terraform_${ver}_${OS}_${ARCH}.zip"
  mkdir -p "$BINDIR"
  REQUIRE_BINDIR=true
  info "Downloading Terraform ${ver}..."
  curl -fsSL "$url" -o "/tmp/terraform.zip" && unzip -o -q "/tmp/terraform.zip" -d "$BINDIR" && rm "/tmp/terraform.zip"
}

install_kubectl() {
  local ver=$KUBECTL_VERSION
  mkdir -p "$BINDIR"
  REQUIRE_BINDIR=true
  info "Downloading kubectl ${ver}..."
  case "$OS" in
    linux|darwin) curl -fsSL "https://dl.k8s.io/release/v${ver}/bin/${OS}/${ARCH}/kubectl" -o "$BINDIR/kubectl" && chmod +x "$BINDIR/kubectl";;
    windows) curl -fsSL "https://dl.k8s.io/release/v${ver}/bin/windows/amd64/kubectl.exe" -o "$BINDIR/kubectl.exe";;
  esac
}

install_helm() {
  local ver=$HELM_VERSION
  info "Downloading Helm ${ver}..."
  mkdir -p "$BINDIR"
  REQUIRE_BINDIR=true
  local url="https://get.helm.sh/helm-v${ver}-${OS}-${ARCH}.tar.gz"
  curl -fsSL "$url" -o "/tmp/helm.tar.gz"
  tar -xzf "/tmp/helm.tar.gz" -C "/tmp/"
  case "$OS" in
    linux|darwin) mv "/tmp/${OS}-${ARCH}/helm" "$BINDIR/helm" && chmod +x "$BINDIR/helm";;
    windows) mv "/tmp/${OS}-${ARCH}/helm.exe" "$BINDIR/helm.exe" 2>/dev/null;;
  esac
  rm -rf "/tmp/helm.tar.gz" "/tmp/${OS}-${ARCH}"
}

install_kind() {
  local ver=$KIND_VERSION
  mkdir -p "$BINDIR"
  REQUIRE_BINDIR=true
  info "Downloading Kind ${ver}..."
  case "$OS" in
    linux|darwin) curl -fsSL "https://kind.sigs.k8s.io/dl/v${ver}/kind-${OS}-${ARCH}" -o "$BINDIR/kind" && chmod +x "$BINDIR/kind";;
    windows) curl -fsSL "https://kind.sigs.k8s.io/dl/v${ver}/kind-windows-amd64" -o "$BINDIR/kind.exe";;
  esac
}

install_kustomize() {
  local ver=$KUSTOMIZE_VERSION
  mkdir -p "$BINDIR"
  REQUIRE_BINDIR=true
  info "Downloading Kustomize ${ver}..."
  local url="https://github.com/kubernetes-sigs/kustomize/releases/download/kustomize/v${ver}/kustomize_v${ver}_${OS}_${ARCH}.tar.gz"
  curl -fsSL "$url" -o "/tmp/kustomize.tar.gz"
  tar -xzf "/tmp/kustomize.tar.gz" -C "/tmp/"
  local found
  found=$(find /tmp -maxdepth 1 -name "kustomize*" -type f 2>/dev/null | head -1)
  if [ -n "$found" ]; then
    mv "$found" "$BINDIR/kustomize" && chmod +x "$BINDIR/kustomize"
  fi
  rm -f "/tmp/kustomize.tar.gz"
}

install_aws_cli() {
  if is_installed aws && aws --version 2>&1 | grep -q "aws-cli/2"; then
    return 0
  fi
  info "Downloading AWS CLI v2..."
  mkdir -p "$BINDIR"
  REQUIRE_BINDIR=true
  case "$OS" in
    linux)
      curl -fsSL "https://awscli.amazonaws.com/awscli-exe-linux-${ARCH}.zip" -o "/tmp/awscliv2.zip"
      unzip -o -q "/tmp/awscliv2.zip" -d "/tmp/"
      sudo /tmp/aws/install --update --bin-dir "$BINDIR" 2>/dev/null || /tmp/aws/install --update --bin-dir "$BINDIR"
      rm -rf "/tmp/aws" "/tmp/awscliv2.zip"
      ;;
    darwin)
      curl -fsSL "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "/tmp/AWSCLIV2.pkg"
      sudo installer -pkg "/tmp/AWSCLIV2.pkg" -target / 2>/dev/null
      rm -f "/tmp/AWSCLIV2.pkg"
      ;;
    windows)
      curl -fsSL "https://awscli.amazonaws.com/AWSCLIV2.msi" -o "/tmp/AWSCLIV2.msi"
      msiexec /i "/tmp/AWSCLIV2.msi" /quiet /norestart 2>/dev/null || true
      rm -f "/tmp/AWSCLIV2.msi"
      ;;
  esac
}

install_gh_cli() {
  install_package "gh"
}

install_yq() {
  local ver=$YQ_VERSION
  mkdir -p "$BINDIR"
  REQUIRE_BINDIR=true
  info "Downloading yq ${ver}..."
  case "$OS" in
    linux|darwin) curl -fsSL "https://github.com/mikefarah/yq/releases/download/v${ver}/yq_${OS}_${ARCH}" -o "$BINDIR/yq" && chmod +x "$BINDIR/yq";;
    windows) curl -fsSL "https://github.com/mikefarah/yq/releases/download/v${ver}/yq_windows_amd64.exe" -o "$BINDIR/yq.exe";;
  esac
}

install_pre_commit() {
  $PYTHON -m pip install --user --quiet pre-commit 2>/dev/null || pip install --user --quiet pre-commit
}

install_python_tools() {
  local tools=()
  ! is_installed ruff && tools+=(ruff)
  ! is_installed mypy && tools+=(mypy)
  ! is_installed checkov && tools+=(checkov)
  ! is_installed semgrep && tools+=(semgrep)
  if [ ${#tools[@]} -gt 0 ]; then
    info "Installing Python tools: ${tools[*]}..."
    $PYTHON -m pip install --user --quiet "${tools[@]}" 2>/dev/null || pip install --user --quiet "${tools[@]}"
  fi
}

install_trivy() {
  local ver=$TRIVY_VERSION
  mkdir -p "$BINDIR"
  REQUIRE_BINDIR=true
  info "Downloading Trivy ${ver}..."
  case "$OS" in
    linux|darwin)
      curl -fsSL "https://github.com/aquasecurity/trivy/releases/download/v${ver}/trivy_${ver}_${OS}-${ARCH}.tar.gz" -o "/tmp/trivy.tar.gz"
      tar -xzf "/tmp/trivy.tar.gz" -C "/tmp/" trivy 2>/dev/null && mv "/tmp/trivy" "$BINDIR/trivy" && chmod +x "$BINDIR/trivy"
      rm -f "/tmp/trivy.tar.gz"
      ;;
    windows)
      curl -fsSL "https://github.com/aquasecurity/trivy/releases/download/v${ver}/trivy_${ver}_windows-amd64.zip" -o "/tmp/trivy.zip"
      unzip -o -q "/tmp/trivy.zip" -d "/tmp/" && mv "/tmp/trivy.exe" "$BINDIR/trivy.exe" 2>/dev/null || true
      rm -f "/tmp/trivy.zip"
      ;;
  esac
}

install_gitleaks() {
  local ver=$GITLEAKS_VERSION
  mkdir -p "$BINDIR"
  REQUIRE_BINDIR=true
  info "Downloading Gitleaks ${ver}..."
  case "$OS" in
    linux|darwin)
      curl -fsSL "https://github.com/gitleaks/gitleaks/releases/download/v${ver}/gitleaks_${ver}_${OS}_${ARCH}.tar.gz" -o "/tmp/gitleaks.tar.gz"
      tar -xzf "/tmp/gitleaks.tar.gz" -C "/tmp/" gitleaks 2>/dev/null && mv "/tmp/gitleaks" "$BINDIR/gitleaks" && chmod +x "$BINDIR/gitleaks"
      rm -f "/tmp/gitleaks.tar.gz"
      ;;
    windows)
      curl -fsSL "https://github.com/gitleaks/gitleaks/releases/download/v${ver}/gitleaks_${ver}_windows_amd64.zip" -o "/tmp/gitleaks.zip"
      unzip -o -q "/tmp/gitleaks.zip" -d "/tmp/" && mv "/tmp/gitleaks.exe" "$BINDIR/gitleaks.exe" 2>/dev/null || true
      rm -f "/tmp/gitleaks.zip"
      ;;
  esac
}

# ---------------------------------------------------------------------------
# Tool table
# ---------------------------------------------------------------------------
TOOL_INFO=(
  "Git:git:2.30"
  "Docker:docker:24.0"
  "Docker Compose:docker-compose:2.20"
  "Terraform:terraform:1.9"
  "kubectl:kubectl:1.30"
  "Helm:helm:3.16"
  "Kind:kind:0.24"
  "Kustomize:kustomize:5.4"
  "AWS CLI:aws:2.17"
  "GitHub CLI:gh:2.55"
  "yq:yq:4.44"
  "jq:jq:1.7"
  "pre-commit:pre-commit:3.0"
  "Python 3:python3:3.11"
  "Ruff:ruff:0.5"
  "MyPy:mypy:1.10"
  "Trivy:trivy:0.54"
  "Checkov:checkov:3.0"
  "Semgrep:semgrep:1.70"
  "Gitleaks:gitleaks:8.18"
)

check_tools() {
  header "Tool Status"
  printf "  %-22s %-10s %s\n" "Tool" "Status" "Version"
  printf "  %-22s %-10s %s\n" "----" "------" "-------"
  for entry in "${TOOL_INFO[@]}"; do
    IFS=':' read -r label binary minver <<< "$entry"
    # For Python, check both python3 and python
    if [ "$binary" = "python3" ]; then
      is_installed python3 || binary="python"
    fi
    if is_installed "$binary"; then
      local ver
      ver=$("$binary" --version 2>/dev/null | head -1 | tr -d '\n' | cut -c1-60)
      if version_ok "$binary" "$minver"; then
        pass "$label"
      else
        warn "$label (version < $minver)"
      fi
      printf "  %-22s %-10s %s\n" "" "" "$ver"
    else
      fail "$label"
    fi
  done
}

list_tools() {
  header "Required Tools & Versions"
  for entry in "${TOOL_INFO[@]}"; do
    IFS=':' read -r label binary minver <<< "$entry"
    printf "  %-22s %s+\n" "$label" ">= $minver"
  done
  echo ""
  info "Script: ${0}"
  info "Detected OS: ${OS} (${ARCH})"
}

print_path_warning() {
  if [ "$REQUIRE_BINDIR" = true ]; then
    echo ""
    warn "============================================"
    warn " Tools installed to: ${BINDIR}"
    warn " Make sure this directory is in your PATH:"
    warn "   export PATH=\"\$HOME/bin:\$PATH\""
    warn "============================================"
  fi
}

precommit_setup() {
  if is_installed pre-commit; then
    info "Installing pre-commit hooks..."
    pre-commit install --install-hooks 2>/dev/null || warn "pre-commit install failed (run manually)"
  fi
}

# ===========================================================================
# Main
# ===========================================================================
case "${1:-}" in
  --check|-c)
    check_tools
    print_path_warning
    exit 0
    ;;
  --list|-l)
    list_tools
    exit 0
    ;;
  --help|-h)
    echo "Usage: $0 [--check|--list|--help]"
    echo ""
    echo "  (no args)  Install all missing tools"
    echo "  --check    Check tool status only"
    echo "  --list     List required tools and versions"
    echo "  --help     Show this help"
    exit 0
    ;;
esac

echo ""
echo "========================================================"
echo " AegisAI Enterprise Dev Environment Setup"
echo "========================================================"
echo " OS     : ${OS} (${ARCH})"
echo " Target : ${HOME}/bin/"
echo ""

# Check existing tools first
header "Pre-flight Check"
for entry in "${TOOL_INFO[@]}"; do
  IFS=':' read -r label binary minver <<< "$entry"
  # For Python, check both python3 and python
  if [ "$binary" = "python3" ] && ! is_installed python3; then
    binary="python"
  fi
  if is_installed "$binary"; then
    if version_ok "$binary" "$minver"; then
      pass "$label"
    else
      warn "$label (upgrade recommended)"
    fi
  else
    info "$label (will install)"
  fi
done

echo ""
header "Installation"

# Phase 1: System packages
for tool in git jq; do
  if ! is_installed "$tool"; then
    install_package "$tool" 2>/dev/null || warn "Could not install $tool via package manager (install manually)"
  else
    pass "$tool"
  fi
done

# Phase 2: Docker
if ! is_installed docker; then
  warn "Docker not found. Please install Docker Desktop manually."
else
  pass "Docker"
  if ! docker compose version &>/dev/null; then
    install_docker_compose
  else
    pass "Docker Compose (bundled)"
  fi
fi

# Phase 3: Binary downloads
install_terraform
install_kubectl
install_helm
install_kind
install_kustomize
install_yq
install_trivy
install_gitleaks

# Phase 4: AWS CLI
install_aws_cli

# Phase 5: Package manager tools
install_gh_cli

# Phase 6: Python tools
install_pre_commit
install_python_tools

# Phase 7: pre-commit hooks
precommit_setup

echo ""
header "Final Status"
check_tools
print_path_warning

echo ""
info "Dev environment setup complete!"
echo ""
printf "  ${YELLOW}Next steps:${NC}\n"
echo "   1. Restart your terminal or run: source ~/.bashrc"
echo "   2. Verify docker is running: docker ps"
echo "   3. Start the lab: make lab-up"
echo "   4. Run validation: make lab-validate"
echo ""
