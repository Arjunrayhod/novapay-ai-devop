def generate_suggestions(
    tools: list[dict],
    path_issues: int,
) -> list[dict[str, str]]:
    suggestions = []

    for tool in tools:
        name = tool["name"]
        installed = tool["installed"]
        error = tool.get("error")

        if not installed:
            if name in ("Docker", "kubectl", "Helm", "Terraform"):
                suggestions.append(
                    {
                        "severity": "critical",
                        "reason": (
                            f"{name} is required for platform operations but is not installed"
                        ),
                        "recommendation": (f"Install {name} to enable infrastructure management"),
                        "suggested_fix": (
                            "Use the install commands panel"
                            f" to get {name} installation instructions"
                        ),
                        "tool_name": name,
                    }
                )
            else:
                suggestions.append(
                    {
                        "severity": "warning",
                        "reason": f"{name} is not installed",
                        "recommendation": (f"Install {name} for full platform functionality"),
                        "suggested_fix": (
                            "Use the install commands panel"
                            f" to get {name} installation instructions"
                        ),
                        "tool_name": name,
                    }
                )
        elif error:
            suggestions.append(
                {
                    "severity": "warning",
                    "reason": f"{name} is installed but has issues: {error}",
                    "recommendation": f"Check {name} configuration",
                    "suggested_fix": (
                        f"Verify {name} is properly configured"
                        " and try reinstalling if issues persist"
                    ),
                    "tool_name": name,
                }
            )

    if path_issues > 0:
        label = "y" if path_issues == 1 else "ies"
        verb = "s" if path_issues == 1 else "ve"
        suggestions.append(
            {
                "severity": "warning",
                "reason": (f"{path_issues} PATH entr{label} ha{verb} issues"),
                "recommendation": ("Clean up PATH to ensure all tool directories are accessible"),
                "suggested_fix": (
                    "Remove duplicate and missing entries from your PATH environment variable"
                ),
                "tool_name": None,
            }
        )

    docker_installed = any(t["name"] == "Docker" and t["installed"] for t in tools)
    docker_running = docker_installed and not any(
        t["name"] == "Docker" and t.get("error") for t in tools
    )

    if docker_installed and not docker_running:
        docker_tool = next((t for t in tools if t["name"] == "Docker"), None)
        if docker_tool and not docker_tool.get("error"):
            suggestions.append(
                {
                    "severity": "info",
                    "reason": ("Docker is installed but the daemon may not be running"),
                    "recommendation": ("Start Docker Desktop or docker daemon"),
                    "suggested_fix": (
                        "Run 'docker info' to verify."
                        " On Windows/macOS, start Docker Desktop"
                        " from the system tray."
                    ),
                    "tool_name": "Docker",
                }
            )

    if suggestions:
        critical_count = len([s for s in suggestions if s["severity"] == "critical"])
        warning_count = len([s for s in suggestions if s["severity"] == "warning"])
        suggestions.insert(
            0,
            {
                "severity": "info",
                "reason": (
                    f"Found {critical_count} critical"
                    f" and {warning_count} warning item(s) to address"
                ),
                "recommendation": ("Review suggestions below and install missing tools"),
                "suggested_fix": ("Start with critical items, then address warnings"),
                "tool_name": None,
            },
        )

    return suggestions
