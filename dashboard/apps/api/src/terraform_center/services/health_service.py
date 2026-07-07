from .module_service import list_modules
from .provider_service import list_providers
from .resource_service import list_resources
from .state_service import is_state_loaded
from .version_service import get_terraform_version, is_terraform_available


def get_terraform_health() -> dict:
    if not is_terraform_available():
        return {
            "terraform_installed": False,
            "cli_version": "",
            "state_loaded": False,
            "providers_healthy": False,
            "provider_count": 0,
            "module_count": 0,
            "resource_count": 0,
        }
    try:
        ver = get_terraform_version()
        state_ok = is_state_loaded()
        providers = list_providers()
        modules = list_modules()
        resources = list_resources()
        providers_healthy = len(providers) > 0
        return {
            "terraform_installed": True,
            "cli_version": ver.get("version", ""),
            "state_loaded": state_ok,
            "providers_healthy": providers_healthy,
            "provider_count": len(providers),
            "module_count": len(modules),
            "resource_count": len(resources),
        }
    except Exception:
        return {
            "terraform_installed": True,
            "cli_version": "",
            "state_loaded": False,
            "providers_healthy": False,
            "provider_count": 0,
            "module_count": 0,
            "resource_count": 0,
        }


def get_overview() -> dict:
    if not is_terraform_available():
        return {
            "terraform_installed": False,
            "cli_version": "",
            "module_count": 0,
            "resource_count": 0,
            "provider_count": 0,
            "output_count": 0,
            "state_loaded": False,
        }
    try:
        ver = get_terraform_version()
        state_ok = is_state_loaded()
        modules = list_modules()
        resources = list_resources()
        providers = list_providers()
        from .output_service import list_outputs

        outputs = list_outputs()
        return {
            "terraform_installed": True,
            "cli_version": ver.get("version", ""),
            "module_count": len(modules),
            "resource_count": len(resources),
            "provider_count": len(providers),
            "output_count": len(outputs),
            "state_loaded": state_ok,
        }
    except Exception:
        return {
            "terraform_installed": True,
            "cli_version": "",
            "module_count": 0,
            "resource_count": 0,
            "provider_count": 0,
            "output_count": 0,
            "state_loaded": False,
        }
