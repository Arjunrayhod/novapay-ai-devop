from ..detector import Detector


class DockerComposeDetector(Detector):
    @property
    def name(self) -> str:
        return "Docker Compose"

    def _binary_name(self) -> str:
        return "docker-compose"

    def _get_version(self, path: str) -> str:
        out = self._run_cmd([path, "--version"])
        return (
            out.replace("Docker Compose version", "").replace("docker-compose version", "").strip()
        )
