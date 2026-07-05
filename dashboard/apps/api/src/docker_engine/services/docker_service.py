_client = None


def get_client():
    global _client
    if _client is None:
        import docker
        from docker.errors import DockerException

        try:
            _client = docker.from_env()
            _client.ping()
        except DockerException:
            _client = None
    return _client


def is_docker_running() -> bool:
    try:
        client = get_client()
        return client is not None
    except Exception:
        return False
