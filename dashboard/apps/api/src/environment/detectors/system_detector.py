import platform
import os
import psutil
from ..detector import Detector, DetectorResult


class SystemDetector(Detector):
    @property
    def name(self) -> str:
        return "System"

    def _binary_name(self) -> str:
        return "python"

    def detect(self) -> dict:
        cpu_freq = psutil.cpu_freq()
        freq = f"{cpu_freq.current:.0f} MHz" if cpu_freq else "Unknown"
        mem = psutil.virtual_memory()
        disk = psutil.disk_usage("/")
        return {
            "name": self.name,
            "os": f"{platform.system()} {platform.release()}",
            "architecture": platform.machine(),
            "hostname": platform.node(),
            "username": os.environ.get("USER", os.environ.get("USERNAME", "unknown")),
            "cpu": platform.processor() or "Unknown",
            "cpu_cores": psutil.cpu_count(logical=True),
            "cpu_frequency": freq,
            "ram_total": mem.total,
            "ram_available": mem.available,
            "ram_percent": mem.percent,
            "disk_total": disk.total,
            "disk_used": disk.used,
            "disk_free": disk.free,
            "disk_percent": disk.percent,
        }
