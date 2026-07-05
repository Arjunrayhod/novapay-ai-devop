from .schemas import HealthScore, HealthScoreBreakdown, ToolInfo, ValidationResult


def calculate_health(
    tools: list[ToolInfo],
    validations: list[ValidationResult],
) -> HealthScore:
    infra_tools = {"Docker", "Docker Compose", "kubectl", "Helm", "Terraform", "Kind"}
    dev_tools = {"Python", "Node.js", "Git"}
    cloud_tools = {"AWS CLI", "Azure CLI", "GCloud CLI", "GitHub CLI"}

    def score_category(category_tools: set[str]) -> int:
        relevant = [t for t in tools if t.name in category_tools]
        if not relevant:
            return 100
        installed = sum(1 for t in relevant if t.installed)
        return int((installed / len(relevant)) * 100)

    infra_score = score_category(infra_tools)
    dev_score = score_category(dev_tools)
    cloud_score = score_category(cloud_tools)

    passed = sum(1 for v in validations if v.status == "PASS")
    total = len(validations) if validations else 1
    validation_score = int((passed / total) * 100)

    monitoring_score = 75

    overall = int(
        infra_score * 0.25
        + dev_score * 0.20
        + cloud_score * 0.15
        + validation_score * 0.30
        + monitoring_score * 0.10
    )

    return HealthScore(
        overall=overall,
        breakdown=HealthScoreBreakdown(
            infrastructure=infra_score,
            development=dev_score,
            cloud=cloud_score,
            monitoring=monitoring_score,
        ),
    )
