import sys
from ..detector import Detector, DetectorResult


class PythonDetector(Detector):
    @property
    def name(self) -> str:
        return "Python"

    def _binary_name(self) -> str:
        return "python" if sys.platform == "win32" else "python3"

    def _get_version(self, path: str) -> str:
        out = self._run_cmd([path, "--version"])
        return out.replace("Python ", "").strip()
