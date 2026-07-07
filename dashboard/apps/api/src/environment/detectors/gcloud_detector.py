from ..detector import Detector


class GCloudDetector(Detector):
    @property
    def name(self) -> str:
        return "GCloud CLI"

    def _binary_name(self) -> str:
        return "gcloud"

    def _get_version(self, path: str) -> str:
        out = self._run_cmd([path, "--version"])
        line = out.split("\n")[0]
        return line.replace("Google Cloud SDK ", "").split(" ")[0].strip()
