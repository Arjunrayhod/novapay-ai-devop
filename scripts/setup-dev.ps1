#!/usr/bin/env pwsh
<#
.SYNOPSIS
    AegisAI Enterprise Dev Environment Setup for Windows 11.
.DESCRIPTION
    Detects and installs all required development tools.
    Uses winget as primary installer, with direct-download fallback.
    Never reinstalls existing tools.
.PARAMETER Check
    Only check tool status, do not install anything.
.PARAMETER List
    Show required tools and minimum versions.
.PARAMETER Help
    Show this help message.
.EXAMPLE
    .\scripts\setup-dev.ps1              # Full setup
    .\scripts\setup-dev.ps1 -Check       # Check only
    .\scripts\setup-dev.ps1 -List        # Show tool manifest
#>

#Requires -Version 7.0

param(
    [switch]$Check,
    [switch]$List,
    [switch]$Help
)

# ──────────────────────────────────────────────────────────────────────────────
# Configuration
# ──────────────────────────────────────────────────────────────────────────────
$Script:BinDir = Join-Path $env:USERPROFILE "bin"
$Script:DownloadDir = Join-Path $env:TEMP "aegisai-setup"
$Script:ReportPath = Join-Path $env:USERPROFILE ".aegisai-setup-report.json"

# Pinned tool versions
$Script:Versions = @{
    terraform   = "1.9.5"
    kubectl     = "1.30.3"
    helm        = "3.16.1"
    kind        = "0.24.0"
    kustomize   = "5.8.1"
    awscli      = "2.17.0"
    ghcli       = "2.55.0"
    yq          = "4.44.3"
    jq          = "1.7.1"
    trivy       = "0.54.0"
    gitleaks    = "8.18.3"
}

# ──────────────────────────────────────────────────────────────────────────────
# Colour output
# ──────────────────────────────────────────────────────────────────────────────
$Script:P = @{
    pass  = @{Fg = "Green"}
    fail  = @{Fg = "Red"}
    warn  = @{Fg = "Yellow"}
    info  = @{Fg = "Cyan"}
    head  = @{Fg = "White"; Bg = "DarkBlue"}
}

function Write-Status($Symbol, $Text, $Color) {
    $f = if ($Color) { @{ForegroundColor = $Color} } else { @{} }
    Write-Host "  $Symbol " -NoNewline -ForegroundColor $Color
    Write-Host $Text
}

function Pass  ($Text) { Write-Status "+" $Text Green }
function Fail  ($Text) { Write-Status "x" $Text Red }
function Warn  ($Text) { Write-Status "!" $Text Yellow }
function Info  ($Text) { Write-Status ">" $Text Cyan }
function Header($Text) { Write-Host "`n$Text`n" -ForegroundColor White -BackgroundColor DarkBlue }

# ──────────────────────────────────────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────────────────────────────────────
function Test-Administrator {
    $id = [Security.Principal.WindowsIdentity]::GetCurrent()
    $p  = [Security.Principal.WindowsPrincipal]($id)
    return $p.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Ensure-Directory($Path) {
    if (-not (Test-Path $Path)) { New-Item -ItemType Directory -Path $Path -Force | Out-Null }
}

function Get-ToolVersion($Binary, $VersionArgs) {
    try {
        if (-not $VersionArgs) { $VersionArgs = @("--version") }
        $raw = & $Binary @VersionArgs 2>&1
        $text = $raw -join "`n"
        # JSON output (e.g. kubectl version --client --output=json)
        if ($text.TrimStart().StartsWith("{")) {
            try { $json = $text | ConvertFrom-Json } catch { $json = $null }
            if ($json -and $json.clientVersion.gitVersion) {
                if ($json.clientVersion.gitVersion -match 'v?(\d+\.\d+\.\d+)') { return $Matches[1] }
            }
        }
        # Plain text — extract first semver
        $line = $raw -join " " | Select-Object -First 1
        if ($line -match '(\d+\.\d+\.\d+)') { return $Matches[1] }
        if ($line -match '(\d+\.\d+)')      { return $Matches[1] }
        return $line.Trim()
    } catch { return $null }
}

function Test-VersionMinimum($Current, $Minimum) {
    if (-not $Current -or -not $Minimum) { return $false }
    try {
        $c = [Version]($Current -replace '-.*', '')
        $m = [Version]($Minimum -replace '-.*', '')
        return $c -ge $m
    } catch { return $false }
}

function Add-ToPath {
    param([string]$Path)
    $current = [Environment]::GetEnvironmentVariable("PATH", "User")
    if ($current -split ";" -notcontains $Path) {
        $new = "$current;$Path"
        [Environment]::SetEnvironmentVariable("PATH", $new, "User")
        $env:PATH = "$env:PATH;$Path"
    }
}

# ──────────────────────────────────────────────────────────────────────────────
# Winget helpers
# ──────────────────────────────────────────────────────────────────────────────
function Test-WingetAvailable {
    return (Get-Command "winget" -ErrorAction SilentlyContinue) -ne $null
}

function Install-ViaWinget($PackageId, $ToolName) {
    if (-not (Test-WingetAvailable)) { return $false }
    Write-Host "  > Installing $ToolName via winget (${PackageId})..."
    $result = & winget install --id $PackageId --silent --accept-package-agreements --accept-source-agreements 2>&1
    $exitCode = $LASTEXITCODE
    if ($exitCode -eq 0) {
        Pass "$ToolName installed via winget"
        return $true
    } elseif ($exitCode -eq -1978335189) { # already installed
        Pass "$ToolName already installed"
        return $true
    } else {
        Warn "winget install for $ToolName exited $exitCode"
        return $false
    }
}

# ──────────────────────────────────────────────────────────────────────────────
# Tool definitions
# ──────────────────────────────────────────────────────────────────────────────
# Each entry: Name, BinaryName, MinVersion, WingetId, InstallScript, VersionArgs
$Script:Tools = @(
    @{Name="Git";             Binary="git";             Min="2.30.0";  Winget="Git.Git";                          Script=$null; VersionArgs=$null}
    @{Name="Docker Desktop";  Binary="docker";          Min="24.0.0";  Winget="Docker.DockerDesktop";            Script=$null; VersionArgs=$null}
    @{Name="Terraform";       Binary="terraform";       Min="1.9.0";   Winget="Hashicorp.Terraform";             Script={ Install-Terraform }; VersionArgs=$null}
    @{Name="kubectl";         Binary="kubectl";         Min="1.30.0";  Winget=$null;                              Script={ Install-Kubectl }; VersionArgs=@("version","--client","--output=json")}
    @{Name="Helm";            Binary="helm";            Min="3.16.0";  Winget="Helm.Helm";                       Script={ Install-Helm }; VersionArgs=@("version")}
    @{Name="Kind";            Binary="kind";            Min="0.24.0";  Winget=$null;                              Script={ Install-Kind }; VersionArgs=$null}
    @{Name="Kustomize";       Binary="kustomize";       Min="5.4.0";   Winget=$null;                              Script={ Install-Kustomize }; VersionArgs=@("version")}
    @{Name="AWS CLI";         Binary="aws";             Min="2.17.0";  Winget="Amazon.AWSCLI";                    Script={ Install-AwsCli }; VersionArgs=$null}
    @{Name="GitHub CLI";      Binary="gh";              Min="2.55.0";  Winget="GitHub.cli";                       Script={ Install-GitHubCli }; VersionArgs=$null}
    @{Name="Python";          Binary="python";          Min="3.11.0";  Winget="Python.Python.3.12";              Script=$null; VersionArgs=$null}
    @{Name="pip";             Binary="pip";             Min="23.0.0";  Winget=$null;                              Script={ Install-Pip }; VersionArgs=$null}
    @{Name="Ruff";            Binary="ruff";            Min="0.5.0";   Winget=$null;                              Script={ Install-PythonPackage "ruff" }; VersionArgs=$null}
    @{Name="MyPy";            Binary="mypy";            Min="1.10.0";  Winget=$null;                              Script={ Install-PythonPackage "mypy" }; VersionArgs=$null}
    @{Name="Trivy";           Binary="trivy";           Min="0.54.0";  Winget="AquaSecurity.Trivy";              Script={ Install-Trivy }; VersionArgs=$null}
    @{Name="Checkov";         Binary="checkov";         Min="3.0.0";   Winget=$null;                              Script={ Install-PythonPackage "checkov" }; VersionArgs=$null}
    @{Name="Semgrep";         Binary="semgrep";         Min="1.70.0";  Winget=$null;                              Script={ Install-PythonPackage "semgrep" }; VersionArgs=$null}
    @{Name="Gitleaks";        Binary="gitleaks";        Min="8.18.0";  Winget=$null;                              Script={ Install-Gitleaks }; VersionArgs=$null}
    @{Name="jq";              Binary="jq";              Min="1.7.0";   Winget="jqlang.jq";                        Script={ Install-Jq }; VersionArgs=$null}
    @{Name="yq";              Binary="yq";              Min="4.44.0";  Winget="mikefarah.yq";                     Script={ Install-Yq }; VersionArgs=$null}
)

# ──────────────────────────────────────────────────────────────────────────────
# Custom installers (tools not in winget or needing special handling)
# ──────────────────────────────────────────────────────────────────────────────
function Install-Kubectl {
    $ver = $Script:Versions.kubectl
    $url = "https://dl.k8s.io/release/v${ver}/bin/windows/amd64/kubectl.exe"
    $dest = Join-Path $Script:BinDir "kubectl.exe"
    Ensure-Directory $Script:BinDir
    Info "Downloading kubectl v${ver}..."
    Invoke-WebRequest -Uri $url -OutFile $dest -UseBasicParsing
    if (Test-Path $dest) { Pass "kubectl installed to $dest" } else { Fail "kubectl download failed" }
}

function Install-Kind {
    $ver = $Script:Versions.kind
    $url = "https://kind.sigs.k8s.io/dl/v${ver}/kind-windows-amd64"
    $dest = Join-Path $Script:BinDir "kind.exe"
    Ensure-Directory $Script:BinDir
    Info "Downloading Kind v${ver}..."
    Invoke-WebRequest -Uri $url -OutFile $dest -UseBasicParsing
    if (Test-Path $dest) { Pass "kind installed to $dest" } else { Fail "kind download failed" }
}

function Install-Kustomize {
    $ver = $Script:Versions.kustomize
    $url = "https://github.com/kubernetes-sigs/kustomize/releases/download/kustomize/v${ver}/kustomize_v${ver}_windows_amd64.zip"
    $archive = Join-Path $Script:DownloadDir "kustomize.zip"
    Ensure-Directory $Script:DownloadDir
    Ensure-Directory $Script:BinDir
    Info "Downloading Kustomize v${ver}..."
    Invoke-WebRequest -Uri $url -OutFile $archive -UseBasicParsing
    $extractDir = Join-Path $Script:DownloadDir "kustomize-extract"
    Ensure-Directory $extractDir
    Expand-Archive -Path $archive -DestinationPath $extractDir -Force
    $exe = Get-ChildItem $extractDir -Recurse -Filter "kustomize.exe" | Select-Object -First 1
    if ($exe) {
        Move-Item $exe.FullName (Join-Path $Script:BinDir "kustomize.exe") -Force
        Remove-Item $extractDir -Recurse -Force -ErrorAction SilentlyContinue
        Remove-Item $archive -Force -ErrorAction SilentlyContinue
        Pass "kustomize installed"
    } else {
        # Try without .exe extension (some releases have just "kustomize")
        $exe2 = Get-ChildItem $extractDir -Recurse -Filter "kustomize" | Select-Object -First 1
        if ($exe2) {
            Move-Item $exe2.FullName (Join-Path $Script:BinDir "kustomize.exe") -Force
            Pass "kustomize installed"
        } else {
            Fail "kustomize binary not found in archive"
        }
    }
}

function Install-Gitleaks {
    $ver = $Script:Versions.gitleaks
    $url = "https://github.com/gitleaks/gitleaks/releases/download/v${ver}/gitleaks_${ver}_windows_amd64.zip"
    $archive = Join-Path $Script:DownloadDir "gitleaks.zip"
    Ensure-Directory $Script:DownloadDir
    Ensure-Directory $Script:BinDir
    Info "Downloading Gitleaks v${ver}..."
    Invoke-WebRequest -Uri $url -OutFile $archive -UseBasicParsing
    $extractDir = Join-Path $Script:DownloadDir "gitleaks-extract"
    Ensure-Directory $extractDir
    Expand-Archive -Path $archive -DestinationPath $extractDir -Force
    $exe = Get-ChildItem $extractDir -Recurse -Filter "gitleaks.exe" | Select-Object -First 1
    if ($exe) {
        Move-Item $exe.FullName (Join-Path $Script:BinDir "gitleaks.exe") -Force
        Remove-Item $extractDir -Recurse -Force -ErrorAction SilentlyContinue
        Remove-Item $archive -Force -ErrorAction SilentlyContinue
        Pass "gitleaks installed"
    } else {
        Fail "gitleaks binary not found in archive"
    }
}

function Install-Pip {
    $python = Get-Command "python" -ErrorAction SilentlyContinue
    if (-not $python) { Fail "Python not found, cannot install pip"; return }
    Info "Ensuring pip is available..."
    & $python.Source -m ensurepip --upgrade 2>$null
    & $python.Source -m pip install --upgrade pip --quiet 2>$null
    if (Get-Command "pip" -ErrorAction SilentlyContinue) {
        Pass "pip ready"
    } else {
        Warn "pip install needs manual setup"
    }
}

function Install-PythonPackage($PackageName) {
    $python = Get-Command "python" -ErrorAction SilentlyContinue
    if (-not $python) { Fail "Python not found, skipping $PackageName"; return }
    Info "Installing $PackageName via pip..."
    & $python.Source -m pip install $PackageName --quiet 2>$null
    if ($LASTEXITCODE -eq 0 -or (Get-Command $PackageName -ErrorAction SilentlyContinue)) {
        Pass "$PackageName installed"
    } else {
        Warn "$PackageName install may have failed (check manually)"
    }
}

function Install-Terraform {
    $ver = $Script:Versions.terraform
    $url = "https://releases.hashicorp.com/terraform/${ver}/terraform_${ver}_windows_amd64.zip"
    $archive = Join-Path $Script:DownloadDir "terraform.zip"
    Ensure-Directory $Script:DownloadDir; Ensure-Directory $Script:BinDir
    Info "Downloading Terraform v${ver}..."
    Invoke-WebRequest -Uri $url -OutFile $archive -UseBasicParsing
    $extractDir = Join-Path $Script:DownloadDir "terraform-extract"
    Ensure-Directory $extractDir
    Expand-Archive -Path $archive -DestinationPath $extractDir -Force
    $exe = Get-ChildItem $extractDir -Recurse -Filter "terraform.exe" | Select-Object -First 1
    if ($exe) {
        Move-Item $exe.FullName (Join-Path $Script:BinDir "terraform.exe") -Force
        Remove-Item $extractDir -Recurse -Force -ErrorAction SilentlyContinue
        Remove-Item $archive -Force -ErrorAction SilentlyContinue
        Pass "Terraform v${ver} installed"
    } else { Fail "terraform.exe not found in archive" }
}

function Install-Helm {
    $ver = $Script:Versions.helm
    $url = "https://get.helm.sh/helm-v${ver}-windows-amd64.zip"
    $archive = Join-Path $Script:DownloadDir "helm.zip"
    Ensure-Directory $Script:DownloadDir; Ensure-Directory $Script:BinDir
    Info "Downloading Helm v${ver}..."
    Invoke-WebRequest -Uri $url -OutFile $archive -UseBasicParsing
    $extractDir = Join-Path $Script:DownloadDir "helm-extract"
    Ensure-Directory $extractDir
    Expand-Archive -Path $archive -DestinationPath $extractDir -Force
    $exe = Get-ChildItem $extractDir -Recurse -Filter "helm.exe" | Select-Object -First 1
    if ($exe) {
        Move-Item $exe.FullName (Join-Path $Script:BinDir "helm.exe") -Force
        Remove-Item $extractDir -Recurse -Force -ErrorAction SilentlyContinue
        Remove-Item $archive -Force -ErrorAction SilentlyContinue
        Pass "Helm v${ver} installed"
    } else { Fail "helm.exe not found in archive" }
}

function Install-AwsCli {
    $url = "https://awscli.amazonaws.com/AWSCLIV2.msi"
    $msi = Join-Path $Script:DownloadDir "AWSCLIV2.msi"
    Ensure-Directory $Script:DownloadDir
    Info "Downloading AWS CLI v2..."
    Invoke-WebRequest -Uri $url -OutFile $msi -UseBasicParsing
    Info "Installing AWS CLI (may require administrator elevation)..."
    $proc = Start-Process msiexec.exe -Wait -ArgumentList "/i `"$msi`" /quiet /norestart" -PassThru
    if ($proc.ExitCode -eq 0) { Pass "AWS CLI installed" }
    else { Warn "AWS CLI MSI install exited $($proc.ExitCode)" }
    Remove-Item $msi -Force -ErrorAction SilentlyContinue
}

function Install-GitHubCli {
    $ver = $Script:Versions.ghcli
    $url = "https://github.com/cli/cli/releases/download/v${ver}/gh_${ver}_windows_amd64.zip"
    $archive = Join-Path $Script:DownloadDir "gh.zip"
    Ensure-Directory $Script:DownloadDir; Ensure-Directory $Script:BinDir
    Info "Downloading GitHub CLI v${ver}..."
    Invoke-WebRequest -Uri $url -OutFile $archive -UseBasicParsing
    $extractDir = Join-Path $Script:DownloadDir "gh-extract"
    Ensure-Directory $extractDir
    Expand-Archive -Path $archive -DestinationPath $extractDir -Force
    $exe = Get-ChildItem $extractDir -Recurse -Filter "gh.exe" | Select-Object -First 1
    if ($exe) {
        Move-Item $exe.FullName (Join-Path $Script:BinDir "gh.exe") -Force
        Remove-Item $extractDir -Recurse -Force -ErrorAction SilentlyContinue
        Remove-Item $archive -Force -ErrorAction SilentlyContinue
        Pass "GitHub CLI v${ver} installed"
    } else { Fail "gh.exe not found in archive" }
}

function Install-Trivy {
    $ver = $Script:Versions.trivy
    $url = "https://github.com/aquasecurity/trivy/releases/download/v${ver}/trivy_${ver}_windows-amd64.zip"
    $archive = Join-Path $Script:DownloadDir "trivy.zip"
    Ensure-Directory $Script:DownloadDir; Ensure-Directory $Script:BinDir
    Info "Downloading Trivy v${ver}..."
    Invoke-WebRequest -Uri $url -OutFile $archive -UseBasicParsing
    $extractDir = Join-Path $Script:DownloadDir "trivy-extract"
    Ensure-Directory $extractDir
    Expand-Archive -Path $archive -DestinationPath $extractDir -Force
    $exe = Get-ChildItem $extractDir -Recurse -Filter "trivy.exe" | Select-Object -First 1
    if ($exe) {
        Move-Item $exe.FullName (Join-Path $Script:BinDir "trivy.exe") -Force
        Remove-Item $extractDir -Recurse -Force -ErrorAction SilentlyContinue
        Remove-Item $archive -Force -ErrorAction SilentlyContinue
        Pass "Trivy v${ver} installed"
    } else { Fail "trivy.exe not found in archive" }
}

function Install-Jq {
    $ver = $Script:Versions.jq
    $url = "https://github.com/jqlang/jq/releases/download/jq-${ver}/jq-windows-amd64.exe"
    $dest = Join-Path $Script:BinDir "jq.exe"
    Ensure-Directory $Script:BinDir
    Info "Downloading jq v${ver}..."
    Invoke-WebRequest -Uri $url -OutFile $dest -UseBasicParsing
    if (Test-Path $dest) { Pass "jq v${ver} installed" } else { Fail "jq download failed" }
}

function Install-Yq {
    $ver = $Script:Versions.yq
    $url = "https://github.com/mikefarah/yq/releases/download/v${ver}/yq_windows_amd64.zip"
    $archive = Join-Path $Script:DownloadDir "yq.zip"
    Ensure-Directory $Script:DownloadDir; Ensure-Directory $Script:BinDir
    Info "Downloading yq v${ver}..."
    Invoke-WebRequest -Uri $url -OutFile $archive -UseBasicParsing
    $extractDir = Join-Path $Script:DownloadDir "yq-extract"
    Ensure-Directory $extractDir
    Expand-Archive -Path $archive -DestinationPath $extractDir -Force
    $exe = Get-ChildItem $extractDir -Recurse -Filter "*.exe" | Select-Object -First 1
    if ($exe) {
        Move-Item $exe.FullName (Join-Path $Script:BinDir "yq.exe") -Force
        Remove-Item $extractDir -Recurse -Force -ErrorAction SilentlyContinue
        Remove-Item $archive -Force -ErrorAction SilentlyContinue
        Pass "yq v${ver} installed"
    } else { Fail "yq executable not found in archive" }
}

# ──────────────────────────────────────────────────────────────────────────────
# Tool resolution
# ──────────────────────────────────────────────────────────────────────────────
function Resolve-Tool {
    param($Tool)
    $binary = Get-Command $Tool.Binary -ErrorAction SilentlyContinue
    $version = $null
    $status = "missing"
    $message = ""

    if ($binary) {
        $version = Get-ToolVersion $Tool.Binary $Tool.VersionArgs
        $minOk = Test-VersionMinimum $version $Tool.Min
        if ($minOk) {
            $status = "ok"
            $message = $version
        } else {
            $status = "outdated"
            $message = "$version (min: $($Tool.Min))"
        }
    } else {
        $message = "not installed"
    }

    return @{
        Name    = $Tool.Name
        Binary  = $Tool.Binary
        Min     = $Tool.Min
        Status  = $status
        Version = $version
        Message = $message
        Path    = if ($binary) { $binary.Source } else { $null }
    }
}

function Install-Tool {
    param($Tool)
    $resolved = Resolve-Tool $Tool
    if ($resolved.Status -eq "ok") {
        Pass "$($Tool.Name) $(if ($resolved.Version) { "v$($resolved.Version)" })"
        return $resolved
    }
    if ($resolved.Status -eq "outdated") {
        Warn "$($Tool.Name) v$($resolved.Version) (upgrading to >= $($Tool.Min))"
    }

    # Try winget first
    if ($Tool.Winget) {
        $ok = Install-ViaWinget $Tool.Winget $Tool.Name
        if ($ok) {
            $resolved = Resolve-Tool $Tool
            if ($resolved.Status -eq "ok") { return $resolved }
        }
    }

    # Try custom installer
    if ($Tool.Script) {
        & $Tool.Script
        # Refresh PATH
        $env:PATH = [Environment]::GetEnvironmentVariable("PATH", "Machine") + ";" +
                    [Environment]::GetEnvironmentVariable("PATH", "User")
        $resolved = Resolve-Tool $Tool
        if ($resolved.Status -eq "ok") { return $resolved }
    }

    return $resolved
}

# ──────────────────────────────────────────────────────────────────────────────
# Report
# ──────────────────────────────────────────────────────────────────────────────
function Show-Report {
    param($Results)
    Header "Tool Status"
    Write-Host ("{0,-22} {1,-10} {2}" -f "Tool", "Status", "Version")
    Write-Host ("{0,-22} {1,-10} {2}" -f "----", "------", "-------")
    $ok = 0; $missing = 0; $outdated = 0
    foreach ($r in $Results) {
        switch ($r.Status) {
            "ok"      { Pass $r.Name; $ok++ }
            "outdated" { Warn "$($r.Name)"; $outdated++ }
            "missing" { Fail "$($r.Name)"; $missing++ }
        }
        if ($r.Message) {
            Write-Host ("  {0,-22} {1,-10} {2}" -f "", "", $r.Message)
        }
    }
    Write-Host ""
    Write-Host ("  Summary: {0} ok, {1} outdated, {2} missing" -f $ok, $outdated, $missing)
    if ($missing -gt 0) {
        Write-Host "  Some tools need manual installation (see README-Windows.md)" -ForegroundColor Yellow
    }
}

function Show-Manifest {
    Header "Required Tools & Versions"
    foreach ($t in $Script:Tools) {
        Write-Host ("  {0,-22} >= {1}" -f $t.Name, $t.Min)
    }
    Write-Host ""
    Info "Target OS: Windows 11 (PowerShell 7+)"
}

# ──────────────────────────────────────────────────────────────────────────────
# Main
# ──────────────────────────────────────────────────────────────────────────────
function Main {
    # Check requirements
    if ($PSVersionTable.PSVersion.Major -lt 7) {
        Write-Host "PowerShell 7+ required. Install from: https://github.com/PowerShell/PowerShell/releases" -ForegroundColor Red
        exit 1
    }

    # Redirect stdout to host to prevent output capture issues
    $host.UI.Write("")

    if ($Help) {
        Get-Help $MyInvocation.MyCommand.Path
        return
    }
    if ($List) {
        Show-Manifest
        return
    }
    if ($Check) {
        $results = $Script:Tools | ForEach-Object { Resolve-Tool $_ }
        Show-Report $results
        return
    }

    # Full setup
    Write-Host ""
    Write-Host ("=" * 56) -ForegroundColor White
    Write-Host " AegisAI Enterprise Dev Environment Setup" -ForegroundColor White
    Write-Host ("=" * 56) -ForegroundColor White
    Write-Host " OS     : Windows 11"
    Write-Host " Target : $($Script:BinDir)"
    Write-Host ""

    Header "Pre-flight Check"
    $toolWinget = Test-WingetAvailable
    if ($toolWinget) { Pass "winget available" } else { Warn "winget not found (will use direct downloads)" }
    if (Test-Administrator) { Warn "Running as Administrator" } else { Info "Running as user (no elevation needed)" }
    Info "PowerShell $($PSVersionTable.PSVersion)"

    $env:PSModulePath = [Environment]::GetEnvironmentVariable("PSModulePath", "Machine") + ";" +
                        [Environment]::GetEnvironmentVariable("PSModulePath", "User")

    Ensure-Directory $Script:BinDir
    Ensure-Directory $Script:DownloadDir

    Header "Installation"

    $results = @()
    foreach ($tool in $Script:Tools) {
        $result = Install-Tool $tool
        $results += $result
    }

    # Add ~\bin to PATH if not present
    if (Test-Path $Script:BinDir) {
        Add-ToPath $Script:BinDir
    }

    Header "Final Report"
    Show-Report $results

    # Save report
    $report = @{
        Timestamp = (Get-Date).ToString("o")
        Tools     = $results
        Summary   = @{
            Ok       = ($results | Where-Object { $_.Status -eq "ok" }).Count
            Outdated = ($results | Where-Object { $_.Status -eq "outdated" }).Count
            Missing  = ($results | Where-Object { $_.Status -eq "missing" }).Count
        }
    } | ConvertTo-Json -Depth 3
    $report | Out-File $Script:ReportPath -Encoding utf8
    Info "Report saved to $($Script:ReportPath)"

    Write-Host ""
    Info "Dev environment setup complete!"
    Write-Host ""
    Write-Host "  Next steps:" -ForegroundColor Yellow
    Write-Host "   1. Close and reopen your terminal, or run:" -ForegroundColor Yellow
    Write-Host '      $env:Path = [Environment]::GetEnvironmentVariable("Path","User") + ";" + [Environment]::GetEnvironmentVariable("Path","Machine")' -ForegroundColor Yellow
    Write-Host "   2. Start Docker Desktop and verify: docker ps" -ForegroundColor Yellow
    Write-Host "   3. Verify tools: .\scripts\setup-dev.ps1 -Check" -ForegroundColor Yellow
    Write-Host ""
}

# Entry point
Main
