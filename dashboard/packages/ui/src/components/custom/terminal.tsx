'use client';

import * as React from 'react';
import { Terminal as Xterm, ITerminalOptions } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import { SearchAddon } from '@xterm/addon-search';
import { cn } from '../../lib/utils';
import { Maximize2, Minimize2, Copy, Download, Search, X, Terminal as TerminalIcon, RefreshCw, WifiOff } from 'lucide-react';
import '@xterm/xterm/css/xterm.css';

interface TerminalProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  maxHeight?: number;
  defaultMaximized?: boolean;
  wsUrl?: string;
  token?: string;
  theme?: 'dark' | 'light';
}

type ConnState = 'idle' | 'connecting' | 'connected' | 'disconnected';

const darkTheme: ITerminalOptions['theme'] = {
  background: '#09090b',
  foreground: '#e4e4e7',
  cursor: '#22c55e',
  cursorAccent: '#09090b',
  selectionBackground: '#3b82f680',
  black: '#09090b',
  red: '#ef4444',
  green: '#22c55e',
  yellow: '#f59e0b',
  blue: '#3b82f6',
  magenta: '#a855f7',
  cyan: '#22d3ee',
  white: '#e4e4e7',
  brightBlack: '#52525b',
  brightRed: '#f87171',
  brightGreen: '#4ade80',
  brightYellow: '#fbbf24',
  brightBlue: '#60a5fa',
  brightMagenta: '#c084fc',
  brightCyan: '#67e8f9',
  brightWhite: '#fafafa',
};

const lightTheme: ITerminalOptions['theme'] = {
  background: '#ffffff',
  foreground: '#18181b',
  cursor: '#18181b',
  cursorAccent: '#ffffff',
  selectionBackground: '#3b82f640',
  black: '#09090b',
  red: '#dc2626',
  green: '#16a34a',
  yellow: '#d97706',
  blue: '#2563eb',
  magenta: '#9333ea',
  cyan: '#0891b2',
  white: '#52525b',
  brightBlack: '#a1a1aa',
  brightRed: '#ef4444',
  brightGreen: '#22c55e',
  brightYellow: '#f59e0b',
  brightBlue: '#3b82f6',
  brightMagenta: '#a855f7',
  brightCyan: '#06b6d4',
  brightWhite: '#18181b',
};

const Terminal = React.forwardRef<HTMLDivElement, TerminalProps>(
  ({ className, title = 'Terminal', maxHeight = 400, defaultMaximized = false, wsUrl, token, theme: terminalTheme = 'dark', ...props }, ref) => {
    const [maximized, setMaximized] = React.useState(defaultMaximized);
    const [showSearch, setShowSearch] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [connState, setConnState] = React.useState<ConnState>('idle');
    const [exitCode, setExitCode] = React.useState<number | null>(null);
    const xtermRef = React.useRef<HTMLDivElement>(null);
    const searchInputRef = React.useRef<HTMLInputElement>(null);
    const wsRef = React.useRef<WebSocket | null>(null);
    const xtermInstance = React.useRef<Xterm | null>(null);
    const searchAddonRef = React.useRef<SearchAddon | null>(null);
    const fitAddonRef = React.useRef<FitAddon | null>(null);
    const connectTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
    const connStateRef = React.useRef<ConnState>('idle');
    const reconnectAttemptRef = React.useRef(0);
    const doConnectRef = React.useRef<() => void>(() => {});

    React.useEffect(() => {
      connStateRef.current = connState;
    }, [connState]);

    React.useEffect(() => {
      if (showSearch && searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, [showSearch]);

    const handleResize = React.useCallback(() => {
      if (fitAddonRef.current) {
        try {
          fitAddonRef.current.fit();
          const dims = fitAddonRef.current.proposeDimensions();
          if (dims && wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'resize', cols: dims.cols, rows: dims.rows }));
          }
        } catch {
        }
      }
    }, []);

    React.useEffect(() => {
      if (!xtermRef.current || xtermInstance.current) return;

      const term = new Xterm({
        cursorBlink: true,
        cursorStyle: 'block',
        fontSize: 13,
        fontFamily: 'Menlo, Monaco, "Cascadia Code", "Fira Code", "Courier New", monospace',
        allowProposedApi: true,
        convertEol: true,
        theme: terminalTheme === 'light' ? lightTheme : darkTheme,
      });

      const fitAddon = new FitAddon();
      term.loadAddon(fitAddon);
      fitAddonRef.current = fitAddon;

      term.loadAddon(new WebLinksAddon());

      const searchAddon = new SearchAddon();
      term.loadAddon(searchAddon);
      searchAddonRef.current = searchAddon;

      term.open(xtermRef.current);

      requestAnimationFrame(() => {
        fitAddon.fit();
      });

      term.onData((data) => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
        wsRef.current.send(JSON.stringify({ type: 'stdin', data }));
      });

      const resizeObserver = new ResizeObserver(() => {
        handleResize();
      });
      if (xtermRef.current) {
        resizeObserver.observe(xtermRef.current);
      }

      xtermInstance.current = term;

      return () => {
        resizeObserver.disconnect();
        term.dispose();
        xtermInstance.current = null;
      };
    }, [terminalTheme, handleResize]);

    const doConnect = React.useCallback(() => {
      if (!wsUrl) return;
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      if (connectTimeoutRef.current) {
        clearTimeout(connectTimeoutRef.current);
        connectTimeoutRef.current = null;
      }

      setConnState('connecting');
      setExitCode(null);
      const term = xtermInstance.current;
      if (term) term.clear();

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        ws.send(JSON.stringify({ type: 'auth', token: token || '' }));
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          switch (msg.type) {
            case 'auth_ok':
              setConnState('connected');
              reconnectAttemptRef.current = 0;
              if (xtermInstance.current) {
                xtermInstance.current.write(`\r\n\x1b[32mConnected to ${title}\x1b[0m\r\n`);
                xtermInstance.current.write(`\x1b[90mWorkspace: ${msg.workspace}\x1b[0m\r\n\n`);
                if (fitAddonRef.current) {
                  requestAnimationFrame(() => {
                    try {
                      fitAddonRef.current?.fit();
                    } catch {
                    }
                  });
                }
              }
              break;
            case 'stdout':
              if (xtermInstance.current) {
                xtermInstance.current.write(msg.data);
              }
              break;
            case 'stderr':
              if (xtermInstance.current) {
                xtermInstance.current.write(`\x1b[91m${msg.data}\x1b[0m`);
              }
              break;
            case 'exit':
              setExitCode(msg.code);
              if (xtermInstance.current) {
                const color = msg.code === 0 ? '32' : '91';
                xtermInstance.current.write(`\r\n\x1b[${color}mProcess exited with code ${msg.code}\x1b[0m\r\n`);
              }
              break;
            case 'error':
              if (xtermInstance.current) {
                xtermInstance.current.write(`\r\n\x1b[91mError: ${msg.message}\x1b[0m\r\n`);
              }
              break;
            case 'pong':
              break;
          }
        } catch {
          if (xtermInstance.current) {
            xtermInstance.current.write(event.data);
          }
        }
      };

      ws.onclose = () => {
        wsRef.current = null;
        if (connStateRef.current !== 'idle' && connStateRef.current !== 'connecting') {
          setConnState('disconnected');
          const attempt = reconnectAttemptRef.current;
          const delay = Math.min(1000 * 2 ** attempt, 15000);
          reconnectAttemptRef.current = attempt + 1;
          connectTimeoutRef.current = setTimeout(() => {
            doConnectRef.current();
          }, delay);
        }
      };

      ws.onerror = () => {
        ws.close();
      };
    }, [wsUrl, token, title]);

    doConnectRef.current = doConnect;

    React.useEffect(() => {
      if (!wsUrl) return;
      doConnect();
      return () => {
        if (wsRef.current) {
          wsRef.current.close();
          wsRef.current = null;
        }
        if (connectTimeoutRef.current) {
          clearTimeout(connectTimeoutRef.current);
          connectTimeoutRef.current = null;
        }
        reconnectAttemptRef.current = 0;
      };
    }, [wsUrl, doConnect]);

    const handleCopy = React.useCallback(async () => {
      if (xtermInstance.current) {
        const sel = xtermInstance.current.getSelection();
        if (sel) {
          await navigator.clipboard.writeText(sel);
          return;
        }
      }
      if (xtermRef.current) {
        const text = xtermRef.current.textContent || '';
        await navigator.clipboard.writeText(text);
      }
    }, []);

    const handleDownload = React.useCallback(() => {
      const text = xtermRef.current?.textContent || '';
      const blob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.replace(/\s+/g, '_')}.log`;
      a.click();
      URL.revokeObjectURL(url);
    }, [title]);

    const handleToggleMaximize = React.useCallback(() => {
      setMaximized((prev) => !prev);
      setTimeout(handleResize, 100);
    }, [handleResize]);

    const handleSearchToggle = React.useCallback(() => {
      setShowSearch((prev) => !prev);
      setSearchQuery('');
    }, []);

    const handleSearchKeyDown = React.useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && searchQuery && searchAddonRef.current) {
        searchAddonRef.current.findNext(searchQuery);
      }
    }, [searchQuery]);

    const handleRetry = React.useCallback(() => {
      if (!wsUrl) return;
      if (connectTimeoutRef.current) {
        clearTimeout(connectTimeoutRef.current);
        connectTimeoutRef.current = null;
      }
      reconnectAttemptRef.current = 0;
      doConnect();
    }, [wsUrl, doConnect]);

    const isInteractive = !!wsUrl;

    return (
      <div
        ref={ref}
        className={cn(
          'overflow-hidden rounded-lg border font-mono text-sm shadow-lg',
          connState === 'disconnected' ? 'border-danger-700/50' :
          connState === 'connecting' ? 'border-warning-700/50' :
          terminalTheme === 'light' ? 'border-neutral-300 bg-white' : 'border-neutral-700 bg-neutral-950',
          maximized && 'fixed inset-4 z-50 flex flex-col',
          className,
        )}
        {...props}
      >
        <div className={cn(
          'flex items-center gap-2 border-b px-4 py-2',
          connState === 'disconnected' ? 'border-danger-700/50 bg-danger-950/30' :
          connState === 'connecting' ? 'border-warning-700/50 bg-warning-950/30' :
          terminalTheme === 'light' ? 'border-neutral-300 bg-neutral-100' :
          'border-neutral-700 bg-neutral-900',
        )}>
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-danger-500" />
            <div className="h-3 w-3 rounded-full bg-warning-500" />
            <div className={cn(
              'h-3 w-3 rounded-full',
              connState === 'connected' && 'bg-success-500',
              connState === 'connecting' && 'bg-warning-500 animate-pulse',
              connState === 'disconnected' && 'bg-danger-500',
              connState === 'idle' && 'bg-neutral-600',
            )} />
          </div>
          <span className={cn(
            'text-xs flex-1 flex items-center gap-1.5',
            terminalTheme === 'light' ? 'text-neutral-600' : 'text-neutral-400',
          )}>
            {isInteractive && <TerminalIcon className="h-3 w-3" />}
            {title}
            {exitCode !== null && (
              <span className={cn(
                'text-[9px] px-1 py-0.5 rounded font-medium ml-1',
                exitCode === 0 ? 'bg-success-500/10 text-success-600' : 'bg-danger-500/10 text-danger-600',
              )}>
                exit {exitCode}
              </span>
            )}
            {isInteractive && (
              <span className={cn(
                'text-[9px] px-1 py-0.5 rounded font-medium',
                connState === 'connected' && 'bg-success-500/10 text-success-600',
                connState === 'connecting' && 'bg-warning-500/10 text-warning-600',
                connState === 'disconnected' && 'bg-danger-500/10 text-danger-600',
              )}>
                {connState === 'connected' ? 'Connected' :
                 connState === 'connecting' ? 'Connecting...' :
                 'Disconnected'}
              </span>
            )}
          </span>
          <div className="flex items-center gap-1">
            {connState === 'disconnected' && (
              <button
                onClick={handleRetry}
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded transition-colors',
                  terminalTheme === 'light' ? 'text-neutral-500 hover:text-neutral-800 hover:bg-neutral-200' : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800',
                )}
                aria-label="Retry connection"
              >
                <RefreshCw className="h-3 w-3" />
              </button>
            )}
            <button
              onClick={handleSearchToggle}
              className={cn(
                'flex h-6 w-6 items-center justify-center rounded transition-colors',
                terminalTheme === 'light' ? 'text-neutral-500 hover:text-neutral-800 hover:bg-neutral-200' : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800',
              )}
              aria-label="Search"
            >
              <Search className="h-3 w-3" />
            </button>
            <button
              onClick={handleCopy}
              className={cn(
                'flex h-6 w-6 items-center justify-center rounded transition-colors',
                terminalTheme === 'light' ? 'text-neutral-500 hover:text-neutral-800 hover:bg-neutral-200' : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800',
              )}
              aria-label="Copy content"
            >
              <Copy className="h-3 w-3" />
            </button>
            <button
              onClick={handleDownload}
              className={cn(
                'flex h-6 w-6 items-center justify-center rounded transition-colors',
                terminalTheme === 'light' ? 'text-neutral-500 hover:text-neutral-800 hover:bg-neutral-200' : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800',
              )}
              aria-label="Download as log file"
            >
              <Download className="h-3 w-3" />
            </button>
            <button
              onClick={handleToggleMaximize}
              className={cn(
                'flex h-6 w-6 items-center justify-center rounded transition-colors',
                terminalTheme === 'light' ? 'text-neutral-500 hover:text-neutral-800 hover:bg-neutral-200' : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800',
              )}
              aria-label={maximized ? 'Minimize' : 'Maximize'}
            >
              {maximized ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
            </button>
          </div>
        </div>
        {showSearch && (
          <div className={cn(
            'flex items-center gap-2 border-b px-4 py-1.5',
            terminalTheme === 'light' ? 'border-neutral-300 bg-neutral-100' : 'border-neutral-700 bg-neutral-900',
          )}>
            <Search className={cn('h-3 w-3', terminalTheme === 'light' ? 'text-neutral-500' : 'text-neutral-500')} />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search terminal output... (Enter to find)"
              className={cn(
                'flex-1 bg-transparent text-xs focus:outline-none',
                terminalTheme === 'light' ? 'text-neutral-800 placeholder-neutral-400' : 'text-neutral-200 placeholder-neutral-500',
              )}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className={cn(terminalTheme === 'light' ? 'text-neutral-500 hover:text-neutral-800' : 'text-neutral-500 hover:text-neutral-300')}
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        )}
        <div
          ref={xtermRef}
          className={cn(
            'overflow-hidden p-1',
            maximized && 'flex-1',
          )}
          style={{
            maxHeight: maximized ? undefined : maxHeight,
            background: terminalTheme === 'light' ? '#ffffff' : '#09090b',
          }}
        />
        {connState === 'disconnected' && (
          <div className={cn(
            'flex flex-col items-center justify-center py-6 text-center border-t',
            terminalTheme === 'light' ? 'border-neutral-300' : 'border-neutral-700',
          )}>
            <WifiOff className={cn('h-6 w-6 mb-2', terminalTheme === 'light' ? 'text-danger-600' : 'text-danger-400')} />
            <p className={cn('text-xs font-medium', terminalTheme === 'light' ? 'text-danger-600' : 'text-danger-400')}>Backend not reachable</p>
            <p className={cn('text-[10px] mt-1 max-w-xs', terminalTheme === 'light' ? 'text-neutral-500' : 'text-neutral-500')}>
              Start the API server to enable live terminal execution.
            </p>
          </div>
        )}
      </div>
    );
  },
);
Terminal.displayName = 'Terminal';

export { Terminal };
