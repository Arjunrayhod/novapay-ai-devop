from ..detector import Detector


class NodeDetector(Detector):
    @property
    def name(self) -> str:
        return "Node.js"

    def _binary_name(self) -> str:
        return "node"

    def _get_version(self, path: str) -> str:
        out = self._run_cmd([path, "--version"])
        return out.strip().lstrip("v")
