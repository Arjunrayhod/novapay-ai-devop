#!/usr/bin/env pwsh
<#
.SYNOPSIS
    AegisAI Local Validation — runs all GitHub Actions checks locally before push.
.DESCRIPTION
    Runs yamllint, helm lint, helm template, terraform validate, kustomize build,
    ruff, mypy, pytest, actionlint, markdownlint, JSON validation, and pre-commit
    in a single command. Mirrors the ci.yml / validation.yml pipeline.

    Exit code: 0 if all pass, 1 if any fail.
.PARAMETER Quick
    Skip slow checks (trivy, pytest with coverage).
.PARAMETER Fix
    Auto-fix where possible (ruff format, markdownlint fix).
.PARAMETER List
    Show which checks will run and exit.
.EXAMPLE
    .\scripts\validate.ps1          # Full validation
    .\scripts\validate.ps1 -Quick   # Skip slow checks
    .\scripts\validate.ps1 -Fix     # Auto-fix + validate
#>

param(
    [switch]$Quick,
    [switch]$Fix,
    [switch]$List
)

$Script:results = @()
$Script:startTime = Get-Date

# ──────────────────────────────────────────────────────────────────────────────
# Formatting
# ──────────────────────────────────────────────────────────────────────────────
$Script:icon = @{
    pass   = "+"
    fail   = "x"
    skip   = "-"
    warn   = "!"
    header = "="
}

function Write-Step($Icon, $Text, $Color) {
    $c = switch ($Color) {
        "Green"  { "Green" }
        "Red"    { "Red" }
        "Yellow" { "Yellow" }
        "Cyan"   { "Cyan" }
        default  { "White" }
    }
    Write-Host ("  {0} {1}" -f $Icon, $Text) -ForegroundColor $c
}

function Pass($Text) { Write-Step $Script:icon.pass $Text Green }
function Fail($Text) { Write-Step $Script:icon.fail $Text Red }
function Skip($Text) { Write-Step $Script:icon.skip $Text Yellow }
function Warn($Text) { Write-Step $Script:icon.warn $Text Yellow }
function Info($Text) { Write-Step ">" $Text Cyan }

function Header($Text) {
    Write-Host ""
    Write-Host ("─" * 50) -ForegroundColor DarkGray
    Write-Host (" $Text") -ForegroundColor White -BackgroundColor DarkBlue
    Write-Host ("─" * 50) -ForegroundColor DarkGray
}

function PrintSummary {
    $elapsed = (Get-Date) - $Script:startTime
    $total = $Script:results.Count
    $passed = ($Script:results | Where-Object { $_.Status -eq "pass" }).Count
    $failed = ($Script:results | Where-Object { $_.Status -eq "fail" }).Count
    $skipped = ($Script:results | Where-Object { $_.Status -eq "skip" }).Count

    Write-Host ""
    Write-Host ("=" * 50) -ForegroundColor White
    if ($failed -eq 0) {
        Write-Host "  READY TO PUSH ✅" -ForegroundColor Green
    } else {
        Write-Host "  FIX $failed ISSUE(S) FIRST ❌" -ForegroundColor Red
    }
    Write-Host ("=" * 50) -ForegroundColor White
    Write-Host "  Passed : $passed/$total" -ForegroundColor Green
    if ($failed -gt 0) { Write-Host "  Failed : $failed" -ForegroundColor Red }
    if ($skipped -gt 0) { Write-Host "  Skipped: $skipped" -ForegroundColor Yellow }
    Write-Host ("  Elapsed: {0:mm\:ss}" -f $elapsed) -ForegroundColor Gray
    Write-Host ""

    if ($failed -gt 0) {
        Write-Host "  Failed checks:" -ForegroundColor Red
        foreach ($r in ($Script:results | Where-Object { $_.Status -eq "fail" })) {
            Write-Host "    - $($r.Name)" -ForegroundColor Red
            if ($r.Detail) { Write-Host "      $($r.Detail)" -ForegroundColor Gray }
        }
        Write-Host ""
    }
}

function Add-Result($Name, $Status, $Detail) {
    $Script:results += @{ Name = $Name; Status = $Status; Detail = $Detail }
}

function Test-CommandExists($Command) {
    return (Get-Command $Command -ErrorAction SilentlyContinue) -ne $null
}

# ──────────────────────────────────────────────────────────────────────────────
# Check definitions
# ──────────────────────────────────────────────────────────────────────────────
$Script:Checks = @(
    @{ Name = "Repository Structure";       Command = "repo-structure";    Slow = $false; Fixed = $false }
    @{ Name = "YAML Lint (yamllint)";        Command = "yamllint";         Slow = $false; Fixed = $false }
    @{ Name = "Markdown Lint";               Command = "markdownlint";     Slow = $false; Fixed = $true  }
    @{ Name = "JSON Validation";             Command = "json-validate";    Slow = $false; Fixed = $false }
    @{ Name = "Actionlint";                  Command = "actionlint";       Slow = $false; Fixed = $false }
    @{ Name = "Pre-commit Hooks";            Command = "pre-commit";       Slow = $false; Fixed = $true  }
    @{ Name = "Terraform Format";            Command = "terraform-fmt";    Slow = $false; Fixed = $true  }
    @{ Name = "Terraform Validate";          Command = "terraform-val";    Slow = $true;  Fixed = $false }
    @{ Name = "Kustomize Build";             Command = "kustomize";        Slow = $false; Fixed = $false }
    @{ Name = "Helm Lint";                   Command = "helm-lint";        Slow = $false; Fixed = $false }
    @{ Name = "Helm Template";               Command = "helm-template";    Slow = $false; Fixed = $false }
    @{ Name = "Ruff Linter";                 Command = "ruff";             Slow = $false; Fixed = $true  }
    @{ Name = "Mypy Type Checker";           Command = "mypy";             Slow = $true;  Fixed = $false }
    @{ Name = "Pytest";                      Command = "pytest";           Slow = $true;  Fixed = $false }
)

if ($List) {
    Header "Available Checks"
    foreach ($c in $Script:Checks) {
        $slow = if ($c.Slow) { " (slow)" } else { "" }
        $fix = if ($c.Fixed) { " [--fix]" } else { "" }
        Write-Host ("  {0,-30} {1,-6} {2}" -f $c.Name, $slow, $fix)
    }
    Write-Host ""
    Write-Host "  Use -Quick to skip slow checks"
    Write-Host "  Use -Fix  to enable auto-fix"
    return
}

# ──────────────────────────────────────────────────────────────────────────────
# Check: Repository Structure
# ──────────────────────────────────────────────────────────────────────────────
function Invoke-CheckRepoStructure {
    $errors = 0
    $dirs = @("helm", "terraform", "kubernetes", "scripts", ".github")
    $files = @("Makefile", "pyproject.toml", ".yamllint.yml")

    foreach ($d in $dirs) {
        if (-not (Test-Path $d)) { Write-Host "    Missing dir: $d" -ForegroundColor Red; $errors++ }
    }
    foreach ($f in $files) {
        if (-not (Test-Path $f)) { Write-Host "    Missing file: $f" -ForegroundColor Red; $errors++ }
    }

    if ($errors -eq 0) { Pass "Repository structure valid" } else { Fail "$errors structure issue(s)" }
    return ($errors -eq 0)
}

# ──────────────────────────────────────────────────────────────────────────────
# Check: JSON Validation
# ──────────────────────────────────────────────────────────────────────────────
function Invoke-CheckJson {
    $errors = 0
    Get-ChildItem -Recurse -Filter "*.json" | ForEach-Object {
        $skip = $_.FullName -match '\\.git\\|node_modules\\|\.terraform\\'
        if (-not $skip) {
            try {
                $content = Get-Content $_.FullName -Raw -ErrorAction Stop
                $null = $content | ConvertFrom-Json -ErrorAction Stop
            } catch {
                Write-Host ("    Invalid JSON: {0}" -f $_.Name) -ForegroundColor Red
                $errors++
            }
        }
    }
    if ($errors -eq 0) { Pass "All JSON files valid" } else { Fail "$errors invalid JSON file(s)" }
    return ($errors -eq 0)
}

# ──────────────────────────────────────────────────────────────────────────────
# Check: Kustomize Build
# ──────────────────────────────────────────────────────────────────────────────
function Invoke-CheckKustomize {
    $errors = 0
    $overlays = Get-ChildItem "kubernetes/envs/*/kustomization.yaml" -ErrorAction SilentlyContinue
    if (-not $overlays) {
        Skip "No kustomize overlays found"
        return $true
    }
    foreach ($k in $overlays) {
        $name = $k.Directory.Name
        $result = & kubectl kustomize $k.Directory.FullName 2>&1
        if ($LASTEXITCODE -ne 0) {
            Write-Host ("    Kustomize build failed: {0}" -f $name) -ForegroundColor Red
            $errors++
        } else {
            Write-Host ("    {0} [{1}]" -f $name, (& { if ($LASTEXITCODE -eq 0) { "ok" } else { "fail" } })) -ForegroundColor Gray
        }
    }
    if ($errors -eq 0) { Pass "All kustomize overlays valid" } else { Fail "$errors overlay(s) failed" }
    return ($errors -eq 0)
}

# ──────────────────────────────────────────────────────────────────────────────
# Check: Helm Lint + Template
# ──────────────────────────────────────────────────────────────────────────────
function Invoke-CheckHelmLint {
    param([string]$Chart)
    $result = & helm lint "./helm/charts/$Chart" 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host ("    helm lint {0}: FAILED" -f $Chart) -ForegroundColor Red
        return $false
    }
    Write-Host ("    {0}: 0 errors" -f $Chart) -ForegroundColor Gray
    return $true
}

function Invoke-CheckHelmTemplate {
    param([string]$Chart)
    $result = & helm template $Chart "./helm/charts/$Chart" 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host ("    helm template {0}: FAILED" -f $Chart) -ForegroundColor Red
        return $false
    }
    Write-Host ("    {0}: rendered ok" -f $Chart) -ForegroundColor Gray
    return $true
}

# ──────────────────────────────────────────────────────────────────────────────
# Run all checks
# ──────────────────────────────────────────────────────────────────────────────
$Script:exitCode = 0

Write-Host ""
Write-Host ("=" * 50) -ForegroundColor White
Write-Host " AegisAI Local Validation" -ForegroundColor White
if ($Quick) { Write-Host " (quick mode — slow checks skipped)" -ForegroundColor Yellow }
if ($Fix)   { Write-Host " (auto-fix enabled)" -ForegroundColor Yellow }
Write-Host ("=" * 50) -ForegroundColor White

# ── 1. Repository Structure ──
Header "Repository"
$ok = Invoke-CheckRepoStructure
Add-Result "Repository Structure" $(if ($ok) { "pass" } else { "fail" })
if (-not $ok) { $Script:exitCode = 1 }

# ── 2. YAML Lint ──
Header "YAML Lint"
if (Test-CommandExists yamllint) {
    $result = & yamllint -c .yamllint.yml . 2>&1
    if ($LASTEXITCODE -eq 0) { Pass "All YAML files valid" } else { Fail "yamllint found issues (see above)"; $Script:exitCode = 1 }
    Add-Result "YAML Lint" $(if ($LASTEXITCODE -eq 0) { "pass" } else { "fail" })
} else {
    Warn "yamllint not installed — install via: pip install yamllint"
    Add-Result "YAML Lint" "skip"
}

# ── 3. Markdown Lint ──
Header "Markdown Lint"
if (Test-CommandExists markdownlint) {
    $fixFlag = if ($Fix) { @("--fix") } else { @() }
    $result = & markdownlint "**/*.md" "--config" ".markdownlint.yml" @fixFlag 2>&1
    if ($LASTEXITCODE -eq 0) { Pass "All markdown files valid" } else { Fail "markdownlint found issues"; $Script:exitCode = 1 }
    Add-Result "Markdown Lint" $(if ($LASTEXITCODE -eq 0) { "pass" } else { "fail" })
} else {
    Warn "markdownlint not installed"
    Add-Result "Markdown Lint" "skip"
}

# ── 4. JSON Validation ──
Header "JSON Validation"
$ok = Invoke-CheckJson
Add-Result "JSON Validation" $(if ($ok) { "pass" } else { "fail" })
if (-not $ok) { $Script:exitCode = 1 }

# ── 5. Actionlint ──
Header "Actionlint"
if (Test-CommandExists actionlint) {
    $result = & actionlint -color 2>&1
    if ($LASTEXITCODE -eq 0) { Pass "All workflows valid" } else { Fail "actionlint found issues"; $Script:exitCode = 1 }
    Add-Result "Actionlint" $(if ($LASTEXITCODE -eq 0) { "pass" } else { "fail" })
} else {
    Warn "actionlint not installed"
    Add-Result "Actionlint" "skip"
}

# ── 6. Pre-commit ──
Header "Pre-commit"
if (Test-CommandExists pre-commit) {
    $fixFlag = if ($Fix) { @() } else { @("--no-fix") }
    $result = & pre-commit run --all-files 2>&1
    if ($LASTEXITCODE -eq 0) { Pass "All pre-commit hooks passed" } else { Fail "pre-commit found issues"; $Script:exitCode = 1 }
    Add-Result "Pre-commit" $(if ($LASTEXITCODE -eq 0) { "pass" } else { "fail" })
} else {
    Warn "pre-commit not installed"
    Add-Result "Pre-commit" "skip"
}

# ── 7. Terraform Format ──
Header "Terraform"
if (Test-CommandExists terraform) {
    $fmtResult = & terraform fmt -check -recursive -no-color ./terraform 2>&1
    if ($LASTEXITCODE -eq 0) { Pass "Terraform format: ok" } else { Fail "terraform fmt needs fixing (use --fix)"; $Script:exitCode = 1 }
    Add-Result "Terraform Format" $(if ($LASTEXITCODE -eq 0) { "pass" } else { "fail" })

    if (-not $Quick) {
        $valResult = & terraform init -backend=false -no-color ./terraform 2>&1
        if ($LASTEXITCODE -eq 0) {
            $valResult = & terraform validate -no-color ./terraform 2>&1
            if ($LASTEXITCODE -eq 0) { Pass "Terraform validate: ok" } else { Fail "Terraform validate failed"; $Script:exitCode = 1; Write-Host $valResult }
            Add-Result "Terraform Validate" $(if ($LASTEXITCODE -eq 0) { "pass" } else { "fail" })
        } else {
            Fail "Terraform init failed"
            Add-Result "Terraform Validate" "fail"
            $Script:exitCode = 1
        }
    } else {
        Skip "Terraform Validate (use -Quick to skip)"
        Add-Result "Terraform Validate" "skip"
    }
} else {
    Warn "terraform not installed"
    Add-Result "Terraform Format" "skip"
    Add-Result "Terraform Validate" "skip"
}

# ── 8. Kustomize ──
Header "Kustomize"
if (Test-CommandExists kubectl) {
    $ok = Invoke-CheckKustomize
    Add-Result "Kustomize Build" $(if ($ok) { "pass" } else { "fail" })
    if (-not $ok) { $Script:exitCode = 1 }
} else {
    Warn "kubectl not installed"
    Add-Result "Kustomize Build" "skip"
}

# ── 9. Helm ──
Header "Helm"
if (Test-CommandExists helm) {
    $charts = @("aegisai-common", "metrics-server")
    $allLintOk = $true
    $allTemplateOk = $true
    foreach ($chart in $charts) {
        if (Test-Path "./helm/charts/$chart/Chart.yaml") {
            if (-not (Invoke-CheckHelmLint $chart)) { $allLintOk = $false }
            if (-not (Invoke-CheckHelmTemplate $chart)) { $allTemplateOk = $false }
        } else {
            Skip "Chart not found: $chart"
        }
    }
    if ($allLintOk) { Pass "Helm lint: ok" } else { Fail "Helm lint failed"; $Script:exitCode = 1 }
    if ($allTemplateOk) { Pass "Helm template: ok" } else { Fail "Helm template failed"; $Script:exitCode = 1 }
    Add-Result "Helm Lint" $(if ($allLintOk) { "pass" } else { "fail" })
    Add-Result "Helm Template" $(if ($allTemplateOk) { "pass" } else { "fail" })
} else {
    Warn "helm not installed"
    Add-Result "Helm Lint" "skip"
    Add-Result "Helm Template" "skip"
}

# ── 10. Ruff ──
Header "Python"
if (Test-CommandExists ruff) {
    $fixFlag = if ($Fix) { @("--fix") } else { @() }
    $result = & ruff check . @fixFlag 2>&1
    if ($LASTEXITCODE -eq 0) { Pass "Ruff: ok" } else { Fail "Ruff found issues"; $Script:exitCode = 1 }
    Add-Result "Ruff" $(if ($LASTEXITCODE -eq 0) { "pass" } else { "fail" })

    $fmtResult = & ruff format . --check 2>&1
    if ($LASTEXITCODE -eq 0) { Pass "Ruff format: ok" } else { Fail "Ruff format needs fixing"; $Script:exitCode = 1 }
} else {
    Warn "ruff not installed"
    Add-Result "Ruff" "skip"
}

# ── 11. Mypy ──
if (Test-CommandExists mypy) {
    if (-not $Quick) {
        $result = & mypy --strict --ignore-missing-imports . 2>&1
        if ($LASTEXITCODE -eq 0) { Pass "Mypy: ok" } else { Fail "Mypy found issues"; Write-Host $result; $Script:exitCode = 1 }
        Add-Result "Mypy" $(if ($LASTEXITCODE -eq 0) { "pass" } else { "fail" })
    } else {
        Skip "Mypy (use -Quick to skip)"
        Add-Result "Mypy" "skip"
    }
} else {
    Warn "mypy not installed"
    Add-Result "Mypy" "skip"
}

# ── 12. Pytest ──
if (Test-CommandExists pytest) {
    if (-not $Quick) {
        $result = & pytest --cov=. --cov-report=term --cov-fail-under=80 -v 2>&1
        if ($LASTEXITCODE -eq 0) { Pass "Pytest: ok" } else { Fail "Pytest failed"; $Script:exitCode = 1 }
        Add-Result "Pytest" $(if ($LASTEXITCODE -eq 0) { "pass" } else { "fail" })
    } else {
        Skip "Pytest (use -Quick to skip)"
        Add-Result "Pytest" "skip"
    }
} else {
    Warn "pytest not installed"
    Add-Result "Pytest" "skip"
}

# ──────────────────────────────────────────────────────────────────────────────
# Summary
# ──────────────────────────────────────────────────────────────────────────────
PrintSummary
exit $Script:exitCode
