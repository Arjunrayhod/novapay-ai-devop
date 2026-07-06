import os
import platform
from collections import Counter


def validate_path() -> dict:
    path_raw = os.environ.get("PATH", "")
    separator = ";" if platform.system() == "Windows" else ":"
    entries = [e.strip() for e in path_raw.split(separator) if e.strip()]

    seen: set[str] = set()
    duplicate_counter: Counter = Counter()

    results = []
    for entry in entries:
        normalized = os.path.normpath(os.path.expandvars(entry))

        if normalized in seen:
            results.append(
                {
                    "directory": entry,
                    "status": "duplicate",
                    "note": "Duplicate entry in PATH",
                }
            )
            duplicate_counter["duplicate"] += 1
            continue

        seen.add(normalized)

        if not os.path.exists(normalized):
            results.append(
                {
                    "directory": entry,
                    "status": "missing",
                    "note": "Directory does not exist",
                }
            )
            continue

        if not os.access(normalized, os.X_OK):
            results.append(
                {
                    "directory": entry,
                    "status": "inaccessible",
                    "note": "Directory exists but is not accessible",
                }
            )
            continue

        results.append(
            {
                "directory": entry,
                "status": "valid",
                "note": None,
            }
        )

    summary = {
        "total": len(results),
        "valid": sum(1 for r in results if r["status"] == "valid"),
        "missing": sum(1 for r in results if r["status"] == "missing"),
        "duplicate": sum(1 for r in results if r["status"] == "duplicate"),
        "inaccessible": sum(1 for r in results if r["status"] == "inaccessible"),
    }

    return {"entries": results, "summary": summary}
