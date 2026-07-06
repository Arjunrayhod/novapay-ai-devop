from ..detector import Detector


class MinikubeDetector(Detector):
    @property
    def name(self) -> str:
        return "Minikube"

    def _binary_name(self) -> str:
        return "minikube"

    def _get_version(self, path: str) -> str:
        out = self._run_cmd([path, "version", "--short"])
        return out.strip()
