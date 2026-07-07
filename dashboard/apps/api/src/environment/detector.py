from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Optional
import shutil
import subprocess
import platform
import sys


@dataclass
class DetectorResult:
    name: str
    installed: bool = False
    version: Optional[str] = None
    latest_version: Optional[str] = None
    path: Optional[str] = None
    error: Optional[str] = None


class Detector(ABC):
    @property
    @abstractmethod
    def name(self) -> str: ...

    def detect(self) -> DetectorResult:
        path = shutil.which(self._binary_name())
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

    @abstractmethod
    def _binary_name(self) -> str: ...

    def _get_version(self, path: str) -> Optional[str]:
        return None

    def _run_cmd(self, cmd: list[str], timeout: int = 15) -> str:
        startupinfo = None
        if platform.system() == "Windows":
            startupinfo = subprocess.STARTUPINFO()
            startupinfo.dwFlags |= subprocess.STARTF_USESHOWWINDOW
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=timeout,
            startupinfo=startupinfo,
        )
        if result.returncode != 0:
            raise RuntimeError(result.stderr.strip() or result.stdout.strip())
        return result.stdout.strip()

    def _latest_version_placeholder(self) -> str:
        return "—"
