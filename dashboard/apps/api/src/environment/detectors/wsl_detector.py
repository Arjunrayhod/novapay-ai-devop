import platform
from ..detector import Detector, DetectorResult


class WSLDetector(Detector):
    @property
    def name(self) -> str:
        return "WSL"

    def _binary_name(self) -> str:
        return "wsl"

    def detect(self) -> DetectorResult:
        if platform.system() != "Windows":
            return DetectorResult(
                name=self.name,
                installed=False,
                error="WSL is only available on Windows",
            )
        path = self._binary_name()
        import shutil

        exe = shutil.which(path)
        if not exe:
            return DetectorResult(name=self.name, installed=False, error="Not found")
        try:
            out = self._run_cmd([exe, "--status"])
            return DetectorResult(
                name=self.name,
                installed=True,
                version="Enabled" if "Default" in out or "enabled" in out.lower() else "Available",
                path=exe,
            )
        except Exception as e:
            return DetectorResult(
                name=self.name,
                installed=True,
                path=exe,
                error=str(e),
            )
