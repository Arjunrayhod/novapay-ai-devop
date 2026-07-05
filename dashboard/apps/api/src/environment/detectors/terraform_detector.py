from ..detector import Detector


class TerraformDetector(Detector):
    @property
    def name(self) -> str:
        return "Terraform"

    def _binary_name(self) -> str:
        return "terraform"

    def _get_version(self, path: str) -> str:
        out = self._run_cmd([path, "--version"])
        line = out.split("\n")[0]
        return line.replace("Terraform v", "").strip()
