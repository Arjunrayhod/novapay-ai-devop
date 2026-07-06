import platform
import shutil

_TOOL_INSTALL_MAP: dict[str, dict[str, str]] = {
    "Python": {
        "winget": "winget install Python.Python.3.12",
        "choco": "choco install python",
        "brew": "brew install python",
        "apt": "sudo apt install python3",
        "dnf": "sudo dnf install python3",
        "pacman": "sudo pacman -S python",
    },
    "Node.js": {
        "winget": "winget install OpenJS.NodeJS.LTS",
        "choco": "choco install nodejs-lts",
        "brew": "brew install node",
        "apt": "sudo apt install nodejs",
        "dnf": "sudo dnf install nodejs",
        "pacman": "sudo pacman -S nodejs",
    },
    "pnpm": {
        "winget": "winget install pnpm",
        "choco": "choco install pnpm",
        "brew": "brew install pnpm",
        "apt": "sudo npm install -g pnpm",
        "dnf": "sudo npm install -g pnpm",
        "pacman": "sudo pacman -S pnpm",
    },
    "Git": {
        "winget": "winget install Git.Git",
        "choco": "choco install git",
        "brew": "brew install git",
        "apt": "sudo apt install git",
        "dnf": "sudo dnf install git",
        "pacman": "sudo pacman -S git",
    },
    "Docker": {
        "winget": "winget install Docker.DockerDesktop",
        "choco": "choco install docker-desktop",
        "brew": "brew install --cask docker",
        "apt": "sudo apt install docker.io",
        "dnf": "sudo dnf install docker",
        "pacman": "sudo pacman -S docker",
    },
    "Docker Compose": {
        "winget": "winget install Docker.DockerDesktop",
        "choco": "choco install docker-compose",
        "brew": "brew install docker-compose",
        "apt": "sudo apt install docker-compose-v2",
        "dnf": "sudo dnf install docker-compose",
        "pacman": "sudo pacman -S docker-compose",
    },
    "kubectl": {
        "winget": "winget install Kubernetes.kubectl",
        "choco": "choco install kubernetes-cli",
        "brew": "brew install kubectl",
        "apt": "sudo snap install kubectl --classic",
        "dnf": "sudo dnf install kubectl",
        "pacman": "sudo pacman -S kubectl",
    },
    "Minikube": {
        "winget": "winget install minikube",
        "choco": "choco install minikube",
        "brew": "brew install minikube",
        "apt": "curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64 && sudo install minikube-linux-amd64 /usr/local/bin/minikube",  # noqa: E501
        "dnf": "curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64 && sudo install minikube-linux-amd64 /usr/local/bin/minikube",  # noqa: E501
        "pacman": "sudo pacman -S minikube",
    },
    "Kind": {
        "winget": "winget install Kind",
        "choco": "choco install kind",
        "brew": "brew install kind",
        "apt": "curl -Lo ./kind https://kind.sigs.k8s.io/dl/latest/kind-linux-amd64 && chmod +x ./kind && sudo mv ./kind /usr/local/bin/kind",  # noqa: E501
        "dnf": "curl -Lo ./kind https://kind.sigs.k8s.io/dl/latest/kind-linux-amd64 && chmod +x ./kind && sudo mv ./kind /usr/local/bin/kind",  # noqa: E501
        "pacman": "sudo pacman -S kind",
    },
    "Helm": {
        "winget": "winget install Helm.Helm",
        "choco": "choco install kubernetes-helm",
        "brew": "brew install helm",
        "apt": "curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash",
        "dnf": "curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash",
        "pacman": "sudo pacman -S helm",
    },
    "Terraform": {
        "winget": "winget install Hashicorp.Terraform",
        "choco": "choco install terraform",
        "brew": "brew install terraform",
        "apt": "wget -O- https://apt.releases.hashicorp.com/gpg | sudo gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg && echo 'deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main' | sudo tee /etc/apt/sources.list.d/hashicorp.list && sudo apt update && sudo apt install terraform",  # noqa: E501
        "dnf": "sudo dnf install terraform",
        "pacman": "sudo pacman -S terraform",
    },
    "GitHub CLI": {
        "winget": "winget install GitHub.cli",
        "choco": "choco install gh",
        "brew": "brew install gh",
        "apt": "sudo apt install gh",
        "dnf": "sudo dnf install gh",
        "pacman": "sudo pacman -S github-cli",
    },
    "AWS CLI": {
        "winget": "winget install Amazon.AWSCLI",
        "choco": "choco install awscli",
        "brew": "brew install awscli",
        "apt": "sudo apt install awscli",
        "dnf": "sudo dnf install awscli",
        "pacman": "sudo pacman -S aws-cli",
    },
    "Azure CLI": {
        "winget": "winget install Microsoft.AzureCLI",
        "choco": "choco install azure-cli",
        "brew": "brew install azure-cli",
        "apt": "curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash",
        "dnf": "sudo rpm --import https://packages.microsoft.com/keys/microsoft.asc && sudo dnf install azure-cli",  # noqa: E501
        "pacman": "sudo pacman -S azure-cli",
    },
    "GCloud CLI": {
        "winget": "winget install Google.CloudSDK",
        "choco": "choco install gcloudsdk",
        "brew": "brew install --cask google-cloud-sdk",
        "apt": "sudo apt install google-cloud-sdk",
        "dnf": "sudo dnf install google-cloud-sdk",
        "pacman": "sudo pacman -S google-cloud-sdk",
    },
}

_PROVIDER_PRIORITY: dict[str, list[str]] = {
    "Windows": ["winget", "choco"],
    "Darwin": ["brew"],
    "Linux": ["apt", "dnf", "pacman"],
}


def _detect_providers() -> list[str]:
    system = platform.system()
    providers = _PROVIDER_PRIORITY.get(system, [])
    available = []
    for provider in providers:
        binary = _provider_binary(provider)
        if binary and shutil.which(binary):
            available.append(provider)
    return available


def _provider_binary(provider: str) -> str | None:
    mapping = {
        "winget": "winget",
        "choco": "choco",
        "brew": "brew",
        "apt": "apt",
        "dnf": "dnf",
        "pacman": "pacman",
    }
    return mapping.get(provider)


def get_install_commands(missing_tools: list[str]) -> dict:
    providers = _detect_providers()
    os_name = platform.system()

    commands = []
    for tool in missing_tools:
        tool_map = _TOOL_INSTALL_MAP.get(tool)
        if not tool_map:
            continue

        chosen = None
        chosen_provider = None
        for provider in providers:
            if provider in tool_map:
                chosen = tool_map[provider]
                chosen_provider = provider
                break

        if not chosen:
            fallback_providers = _PROVIDER_PRIORITY.get(os_name, [])
            for provider in fallback_providers:
                if provider in tool_map:
                    chosen = tool_map[provider]
                    chosen_provider = provider
                    break

        if not chosen:
            chosen = f"# No automated install command available for {tool} on {os_name}"
            chosen_provider = "manual"

        description = f"Install {tool} using {chosen_provider}"
        commands.append(
            {
                "tool_name": tool,
                "provider": chosen_provider,
                "command": chosen,
                "description": description,
            }
        )

    return {"missing_tools": missing_tools, "commands": commands}
