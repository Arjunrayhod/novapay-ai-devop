import platform
import shutil
import subprocess

_binaries: dict[str, bool | None] = {}

STARTUPINFO = None
if platform.system() == "Windows":
    STARTUPINFO = subprocess.STARTUPINFO()
    STARTUPINFO.dwFlags |= subprocess.STARTF_USESHOWWINDOW


def _check_cli(name: str) -> bool:
    if name not in _binaries:
        _binaries[name] = shutil.which(name) is not None
    return _binaries[name] or False


def _run_cli(args: list[str], timeout: int = 30) -> str:
    tool = args[0]
    path = shutil.which(tool)
    if not path:
        raise RuntimeError(f"{tool} CLI not found in PATH")
    result = subprocess.run(
        [path, *args[1:]],
        capture_output=True,
        text=True,
        timeout=timeout,
        startupinfo=STARTUPINFO,
    )
    if result.returncode != 0:
        raise RuntimeError(result.stderr.strip() or result.stdout.strip())
    return result.stdout.strip()


def _get_project_root() -> str:
    import os

    return os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
