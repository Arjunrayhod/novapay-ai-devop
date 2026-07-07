from ..detector import Detector


class KindDetector(Detector):
    @property
    def name(self) -> str:
        return "Kind"

    def _binary_name(self) -> str:
        return "kind"

    def _get_version(self, path: str) -> str:
        out = self._run_cmd([path, "--version"])
        return out.replace("kind version ", "").strip()
