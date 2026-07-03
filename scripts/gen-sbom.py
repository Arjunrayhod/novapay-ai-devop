import json
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path


def gen_sbom(output_dir: str = "sbom-output") -> None:
    output_path = Path(output_dir) / "sbom.json"
    output_path.parent.mkdir(parents=True, exist_ok=True)

    pip_data = subprocess.run(
        [sys.executable, "-m", "pip", "list", "--format=json"],
        capture_output=True,
        text=True,
        check=True,
    )
    data = json.loads(pip_data.stdout)

    timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")  # noqa: UP017

    sbom = {
        "bomFormat": "CycloneDX",
        "specVersion": "1.5",
        "version": 1,
        "metadata": {
            "timestamp": timestamp,
            "tools": [{"name": "pip-list", "vendor": "pypi"}],
            "component": {
                "name": "aegisai-platform",
                "type": "application",
                "version": "0.1.0",
            },
        },
        "components": [
            {
                "type": "library",
                "name": p["name"],
                "version": p["version"],
                "purl": f"pkg:pypi/{p['name']}@{p['version']}",
            }
            for p in data
        ],
    }

    with output_path.open("w") as f:
        json.dump(sbom, f, indent=2)

    size = output_path.stat().st_size
    print(f"SBOM generated: {size} bytes")


if __name__ == "__main__":
    gen_sbom(*sys.argv[1:] if len(sys.argv) > 1 else [])
