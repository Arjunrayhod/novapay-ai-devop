import json

from ..utils import _run_terraform

_terraform_available = None
_terraform_version = None


def _check_terraform() -> None:
    global _terraform_available, _terraform_version
    if _terraform_available is not None:
        return
    try:
        out = _run_terraform(["version", "-json"])
        data = json.loads(out)
        _terraform_version = data.get("terraform_version", "")
        _terraform_available = True
    except Exception:
        _terraform_available = False
        _terraform_version = ""


def is_terraform_available() -> bool:
    _check_terraform()
    return bool(_terraform_available)


def get_terraform_version() -> dict:
    _check_terraform()
    if not _terraform_available:
        return {"version": "", "revision": "", "platform": "", "provider_count": 0}
    try:
        out = _run_terraform(["version", "-json"])
        data = json.loads(out)
        platform_data = data.get("platform", {})
        return {
            "version": data.get("terraform_version", ""),
            "revision": data.get("terraform_revision", ""),
            "platform": f"{platform_data.get('os', '')}/{platform_data.get('arch', '')}",
            "provider_count": len(data.get("provider_selections", {})),
        }
    except Exception:
        return {
            "version": _terraform_version or "",
            "revision": "",
            "platform": "",
            "provider_count": 0,
        }
