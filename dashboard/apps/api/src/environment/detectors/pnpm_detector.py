from ..detector import Detector


class PnpmDetector(Detector):
    @property
    def name(self) -> str:
        return "pnpm"

    def _binary_name(self) -> str:
        return "pnpm"

    def _get_version(self, path: str) -> str:
        out = self._run_cmd([path, "--version"])
        return out.strip()
