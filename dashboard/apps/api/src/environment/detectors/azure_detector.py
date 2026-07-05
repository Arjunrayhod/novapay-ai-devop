from ..detector import Detector


class AzureDetector(Detector):
    @property
    def name(self) -> str:
        return "Azure CLI"

    def _binary_name(self) -> str:
        return "az"

    def _get_version(self, path: str) -> str:
        out = self._run_cmd([path, "--version"])
        line = out.split("\n")[0]
        return line.replace("azure-cli", "").strip()
