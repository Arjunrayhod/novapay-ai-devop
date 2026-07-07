import os
import platform
from pathlib import Path


class ExecutionError(Exception):
    pass


class ExecutionLayer:
    ALLOWED_COMMANDS = {
        "git",
        "docker",
        "kubectl",
        "helm",
        "terraform",
        "aws",
        "az",
        "gcloud",
        "python",
        "pip",
        "node",
        "npm",
        "npx",
        "pnpm",
        "yarn",
        "go",
        "rustc",
        "cargo",
        "ls",
        "cat",
        "echo",
        "pwd",
        "cd",
        "cp",
        "mv",
        "rm",
        "mkdir",
        "touch",
        "chmod",
        "chown",
        "ps",
        "top",
        "curl",
        "wget",
        "ping",
        "ssh",
        "scp",
        "cmd",
        "powershell",
        "pwsh",
    }

    def __init__(self, workspace_path: str):
        self._workspace = self._resolve_workspace(workspace_path)

    def _resolve_workspace(self, path: str) -> str:
        resolved = os.path.abspath(os.path.expandvars(os.path.expanduser(path)))
        if not os.path.isdir(resolved):
            try:
                os.makedirs(resolved, exist_ok=True)
            except OSError as e:
                raise ExecutionError(f"Cannot create workspace: {e}")
        return resolved

    def validate_path(self, target_path: str) -> str:
        resolved = os.path.abspath(os.path.expandvars(os.path.expanduser(target_path)))
        workspace = Path(self._workspace).resolve()
        target = Path(resolved).resolve()

        try:
            target.relative_to(workspace)
        except ValueError:
            raise ExecutionError(f"Access denied: path outside workspace ({resolved})")

        return resolved

    @property
    def workspace(self) -> str:
        return self._workspace

    def get_allowed_shells(self) -> list[str]:
        if platform.system() == "Windows":
            return [
                os.path.expandvars(r"%ProgramFiles%\PowerShell\7\pwsh.exe"),
                "pwsh",
                "powershell",
                "cmd",
            ]
        return ["/bin/bash", "/bin/sh", "/bin/zsh"]
