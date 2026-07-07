import asyncio
import json
import os

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query

from ..settings import settings
from ..terminal.execution_layer import ExecutionLayer
from ..terminal.pty_manager import PtyManager
from ..utils.auth import decode_jwt

router = APIRouter()

WORKSPACE = os.path.abspath(
    os.path.expandvars(os.path.expanduser(os.environ.get("TERMINAL_WORKSPACE", os.getcwd())))
)


def _find_shell() -> str | None:
    import platform as pf

    if pf.system() == "Windows":
        candidates = [
            os.path.expandvars(r"%ProgramFiles%\PowerShell\7\pwsh.exe"),
            os.path.expandvars(r"%LOCALAPPDATA%\Microsoft\WindowsApps\pwsh.exe"),
            "pwsh",
            "powershell",
            "cmd",
        ]
        for c in candidates:
            expanded = os.path.expandvars(c)
            if expanded != c or os.path.isfile(expanded):
                return expanded
        return "cmd"
    return os.environ.get("SHELL", "/bin/bash")


@router.websocket("/ws")
async def terminal_websocket(
    ws: WebSocket,
    token: str = Query(""),
):
    await ws.accept()

    execution = ExecutionLayer(WORKSPACE)
    pty: PtyManager | None = None
    authenticated = False

    try:
        auth_timer = 0
        while auth_timer < 300:
            try:
                raw = await asyncio.wait_for(ws.receive_text(), timeout=1)
            except asyncio.TimeoutError:
                auth_timer += 1
                if auth_timer >= 300:
                    await ws.send_json({"type": "error", "message": "Authentication timeout"})
                    await ws.close()
                continue

            try:
                msg = json.loads(raw)
            except json.JSONDecodeError:
                await ws.send_json({"type": "error", "message": "Invalid JSON"})
                continue

            if msg.get("type") != "auth":
                await ws.send_json({"type": "error", "message": "Authenticate first"})
                continue

            provided_token = msg.get("token", token)
            if provided_token:
                try:
                    decode_jwt(provided_token)
                    authenticated = True
                    await ws.send_json({"type": "auth_ok", "workspace": execution.workspace})
                    break
                except Exception:
                    await ws.send_json({"type": "error", "message": "Invalid token"})
                    continue
            else:
                await ws.send_json({"type": "error", "message": "Token required"})

        if not authenticated:
            return

        shell = _find_shell()
        pty = PtyManager(execution.workspace, shell=shell)

        async def on_output(data: str) -> None:
            try:
                await ws.send_json({"type": "stdout", "data": data})
            except Exception:
                pass

        async def on_error(data: str) -> None:
            try:
                await ws.send_json({"type": "stderr", "data": data})
            except Exception:
                pass

        async def on_exit(code: int | None) -> None:
            try:
                await ws.send_json({"type": "exit", "code": code})
            except Exception:
                pass

        pty.set_callbacks(on_output=on_output, on_error=on_error, on_exit=on_exit)
        await pty.start()

        while True:
            try:
                raw = await asyncio.wait_for(ws.receive_text(), timeout=30)
            except asyncio.TimeoutError:
                continue

            try:
                msg = json.loads(raw)
            except json.JSONDecodeError:
                continue

            msg_type = msg.get("type")

            if msg_type == "stdin":
                data = msg.get("data", "")
                await pty.write(data)

            elif msg_type == "resize":
                cols = msg.get("cols", 80)
                rows = msg.get("rows", 24)
                pty.resize(max(10, rows), max(10, cols))

            elif msg_type == "ping":
                await ws.send_json({"type": "pong"})

    except WebSocketDisconnect:
        pass
    except Exception:
        pass
    finally:
        if pty is not None:
            await pty.shutdown()
