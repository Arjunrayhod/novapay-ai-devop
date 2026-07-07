from ..schemas import DockerInfo
from ..services.docker_service import get_client


def get_docker_info() -> DockerInfo:
    client = get_client()
    if not client:
        return DockerInfo(
            running=False,
            containers_total=0,
            containers_running=0,
            containers_paused=0,
            containers_stopped=0,
            images=0,
            volumes=0,
            networks=0,
        )
    try:
        info = client.info()
        containers_list = client.containers.list(all=True)
        running = [c for c in containers_list if c.status == "running"]
        paused = [c for c in containers_list if c.status == "paused"]
        stopped = [c for c in containers_list if c.status == "exited"]
        images_list = client.images.list(all=True)
        volumes_list = client.volumes.list()
        networks_list = client.networks.list()
        disk_usage_data = {}
        try:
            df = client.df()
            layers = df.get("LayersSize", 0)
            disk_usage_data = {
                "layers_size": layers,
                "containers_size": sum(c.get("SizeRw", 0) for c in df.get("Containers", [])),
                "images_size": sum(i.get("Size", 0) for i in df.get("Images", [])),
                "volumes_size": sum(
                    v.get("UsageData", {}).get("Size", 0) for v in df.get("Volumes", [])
                ),
            }
        except Exception:
            pass
        return DockerInfo(
            running=True,
            containers_total=len(containers_list),
            containers_running=len(running),
            containers_paused=len(paused),
            containers_stopped=len(stopped),
            images=len(images_list),
            volumes=len(volumes_list),
            networks=len(networks_list),
            server_version=info.get("ServerVersion"),
            api_version=info.get("ApiVersion"),
            os=info.get("OperatingSystem"),
            kernel=info.get("KernelVersion"),
            driver=info.get("Driver"),
            data_dir=info.get("DockerRootDir"),
            disk_usage=disk_usage_data,
            memory=info.get("MemTotal"),
            cpus=info.get("NCPU"),
        )
    except Exception:
        return DockerInfo(
            running=False,
            containers_total=0,
            containers_running=0,
            containers_paused=0,
            containers_stopped=0,
            images=0,
            volumes=0,
            networks=0,
        )
