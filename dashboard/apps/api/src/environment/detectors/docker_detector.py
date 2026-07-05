from ..detector import Detector, DetectorResult
import subprocess
import platform


class DockerDetector(Detector):
    @property
    def name(self) -> str:
        return "Docker"

    def _binary_name(self) -> str:
        return "docker"

    def _get_version(self, path: str) -> str:
        out = self._run_cmd([path, "--version"])
        return out.split(",")[0].replace("Docker version ", "").strip()

    def is_running(self) -> bool:
        try:
            startupinfo = None
            if platform.system() == "Windows":
                startupinfo = subprocess.STARTUPINFO()
                startupinfo.dwFlags |= subprocess.STARTF_USESHOWWINDOW
            result = subprocess.run(
                ["docker", "info"],
                capture_output=True,
                text=True,
                timeout=10,
                startupinfo=startupinfo,
            )
            return result.returncode == 0
        except Exception:
            return False
