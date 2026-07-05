from ..detector import Detector


class GitHubCLIDetector(Detector):
    @property
    def name(self) -> str:
        return "GitHub CLI"

    def _binary_name(self) -> str:
        return "gh"

    def _get_version(self, path: str) -> str:
        out = self._run_cmd([path, "--version"])
        line = out.split("\n")[0]
        return line.replace("gh version ", "").split(" ")[0].strip()
