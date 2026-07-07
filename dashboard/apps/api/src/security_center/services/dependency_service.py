import json
import re
from pathlib import Path

from ..utils import _check_cli, _run_cli

_KNOWN_VULNERABILITIES: dict[str, list[dict]] = {
    "requests": [
        {
            "versions": "<2.32.0",
            "severity": "medium",
            "advisory": "CVE-2024-35195: Requests cookie header leakage",
            "cve": "CVE-2024-35195",
        },
    ],
    "urllib3": [
        {
            "versions": "<2.2.2",
            "severity": "high",
            "advisory": "CVE-2024-37891: urllib3 proxy-authorization header leakage",
            "cve": "CVE-2024-37891",
        },
    ],
    "certifi": [
        {
            "versions": "<2024.7.4",
            "severity": "medium",
            "advisory": "CVE-2024-39689: Certifi untrusted root certificate",
            "cve": "CVE-2024-39689",
        },
    ],
    "jinja2": [
        {
            "versions": "<3.1.4",
            "severity": "medium",
            "advisory": "CVE-2024-34064: Jinja2 HTML attribute injection",
            "cve": "CVE-2024-34064",
        },
    ],
    "werkzeug": [
        {
            "versions": "<3.0.3",
            "severity": "high",
            "advisory": "CVE-2024-34069: Werkzeug path traversal",
            "cve": "CVE-2024-34069",
        },
    ],
    "cryptography": [
        {
            "versions": "<42.0.4",
            "severity": "high",
            "advisory": "CVE-2024-26130: cryptography side-channel attack",
            "cve": "CVE-2024-26130",
        },
    ],
    "pillow": [
        {
            "versions": "<10.3.0",
            "severity": "high",
            "advisory": "CVE-2024-28219: Pillow DoS",
            "cve": "CVE-2024-28219",
        },
    ],
    "aiohttp": [
        {
            "versions": "<3.9.4",
            "severity": "high",
            "advisory": "CVE-2024-27306: aiohttp CRLF injection",
            "cve": "CVE-2024-27306",
        },
    ],
    "fastapi": [
        {
            "versions": "<0.109.2",
            "severity": "high",
            "advisory": "CVE-2024-24762: FastAPI Content-Type header bypass",
            "cve": "CVE-2024-24762",
        },
    ],
    "starlette": [
        {
            "versions": "<0.36.3",
            "severity": "high",
            "advisory": "CVE-2024-24762: Starlette multipart DoS",
            "cve": "CVE-2024-24762",
        },
    ],
    "pydantic": [
        {
            "versions": "<2.6.0",
            "severity": "medium",
            "advisory": "CVE-2024-33862: Pydantic regex DoS",
            "cve": "CVE-2024-33862",
        },
    ],
    "tornado": [
        {
            "versions": "<6.4.1",
            "severity": "high",
            "advisory": "CVE-2024-47220: Tornado request smuggling",
            "cve": "CVE-2024-47220",
        },
    ],
    "paramiko": [
        {
            "versions": "<3.4.1",
            "severity": "critical",
            "advisory": "CVE-2024-39864: Paramiko auth bypass",
            "cve": "CVE-2024-39864",
        },
    ],
    "redis": [
        {
            "versions": "<5.1.0",
            "severity": "medium",
            "advisory": "CVE-2024-31449: Redis ACL bypass",
            "cve": "CVE-2024-31449",
        },
    ],
}


def _parse_pyproject_toml(path: Path) -> dict[str, str]:
    try:
        import tomllib

        data = tomllib.loads(path.read_text(encoding="utf-8"))
        deps = {}
        for section in ["dependencies", "dev-dependencies"]:
            raw = data.get("project", {}).get(section, []) or data.get("tool", {}).get(
                "poetry", {}
            ).get(section, [])
            for dep in raw:
                if isinstance(dep, str):
                    match = re.match(r"^([a-zA-Z0-9_.-]+)\s*(.+)?$", dep)
                    if match:
                        name = match.group(1).lower()
                        version = match.group(2) or "*"
                        deps[name] = version
        return deps
    except Exception:
        return {}


def _parse_requirements_txt(path: Path) -> dict[str, str]:
    try:
        deps = {}
        for line in path.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line or line.startswith("#") or line.startswith("-"):
                continue
            match = re.match(r"^([a-zA-Z0-9_.-]+)\s*[=<>!~]+\s*([\d.*]+)?", line)
            if match:
                name = match.group(1).lower()
                version = match.group(2) or "*"
                deps[name] = version
        return deps
    except Exception:
        return {}


def _parse_package_json(path: Path) -> dict[str, str]:
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
        deps = {}
        for section in ["dependencies", "devDependencies"]:
            for name, version in data.get(section, {}).items():
                deps[name.lower()] = version
        return deps
    except Exception:
        return {}


def _check_known_vulnerabilities(package: str, version: str) -> list[dict]:
    pkg_lower = package.lower()
    vulns = _KNOWN_VULNERABILITIES.get(pkg_lower, [])
    results = []
    for v in vulns:
        try:
            ver_str = v["versions"]
            op = ver_str[0]
            if op == "<":
                results.append(
                    {
                        "package": package,
                        "installed_version": version,
                        "vulnerable_versions": ver_str,
                        "severity": v["severity"],
                        "advisory": v["advisory"],
                        "cve": v["cve"],
                    }
                )
        except Exception:
            continue
    return results


def _run_safety_scan() -> list[dict]:
    if not _check_cli("safety"):
        return []
    try:
        output = _run_cli(["safety", "check", "--json"], timeout=60)
        data = json.loads(output)
        return [
            {
                "package": v.get("package_name", ""),
                "installed_version": v.get("analyzed_version", ""),
                "vulnerable_versions": v.get("vulnerable_spec", ""),
                "severity": v.get("severity", "unknown").lower(),
                "advisory": v.get("advisory", ""),
                "cve": v.get("cve", ""),
            }
            for v in data.get("vulnerabilities", [])
        ]
    except Exception:
        return []


def scan_dependencies() -> dict:
    from ..utils import _get_project_root

    root = Path(_get_project_root())

    all_deps: dict[str, str] = {}
    for req_file in ["requirements.txt", "requirements-dev.txt"]:
        p = root / req_file
        if p.exists():
            all_deps.update(_parse_requirements_txt(p))
    for toml_file in ["pyproject.toml"]:
        p = root / toml_file
        if p.exists():
            all_deps.update(_parse_pyproject_toml(p))
    for json_file in ["package.json"]:
        p = root / json_file
        if p.exists():
            all_deps.update(_parse_package_json(p))

    vulnerabilities = []
    seen = set()
    for pkg, ver in all_deps.items():
        for v in _check_known_vulnerabilities(pkg, ver):
            key = (v["package"], v["cve"])
            if key not in seen:
                vulnerabilities.append(v)
                seen.add(key)

    if _check_cli("safety"):
        safety_vulns = _run_safety_scan()
        for sv in safety_vulns:
            key = (sv["package"], sv["cve"])
            if key not in seen:
                vulnerabilities.append(sv)
                seen.add(key)

    return {
        "total_packages": len(all_deps),
        "vulnerable_count": len(vulnerabilities),
        "vulnerabilities": vulnerabilities,
    }
