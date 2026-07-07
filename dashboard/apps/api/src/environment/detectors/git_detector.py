from ..detector import Detector


class GitDetector(Detector):
    @property
    def name(self) -> str:
        return "Git"

    def _binary_name(self) -> str:
        return "git"

    def _get_version(self, path: str) -> str:
        out = self._run_cmd([path, "--version"])
        return out.replace("git version ", "").strip()
