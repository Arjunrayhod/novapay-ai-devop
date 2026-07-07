import os
import platform
import shutil
import subprocess
import threading

_client = None
_client_checked = False
_lock = threading.Lock()


def _docker_cli_path() -> str | None:
    if platform.system() == "Windows":
        candidates = [
            shutil.which("docker"),
            r"C:\Program Files\Docker\Docker\resources\bin\docker.exe",
            r"C:\Program Files\Docker\Docker\resources\bin\docker.com",
        ]
        for c in candidates:
            if c and os.path.isfile(c):
                return os.path.normpath(c)
    return shutil.which("docker")


def _daemon_reachable() -> bool:
    exe = _docker_cli_path()
    if not exe:
        return False
    try:
        startupinfo = None
        if platform.system() == "Windows":
            startupinfo = subprocess.STARTUPINFO()
            startupinfo.dwFlags |= subprocess.STARTF_USESHOWWINDOW
        r = subprocess.run(
            [exe, "info", "--format", "{{.ServerVersion}}"],
            capture_output=True,
            text=True,
            timeout=5,
            startupinfo=startupinfo,
        )
        return r.returncode == 0 and bool(r.stdout.strip())
    except Exception:
        return False


def _connect_sdk():
    import docker
    from docker.errors import DockerException

    if platform.system() == "Windows":
        os.environ.setdefault("DOCKER_HOST", "npipe:////./pipe/docker_engine")

    try:
        c = docker.from_env(timeout=10)
        c.ping()
        return c
    except DockerException:
        return None
    except Exception:
        return None


def get_client():
    global _client, _client_checked
    if not _client_checked:
        with _lock:
            if not _client_checked:
                if _daemon_reachable():
                    _client = _connect_sdk()
                _client_checked = True
    return _client


def is_docker_running() -> bool:
    return get_client() is not None
