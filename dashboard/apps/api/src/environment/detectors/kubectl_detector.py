from ..detector import Detector


class KubectlDetector(Detector):
    @property
    def name(self) -> str:
        return "kubectl"

    def _binary_name(self) -> str:
        return "kubectl"

    def _get_version(self, path: str) -> str:
        out = self._run_cmd([path, "version", "--client", "-o", "json"])
        import json

        data = json.loads(out)
        return data.get("clientVersion", {}).get("gitVersion", "unknown").lstrip("v")
