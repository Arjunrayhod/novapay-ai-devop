from ...environment.detectors.aws_detector import AWSDetector
from ...environment.detectors.azure_detector import AzureDetector
from ...environment.detectors.docker_compose_detector import DockerComposeDetector
from ...environment.detectors.docker_detector import DockerDetector
from ...environment.detectors.gcloud_detector import GCloudDetector
from ...environment.detectors.gh_detector import GitHubCLIDetector
from ...environment.detectors.git_detector import GitDetector
from ...environment.detectors.helm_detector import HelmDetector
from ...environment.detectors.kind_detector import KindDetector
from ...environment.detectors.kubectl_detector import KubectlDetector
from ...environment.detectors.minikube_detector import MinikubeDetector
from ...environment.detectors.node_detector import NodeDetector
from ...environment.detectors.pnpm_detector import PnpmDetector
from ...environment.detectors.python_detector import PythonDetector
from ...environment.detectors.system_detector import SystemDetector
from ...environment.detectors.terraform_detector import TerraformDetector

_TOOL_DETECTORS = [
    PythonDetector(),
    NodeDetector(),
    PnpmDetector(),
    GitDetector(),
    DockerDetector(),
    DockerComposeDetector(),
    KubectlDetector(),
    MinikubeDetector(),
    KindDetector(),
    HelmDetector(),
    TerraformDetector(),
    GitHubCLIDetector(),
    AWSDetector(),
    AzureDetector(),
    GCloudDetector(),
]


def scan_tools() -> list[dict]:
    results = []
    for detector in _TOOL_DETECTORS:
        result = detector.detect()
        results.append(
            {
                "name": result.name,
                "installed": result.installed,
                "version": result.version,
                "latest_version": result.latest_version,
                "path": result.path,
                "error": result.error,
            }
        )
    return results


def scan_system() -> dict | None:
    try:
        detector = SystemDetector()
        return detector.detect()
    except Exception:
        return None
