# Windows 11 Development Environment Setup

## Prerequisites

| Requirement | Version | Install |
|-------------|---------|---------|
| Windows 11 | 22H2+ | — |
| PowerShell 7+ | 7.0+ | `winget install --id Microsoft.PowerShell` |
| Docker Desktop | latest | `winget install --id Docker.DockerDesktop` |
| Git for Windows | latest | `winget install --id Git.Git` |
| Winget | bundled | Pre-installed on Windows 11 |

## Quick Start

Open **PowerShell 7** as your normal user (no admin required for most tools):

```powershell
# Check current tool status (no installs)
.\scripts\setup-dev.ps1 -Check

# List required tools and versions
.\scripts\setup-dev.ps1 -List

# Full setup — installs all missing tools
.\scripts\setup-dev.ps1
```

## What Gets Installed

| Tool | Version | Install Method |
|------|---------|----------------|
| Git | system | winget |
| Docker Desktop | system | winget |
| Terraform | 1.9.5 | winget |
| kubectl | 1.30.3 | winget or direct download |
| Helm | 3.16.1 | winget |
| Kind | 0.24.0 | direct download → `~\bin\` |
| Kustomize | 5.4.3 | direct download → `~\bin\` |
| AWS CLI | 2.17.0 | winget |
| GitHub CLI | 2.55.0 | winget |
| Python | 3.12 | winget |
| pip | latest | bundled with Python |
| Ruff | latest | pip |
| MyPy | latest | pip |
| Trivy | 0.54.0 | winget |
| Checkov | latest | pip |
| Semgrep | latest | pip |
| Gitleaks | 8.18.3 | direct download → `~\bin\` |
| jq | 1.7.1 | winget |
| yq | 4.44.3 | winget |

> Tools installed to `~\bin\` are added to your User PATH automatically.

## Manual Steps (do these first)

### 1. Install Docker Desktop

```powershell
winget install --id Docker.DockerDesktop
```

After installation:
- Launch Docker Desktop from the Start Menu
- Complete the onboarding (accept WSL 2 integration)
- Verify: `docker ps`

### 2. Enable Windows Features (if not already)

```powershell
# WSL 2 (required by Docker Desktop)
wsl --install -d Ubuntu

# Enable Hyper-V and virtualization
dism.exe /online /enable-feature /featurename:Microsoft-Hyper-V-All /all /quiet
```

Then restart your computer.

## Script Modes

```powershell
# ── Check only ─────────────────────────────────
.\scripts\setup-dev.ps1 -Check

# ── Show tool manifest ─────────────────────────
.\scripts\setup-dev.ps1 -List

# ── Full setup ─────────────────────────────────
.\scripts\setup-dev.ps1
```

## Package Manager Fallback Order

The script tries install methods in this order:

1. **winget** — primary (pre-installed on Windows 11)
2. **Direct download** — for tools not on winget (Kind, Kustomize, Gitleaks)
3. **pip** — for Python packages (Ruff, MyPy, Checkov, Semgrep)

Chocolatey is **not required** but the script remains compatible if you have it.

## PATH Management

Tools downloaded directly are placed in `~\bin\`. The script adds this to your User PATH automatically. If tools aren't found after setup:

```powershell
# Refresh PATH in current session
$env:Path = [Environment]::GetEnvironmentVariable("Path","User") + ";" + [Environment]::GetEnvironmentVariable("Path","Machine")
```

Or restart your terminal.

## Troubleshooting

### "PowerShell 7+ required"

Install PowerShell 7:
```powershell
winget install --id Microsoft.PowerShell
```

Then launch **PowerShell 7** (not Windows PowerShell 5.x):
```
pwsh.exe
```

### "winget not found"

Winget is bundled with Windows 11. If missing, install the App Installer:
```
https://www.microsoft.com/p/app-installer/9nblggh4nns1
```

### "Execution Policy Error"

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

### "Docker Desktop not starting"

Ensure WSL 2 is installed and virtualization is enabled in BIOS.

## Verification

After setup, run the check to confirm everything installed:

```powershell
.\scripts\setup-dev.ps1 -Check
```

Expected output:
```
  Tool                   Status     Version
  ----                   ------     -------
  + Git                              git version 2.47.0.windows.1
  + Docker Desktop                   Docker version 27.3.1
  + Terraform                        Terraform v1.9.5
  + kubectl                          Kubernetes v1.30.3
  + Helm                             v3.16.1
  + Kind                             kind v0.24.0
  + Kustomize                        v5.4.3
  + AWS CLI                          aws-cli/2.17.0
  + GitHub CLI                       gh 2.55.0
  + Python                           Python 3.12.7
  + pip                              pip 24.3.1
  + Ruff                             ruff 0.7.0
  + MyPy                             mypy 1.13.0
  + Trivy                            trivy 0.54.0
  + Checkov                          checkov 3.2.0
  + Semgrep                          semgrep 1.92.0
  + Gitleaks                         gitleaks 8.18.3
  + jq                               jq-1.7.1
  + yq                               yq 4.44.3
```

## Files

| File | Purpose |
|------|---------|
| `scripts/setup-dev.ps1` | Windows setup script (PowerShell 7+) |
| `scripts/setup-dev.sh` | Linux/macOS setup script (bash) |
| `Makefile` | `make setup` → calls the appropriate script |
