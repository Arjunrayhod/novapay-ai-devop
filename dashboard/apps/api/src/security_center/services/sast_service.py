import ast
import os
import time
from pathlib import Path

from ..utils import _check_cli

_DANGEROUS_FUNCTIONS = {
    "eval",
    "exec",
    "compile",
    "__import__",
    "pickle.loads",
    "pickle.dumps",
    "marshal.loads",
    "marshal.dumps",
    "input",
}

_SECRET_PATTERNS = [
    "password",
    "passwd",
    "secret",
    "api_key",
    "apikey",
    "token",
    "auth_token",
    "access_key",
    "secret_key",
    "private_key",
]

_SQL_KEYWORDS = ["execute", "executemany", "rawsql"]


def _check_if_bandit_available() -> bool:
    return _check_cli("bandit")


class _SastVisitor(ast.NodeVisitor):
    def __init__(self, filename: str):
        self.filename = filename
        self.issues: list[dict] = []

    def visit_Call(self, node: ast.Call) -> None:
        func_name = self._get_func_name(node)
        if func_name in _DANGEROUS_FUNCTIONS:
            self.issues.append(
                {
                    "file": self.filename,
                    "line": node.lineno,
                    "severity": "high",
                    "check_id": "dangerous-function",
                    "message": f"Use of dangerous function '{func_name}'",
                    "code_snippet": ast.unparse(node) if hasattr(ast, "unparse") else "",
                }
            )
        if func_name in _SQL_KEYWORDS:
            self.issues.append(
                {
                    "file": self.filename,
                    "line": node.lineno,
                    "severity": "high",
                    "check_id": "sql-injection",
                    "message": f"Potential SQL injection via '{func_name}'",
                    "code_snippet": ast.unparse(node) if hasattr(ast, "unparse") else "",
                }
            )
        self.generic_visit(node)

    def visit_Assign(self, node: ast.Assign) -> None:
        for target in node.targets:
            if isinstance(target, ast.Name):
                for pattern in _SECRET_PATTERNS:
                    if pattern in target.id.lower():
                        if isinstance(node.value, ast.Constant) and isinstance(
                            node.value.value, str
                        ):
                            self.issues.append(
                                {
                                    "file": self.filename,
                                    "line": node.lineno,
                                    "severity": "medium",
                                    "check_id": "hardcoded-secret",
                                    "message": f"Hardcoded secret in '{target.id}'",
                                    "code_snippet": ast.unparse(node)
                                    if hasattr(ast, "unparse")
                                    else "",
                                }
                            )
        self.generic_visit(node)

    def visit_Assert(self, node: ast.Assert) -> None:
        self.issues.append(
            {
                "file": self.filename,
                "line": node.lineno,
                "severity": "low",
                "check_id": "assert-used",
                "message": "assert statement used — disabled with -O flag",
                "code_snippet": ast.unparse(node) if hasattr(ast, "unparse") else "",
            }
        )
        self.generic_visit(node)

    @staticmethod
    def _get_func_name(node: ast.Call) -> str:
        if isinstance(node.func, ast.Name):
            return node.func.id
        if isinstance(node.func, ast.Attribute) and hasattr(ast, "unparse"):
            return ast.unparse(node.func)
        if isinstance(node.func, ast.Attribute):
            return node.func.attr
        return ""


def _python_sast_scan(root: str) -> list[dict]:
    issues: list[dict] = []
    py_files = list(Path(root).rglob("*.py"))
    for py_file in py_files:
        try:
            source = py_file.read_text(encoding="utf-8", errors="ignore")
            tree = ast.parse(source, filename=str(py_file))
            visitor = _SastVisitor(str(py_file))
            visitor.visit(tree)
            issues.extend(visitor.issues)
        except SyntaxError:
            continue
    return issues


def _run_bandit_scan(target: str) -> list[dict]:
    if not _check_if_bandit_available():
        return []
    try:
        from ..utils import _run_cli

        output = _run_cli(["bandit", "-r", target, "-f", "json", "-q"], timeout=60)
        import json

        data = json.loads(output)
        return [
            {
                "file": r.get("filename", ""),
                "line": r.get("line_number", 0),
                "severity": r.get("issue_severity", "low").lower(),
                "check_id": r.get("test_id", ""),
                "message": r.get("issue_text", ""),
                "code_snippet": r.get("code", ""),
            }
            for r in data.get("results", [])
        ]
    except Exception:
        return []


def run_sast_scan(target: str = "") -> dict:
    start = time.time()
    if not target:
        from ..utils import _get_project_root

        target = _get_project_root()

    issues = _python_sast_scan(target) or []
    files_scanned = len(list(Path(target).rglob("*.py"))) if os.path.isdir(target) else 0

    if _check_if_bandit_available():
        bandit_issues = _run_bandit_scan(target)
        existing_keys = {(i["file"], i["line"], i["check_id"]) for i in issues}
        for bi in bandit_issues:
            key = (bi["file"], bi["line"], bi["check_id"])
            if key not in existing_keys:
                issues.append(bi)
                existing_keys.add(key)

    elapsed = (time.time() - start) * 1000
    return {
        "tool": "builtin-ast" if not _check_if_bandit_available() else "builtin-ast+bandit",
        "issues": issues,
        "total_issues": len(issues),
        "scan_time_ms": round(elapsed, 1),
        "files_scanned": files_scanned,
    }
