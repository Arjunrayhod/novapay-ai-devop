'use client';

import { Search, Bell, Moon, Sun, GitBranch } from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '../../lib/utils';
import { useTheme } from '../../providers/theme-provider';

interface NavbarProps {
  onSearchOpen?: () => void;
  onNotificationsOpen?: () => void;
}

export function Navbar({ onSearchOpen, onNotificationsOpen }: NavbarProps) {
  const { theme, toggle } = useTheme();
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationCount] = useState(3);
  const searchRef = useRef<HTMLInputElement>(null);

  const handleSearchToggle = useCallback(() => {
    setSearchOpen((prev) => !prev);
    onSearchOpen?.();
  }, [onSearchOpen]);

  useEffect(() => {
    if (searchOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        handleSearchToggle();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSearchToggle]);

  return (
    <header
      className={cn(
        'glass-navbar dark:glass-navbar-dark flex h-14 items-center gap-3 px-4',
      )}
      role="banner"
    >
      {/* Mobile menu trigger - empty for now, reserved for future mobile nav */}
      <div className="flex flex-1 items-center gap-3">
        <button
          onClick={handleSearchToggle}
          className={cn(
            'flex h-8 flex-1 items-center gap-2 rounded-lg border border-border/50 px-3 text-sm text-neutral-400 transition-colors hover:border-neutral-300 hover:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 dark:hover:border-neutral-600 dark:hover:text-neutral-300',
            'max-w-md',
          )}
          aria-label="Search (Cmd+K)"
        >
          <Search className="h-3.5 w-3.5" />
          <span>Search</span>
          <kbd className="ml-auto hidden text-[10px] text-neutral-400 lg:inline">
            ⌘K
          </kbd>
        </button>

        {searchOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-16">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setSearchOpen(false)} />
            <div className="relative w-full max-w-lg animate-enter rounded-xl border border-border/50 bg-surface p-4 shadow-xl">
              <div className="flex items-center gap-3 rounded-lg border border-border px-3 py-2">
                <Search className="h-4 w-4 text-neutral-400" />
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Search clusters, pods, deployments..."
                  className="flex-1 bg-transparent text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none dark:text-neutral-50"
                />
                <kbd className="text-[10px] text-neutral-400">ESC</kbd>
              </div>
              <div className="mt-3 text-center text-xs text-neutral-400">
                Type to search across all resources
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <div className="flex items-center gap-1.5 rounded-lg border border-border/50 px-2.5 py-1 text-xs text-neutral-500">
          <GitBranch className="h-3 w-3" />
          <span className="hidden sm:inline">main</span>
        </div>

        <div className="flex items-center gap-1.5 rounded-lg border border-border/50 px-2.5 py-1 text-xs">
          <span className="inline-flex h-1.5 w-1.5 rounded-full bg-success-500" />
          <span className="text-neutral-500">Healthy</span>
        </div>
      </div>

      <div className="flex items-center gap-0.5">
        <button
          onClick={toggle}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 dark:hover:bg-neutral-800/50 dark:hover:text-neutral-300"
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        <button
          onClick={onNotificationsOpen}
          className="relative flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 dark:hover:bg-neutral-800/50 dark:hover:text-neutral-300"
          aria-label={`Notifications (${notificationCount} unread)`}
        >
          <Bell className="h-4 w-4" />
          {notificationCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger-500 px-1 text-[9px] font-bold leading-none text-white">
              {notificationCount > 9 ? '9+' : notificationCount}
            </span>
          )}
        </button>

        <button
          className="ml-1 flex h-8 w-8 items-center justify-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50"
          aria-label="User menu"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-accent-400 text-[10px] font-bold text-white shadow-sm">
            NP
          </div>
        </button>
      </div>
    </header>
  );
}
