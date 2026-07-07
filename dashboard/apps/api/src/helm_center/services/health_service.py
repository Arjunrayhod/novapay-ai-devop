from .helm_service import (
    get_helm_version,
    is_helm_available,
    list_charts,
    list_releases,
    list_repositories,
)


def get_helm_health() -> dict:
    if not is_helm_available():
        return {
            "helm_installed": False,
            "cli_version": "",
            "repositories_ok": 0,
            "repositories_total": 0,
            "releases_ok": 0,
            "releases_total": 0,
            "chart_count": 0,
        }
    try:
        repos = list_repositories()
        releases = list_releases()
        charts = list_charts()
        repos_ok = sum(1 for r in repos if r.get("status", "").lower() == "ok")
        releases_ok = sum(1 for r in releases if r.get("status", "").lower() == "deployed")
        return {
            "helm_installed": True,
            "cli_version": get_helm_version(),
            "repositories_ok": repos_ok,
            "repositories_total": len(repos),
            "releases_ok": releases_ok,
            "releases_total": len(releases),
            "chart_count": len(charts),
        }
    except Exception:
        return {
            "helm_installed": True,
            "cli_version": get_helm_version(),
            "repositories_ok": 0,
            "repositories_total": 0,
            "releases_ok": 0,
            "releases_total": 0,
            "chart_count": 0,
        }
