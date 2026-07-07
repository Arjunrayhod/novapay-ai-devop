from ..detector import Detector


class HelmDetector(Detector):
    @property
    def name(self) -> str:
        return "Helm"

    def _binary_name(self) -> str:
        return "helm"

    def _get_version(self, path: str) -> str:
        out = self._run_cmd([path, "version", "--short"])
        return out.strip().lstrip("v")
