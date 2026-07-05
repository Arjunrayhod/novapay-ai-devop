_client_instance = None
_apps_instance = None
_networking_instance = None
_custom_objects_instance = None
_version_instance = None
_config = None


def _load_config():
    global _config
    if _config is not None:
        return _config
    from kubernetes import config as k8s_config
    from kubernetes.client import Configuration

    try:
        k8s_config.load_incluster_config()
    except Exception:
        k8s_config.load_kube_config()
    _config = Configuration.get_default_copy()
    return _config


def get_core_api():
    global _client_instance
    if _client_instance is not None:
        return _client_instance
    _load_config()
    from kubernetes import client as k8s_client

    _client_instance = k8s_client.CoreV1Api()
    return _client_instance


def get_apps_api():
    global _apps_instance
    if _apps_instance is not None:
        return _apps_instance
    _load_config()
    from kubernetes import client as k8s_client

    _apps_instance = k8s_client.AppsV1Api()
    return _apps_instance


def get_networking_api():
    global _networking_instance
    if _networking_instance is not None:
        return _networking_instance
    _load_config()
    from kubernetes import client as k8s_client

    _networking_instance = k8s_client.NetworkingV1Api()
    return _networking_instance


def get_custom_objects_api():
    global _custom_objects_instance
    if _custom_objects_instance is not None:
        return _custom_objects_instance
    _load_config()
    from kubernetes import client as k8s_client

    _custom_objects_instance = k8s_client.CustomObjectsApi()
    return _custom_objects_instance


def get_version_api():
    global _version_instance
    if _version_instance is not None:
        return _version_instance
    _load_config()
    from kubernetes import client as k8s_client

    _version_instance = k8s_client.VersionApi()
    return _version_instance


def is_kubernetes_available() -> bool:
    try:
        get_core_api().get_api_resources()
        return True
    except Exception:
        return False
