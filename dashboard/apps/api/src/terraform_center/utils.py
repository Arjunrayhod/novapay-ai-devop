import platform
import shutil
import subprocess


def _run_terraform(args: list[str], timeout: int = 30) -> str:
    tf_path = shutil.which("terraform")
    if not tf_path:
        raise RuntimeError("Terraform CLI not found in PATH")
    startupinfo = None
    if platform.system() == "Windows":
        startupinfo = subprocess.STARTUPINFO()
        startupinfo.dwFlags |= subprocess.STARTF_USESHOWWINDOW
    result = subprocess.run(
        [tf_path, *args],
        capture_output=True,
        text=True,
        timeout=timeout,
        startupinfo=startupinfo,
    )
    if result.returncode != 0:
        raise RuntimeError(result.stderr.strip() or result.stdout.strip())
    return result.stdout.strip()
