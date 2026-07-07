from ..detector import Detector, DetectorResult
import shutil
import subprocess
import platform
import os


_DOCKER_PATHS_WIN = [
    r"C:\Program Files\Docker\Docker\resources\bin\docker.exe",
    r"C:\Program Files\Docker\Docker\resources\bin\docker.com",
]


class DockerDetector(Detector):
    @property
    def name(self) -> str:
        return "Docker"

    def _binary_name(self) -> str:
        return "docker"

    def detect(self) -> DetectorResult:
        path = shutil.which(self._binary_name())
        if not path and platform.system() == "Windows":
            for p in _DOCKER_PATHS_WIN:
                if os.path.isfile(p):
                    path = p
                    break
        if not path:
            return DetectorResult(
                name=self.name,
                installed=False,
                error="Not found in PATH",
            )
        try:
            version = self._get_version(path)
            return DetectorResult(
                name=self.name,
                installed=True,
                version=version,
                path=path,
                latest_version=self._latest_version_placeholder(),
            )
        except Exception as e:
            return DetectorResult(
                name=self.name,
                installed=True,
                path=path,
                error=f"Version detection failed: {e}",
            )

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
