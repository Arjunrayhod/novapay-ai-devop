import platform
import shutil
import subprocess


def _run_helm(args: list[str], timeout: int = 30) -> str:
    helm_path = shutil.which("helm")
    if not helm_path:
        raise RuntimeError("Helm CLI not found in PATH")
    startupinfo = None
    if platform.system() == "Windows":
        startupinfo = subprocess.STARTUPINFO()
        startupinfo.dwFlags |= subprocess.STARTF_USESHOWWINDOW
    result = subprocess.run(
        [helm_path, *args],
        capture_output=True,
        text=True,
        timeout=timeout,
        startupinfo=startupinfo,
    )
    if result.returncode != 0:
        raise RuntimeError(result.stderr.strip() or result.stdout.strip())
    return result.stdout.strip()
