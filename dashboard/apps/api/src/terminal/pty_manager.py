import asyncio
import os
import platform
from abc import ABC, abstractmethod
from asyncio.subprocess import Process
from dataclasses import dataclass
from typing import Callable, Coroutine


@dataclass
class PtySize:
    rows: int = 24
    cols: int = 80


class PtyProcessBase(ABC):
    @abstractmethod
    async def write(self, data: str) -> None: ...

    @abstractmethod
    async def read(self) -> bytes | None: ...

    @abstractmethod
    def resize(self, rows: int, cols: int) -> None: ...

    @abstractmethod
    async def terminate(self) -> int | None: ...

    @property
    @abstractmethod
    def exit_code(self) -> int | None: ...

    @property
    @abstractmethod
    def is_running(self) -> bool: ...


class WinPtyProcess(PtyProcessBase):
    def __init__(self, shell_cmd: list[str], cwd: str, env: dict[str, str] | None = None):
        self._proc: Process | None = None
        self._shell_cmd = shell_cmd
        self._cwd = cwd
        self._env = env
        self._exit_code: int | None = None
        self._loop = asyncio.get_running_loop()

    async def spawn(self) -> None:
        proc_env = os.environ.copy()
        if self._env:
            proc_env.update(self._env)

        self._proc = await asyncio.create_subprocess_exec(
            *self._shell_cmd,
            cwd=self._cwd,
            env=proc_env,
            stdin=asyncio.subprocess.PIPE,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )

    async def write(self, data: str) -> None:
        if self._proc is None or self._proc.stdin is None:
            return
        try:
            self._proc.stdin.write(data.encode("utf-8", errors="replace"))
            await self._proc.stdin.drain()
        except BrokenPipeError:
            pass

    async def read(self) -> bytes | None:
        if self._proc is None or self._proc.stdout is None:
            return None
        try:
            return await self._loop.run_in_executor(None, self._proc.stdout.readline)
        except Exception:
            return None

    async def read_stderr(self) -> bytes | None:
        if self._proc is None or self._proc.stderr is None:
            return None
        try:
            return await self._loop.run_in_executor(None, self._proc.stderr.readline)
        except Exception:
            return None

    def resize(self, rows: int, cols: int) -> None:
        pass

    async def terminate(self) -> int | None:
        if self._proc is None or self._proc.returncode is not None:
            return self._proc.returncode if self._proc else None

        self._proc.terminate()

        try:
            await asyncio.wait_for(self._proc.wait(), timeout=5)
        except asyncio.TimeoutError:
            try:
                self._proc.kill()
                await self._proc.wait()
            except Exception:
                pass

        self._exit_code = self._proc.returncode
        return self._exit_code

    @property
    def exit_code(self) -> int | None:
        if self._proc is not None:
            return self._proc.returncode
        return self._exit_code

    @property
    def is_running(self) -> bool:
        if self._proc is None:
            return False
        return self._proc.returncode is None


AsyncCallback = Callable[[str], Coroutine[None, None, None]]
ExitCallback = Callable[[int | None], Coroutine[None, None, None]]


class PtyManager:
    def __init__(self, workspace: str, shell: str | None = None):
        self._workspace = os.path.abspath(workspace)
        self._process: WinPtyProcess | None = None
        self._on_output: AsyncCallback | None = None
        self._on_error: AsyncCallback | None = None
        self._on_exit: ExitCallback | None = None
        self._reader_task: asyncio.Task | None = None
        self._stderr_task: asyncio.Task | None = None
        self._shell = shell or self._detect_shell()

    def _detect_shell(self) -> str:
        if platform.system() == "Windows":
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

    def _build_shell_cmd(self) -> list[str]:
        shell_lower = self._shell.lower()
        if "pwsh" in shell_lower or "powershell" in shell_lower:
            return [self._shell, "-NoLogo", "-NoExit", "-Command", "-"]
        elif "cmd" in shell_lower:
            return [self._shell, "/Q"]
        else:
            return [self._shell, "--norc"]

    def set_callbacks(
        self,
        on_output: AsyncCallback | None = None,
        on_error: AsyncCallback | None = None,
        on_exit: ExitCallback | None = None,
    ) -> None:
        self._on_output = on_output
        self._on_error = on_error
        self._on_exit = on_exit

    async def start(self) -> None:
        shell_cmd = self._build_shell_cmd()
        self._process = WinPtyProcess(shell_cmd, self._workspace)
        await self._process.spawn()

        self._reader_task = asyncio.create_task(self._read_stdout())
        self._stderr_task = asyncio.create_task(self._read_stderr())

    async def _read_stdout(self) -> None:
        try:
            while self._process and self._process.is_running:
                data = await self._process.read()
                if data is None or data == b"":
                    break
                decoded = data.decode("utf-8", errors="replace")
                if self._on_output:
                    await self._on_output(decoded)
        except Exception:
            pass
        finally:
            if self._on_exit and self._process:
                await self._on_exit(self._process.exit_code)

    async def _read_stderr(self) -> None:
        try:
            while self._process and self._process.is_running:
                data = await self._process.read_stderr()
                if data is None or data == b"":
                    break
                decoded = data.decode("utf-8", errors="replace")
                if self._on_error:
                    await self._on_error(decoded)
        except Exception:
            pass

    async def write(self, data: str) -> None:
        if self._process:
            await self._process.write(data)

    def resize(self, rows: int, cols: int) -> None:
        if self._process:
            self._process.resize(rows, cols)

    async def shutdown(self) -> None:
        if self._reader_task:
            self._reader_task.cancel()
            try:
                await self._reader_task
            except asyncio.CancelledError:
                pass
        if self._stderr_task:
            self._stderr_task.cancel()
            try:
                await self._stderr_task
            except asyncio.CancelledError:
                pass
        if self._process:
            await self._process.terminate()

    @property
    def workspace(self) -> str:
        return self._workspace
