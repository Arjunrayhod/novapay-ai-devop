from .schemas import ValidationResult
from .detectors.docker_detector import DockerDetector
import subprocess
import platform
import socket


def _run_validation(cmd: list[str], timeout: int = 10) -> tuple[int, str]:
    startupinfo = None
    if platform.system() == "Windows":
        startupinfo = subprocess.STARTUPINFO()
        startupinfo.dwFlags |= subprocess.STARTF_USESHOWWINDOW
    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=timeout,
            startupinfo=startupinfo,
        )
        return result.returncode, result.stdout.strip() or result.stderr.strip()
    except FileNotFoundError:
        return -1, "Command not found"
    except subprocess.TimeoutExpired:
        return -2, "Command timed out"
    except Exception as e:
        return -3, str(e)


def check_docker_running() -> ValidationResult:
    code, _ = _run_validation(["docker", "info"])
    if code == 0:
        return ValidationResult(
            check="Docker Running", status="PASS", message="Docker daemon is running"
        )
    return ValidationResult(
        check="Docker Running", status="FAILED", message="Docker daemon is not running"
    )


def check_docker_compose() -> ValidationResult:
    for binary in ["docker-compose", "docker"]:
        code, out = _run_validation(
            [binary, "compose", "version"] if binary == "docker" else [binary, "--version"]
        )
        if code == 0:
            return ValidationResult(
                check="Docker Compose", status="PASS", message="Docker Compose is available"
            )
    return ValidationResult(
        check="Docker Compose", status="FAILED", message="Docker Compose is not installed"
    )


def check_kubectl_cluster() -> ValidationResult:
    code, out = _run_validation(["kubectl", "cluster-info", "--request-timeout", "5"])
    if code == 0:
        return ValidationResult(
            check="kubectl Cluster", status="PASS", message="Kubernetes cluster is reachable"
        )
    return ValidationResult(
        check="kubectl Cluster",
        status="WARNING",
        message="No Kubernetes cluster reachable (expected if not running)",
    )


def check_kind_cluster() -> ValidationResult:
    code, out = _run_validation(["kind", "get", "clusters"])
    if code == 0 and out.strip():
        clusters = out.strip().split("\n")
        return ValidationResult(
            check="Kind Cluster",
            status="PASS",
            message=f"Kind cluster(s) available: {', '.join(clusters)}",
        )
    if code == 0:
        return ValidationResult(
            check="Kind Cluster", status="WARNING", message="Kind installed but no clusters created"
        )
    return ValidationResult(check="Kind Cluster", status="WARNING", message="Kind not installed")


def check_helm() -> ValidationResult:
    code, out = _run_validation(["helm", "version", "--short"])
    if code == 0:
        return ValidationResult(
            check="Helm", status="PASS", message=f"Helm {out.strip()} available"
        )
    return ValidationResult(check="Helm", status="FAILED", message="Helm is not installed")


def check_terraform() -> ValidationResult:
    code, _ = _run_validation(["terraform", "--version"])
    if code == 0:
        return ValidationResult(check="Terraform", status="PASS", message="Terraform is installed")
    return ValidationResult(
        check="Terraform", status="FAILED", message="Terraform is not installed"
    )


def check_git() -> ValidationResult:
    code, out = _run_validation(["git", "--version"])
    if code == 0:
        return ValidationResult(check="Git", status="PASS", message="Git is available")
    return ValidationResult(check="Git", status="FAILED", message="Git is not installed")


def check_network() -> ValidationResult:
    try:
        socket.create_connection(("8.8.8.8", 53), timeout=3)
        return ValidationResult(
            check="Network", status="PASS", message="Internet connectivity is available"
        )
    except OSError:
        return ValidationResult(
            check="Network", status="WARNING", message="No internet connectivity detected"
        )


def check_github_access() -> ValidationResult:
    code, _ = _run_validation(["gh", "auth", "status"])
    if code == 0:
        return ValidationResult(
            check="GitHub Access", status="PASS", message="Authenticated with GitHub"
        )
    return ValidationResult(
        check="GitHub Access",
        status="WARNING",
        message="GitHub CLI not authenticated (placeholder)",
    )


def run_all_validations() -> list[ValidationResult]:
    return [
        check_docker_running(),
        check_docker_compose(),
        check_kubectl_cluster(),
        check_kind_cluster(),
        check_helm(),
        check_terraform(),
        check_git(),
        check_network(),
        check_github_access(),
    ]
