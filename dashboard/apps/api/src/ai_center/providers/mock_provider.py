from . import AIProvider


class MockProvider(AIProvider):
    name = "mock"
    model = "mock-v1"

    def chat(self, messages: list[dict], tools: list[dict] | None = None) -> dict:
        last = messages[-1]["content"] if messages else ""

        content = self._generate_response(last)

        return {
            "content": content,
            "role": "assistant",
            "tool_calls": [],
            "finish_reason": "stop",
            "usage": {"prompt_tokens": 0, "completion_tokens": 0},
        }

    def is_available(self) -> bool:
        return True

    def supports_streaming(self) -> bool:
        return True

    def _generate_response(self, user_message: str) -> str:
        msg = user_message.lower()
        if "health" in msg or "status" in msg:
            return (
                "## Platform Health Summary\n\n"
                "Based on the available platform data, here is the current health status:\n\n"
                "| Module | Status |\n"
                "|--------|--------|\n"
                "| Docker | Connected |\n"
                "| Kubernetes | Connected |\n"
                "| Helm | Available |\n"
                "| Terraform | Available |\n"
                "| Observability | Connected |\n"
                "| Security | Active |\n\n"
                "All monitored systems are operational. No critical incidents detected."
            )
        if "risk" in msg or "security" in msg:
            return (
                "## Security & Risk Assessment\n\n"
                "Based on the current security scan data:\n\n"
                "- **SAST Scanner**: Active — Python AST analysis operational\n"
                "- **Dependency Audit**: Found vulnerabilities requiring attention\n"
                "- **OPA Policies**: No policies discovered — policy-as-code not yet configured\n"
                "- **Compliance Score**: Monitoring enabled\n\n"
                "> **Recommendation**: Define OPA policies in `/policies/` "
                "directory to enable automated compliance enforcement."
            )
        if "docker" in msg or "container" in msg:
            return (
                "## Docker Status\n\n"
                "Here is the current Docker Engine status:\n\n"
                "- **Engine**: Connected\n"
                "- **Containers**: Check the Docker Center for detailed container metrics\n"
                "- **Images**: Available for inspection\n"
                "- **Resource Usage**: Monitor via Docker Center\n\n"
                "No anomalies detected in container runtime behavior."
            )
        if "k8s" in msg or "kubernetes" in msg or "cluster" in msg:
            return (
                "## Kubernetes Cluster Summary\n\n"
                "Current cluster state overview:\n\n"
                "- **Cluster**: Connected\n"
                "- **Nodes**: Available for inspection\n"
                "- **Pods**: Running as expected\n"
                "- **Services**: Operational\n\n"
                "The cluster is operating within normal parameters."
            )
        if "terraform" in msg or "infra" in msg:
            return (
                "## Terraform State Summary\n\n"
                "Infrastructure as Code status:\n\n"
                "- **State**: Available for inspection\n"
                "- **Modules**: Active\n"
                "- **Resources**: Tracked in state\n"
                "- **Providers**: Configured\n\n"
                "IaC state is consistent and up to date."
            )
        if "observability" in msg or "monitor" in msg or "metric" in msg:
            return (
                "## Observability Summary\n\n"
                "Monitoring stack status:\n\n"
                "- **Prometheus**: Collecting metrics\n"
                "- **Grafana**: Dashboards available\n"
                "- **Loki**: Log aggregation active\n"
                "- **Tempo**: Distributed tracing operational\n\n"
                "Observability pipeline is healthy across all components."
            )
        if "compliance" in msg or "audit" in msg:
            return (
                "## Compliance Report\n\n"
                "Current compliance posture:\n\n"
                "| Framework | Status | Score |\n"
                "|-----------|--------|-------|\n"
                "| SAST Scanning | Active | 100% |\n"
                "| Dependency Audit | Active | 100% |\n"
                "| Policy as Code | No Policies | 0% |\n"
                "| Secret Scanning | Active | 100% |\n\n"
                "> **Overall Score**: 75% — Define policies to improve."
            )
        if "recommend" in msg or "suggestion" in msg or "advice" in msg:
            return (
                "## AI Recommendations\n\n"
                "Based on analysis of the current platform state:\n\n"
                "### High Priority\n"
                "1. **Define OPA Policies** — No policies currently configured. "
                "Create Rego policies for automated compliance.\n"
                "2. **Review Dependency Vulnerabilities** — Check the "
                "Dependency Audit for packages requiring updates.\n\n"
                "### Medium Priority\n"
                "3. **Configure Observability Alerts** — Ensure alerting "
                "rules are defined for critical metrics.\n"
                "4. **Enable Security Tools** — Install bandit, safety, "
                "trivy, and OPA for expanded coverage.\n\n"
                "### Low Priority\n"
                "5. **Documentation Review** — Keep architecture decisions "
                "and release notes current."
            )
        if "help" in msg or "what can you" in msg or "capabilities" in msg:
            return (
                "## AI Capabilities\n\n"
                "I can help you analyze and understand your platform:\n\n"
                "- **Platform Health** — Overall system status across all modules\n"
                "- **Infrastructure Summary** — Docker, Kubernetes, Terraform state\n"
                "- **Security Analysis** — SAST results, vulnerabilities, compliance\n"
                "- **Observability Review** — Metrics, logs, traces, alerts\n"
                "- **Recommendations** — Actionable suggestions for improvement\n"
                "- **Risk Assessment** — Identify and prioritize risks\n\n"
                "Try asking about your cluster, security posture, or platform health."
            )

        return (
            "I don't have enough data to answer that question specifically. "
            "I can help you with:\n\n"
            "- Platform health and status\n"
            "- Security analysis and risk assessment\n"
            "- Infrastructure summaries (Docker, Kubernetes, Terraform)\n"
            "- Observability and monitoring\n"
            "- Compliance reporting\n"
            "- Recommendations and best practices\n\n"
            "Could you please rephrase your question or ask about one of these areas?"
        )
