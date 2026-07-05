from ..detector import Detector


class AWSDetector(Detector):
    @property
    def name(self) -> str:
        return "AWS CLI"

    def _binary_name(self) -> str:
        return "aws"

    def _get_version(self, path: str) -> str:
        out = self._run_cmd([path, "--version"])
        return out.split(" ")[0].replace("aws-cli/", "").strip()
