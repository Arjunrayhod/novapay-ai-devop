'use client';

import { Search, Bell, Moon, Sun, GitBranch, Command, Sparkles, Settings, LogOut } from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { useTheme } from '../../providers/theme-provider';
import { NotificationPanel, type Notification } from './notification';

interface NavbarProps {
  onSearchOpen?: () => void;
  onNotificationsOpen?: () => void;
}

const SAMPLE_NOTIFICATIONS: Notification[] = [
  { id: '1', type: 'success', title: 'Deployment successful', message: 'frontend-v3 deployed to prod-cluster', timestamp: new Date(Date.now() - 2 * 60000) },
  { id: '2', type: 'warning', title: 'CPU threshold exceeded', message: 'pod-api-7x4f9 > 85% for 5m', timestamp: new Date(Date.now() - 15 * 60000) },
  { id: '3', type: 'info', title: 'Security scan complete', message: 'No critical vulnerabilities found', timestamp: new Date(Date.now() - 60 * 60000) },
  { id: '4', type: 'error', title: 'Pod crash loop', message: 'payment-worker-2j9dk restarted 3x', timestamp: new Date(Date.now() - 120 * 60000) },
];

export function Navbar({ onSearchOpen, onNotificationsOpen }: NavbarProps) {
  const { theme, toggle, mounted } = useTheme();
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(SAMPLE_NOTIFICATIONS);
  const searchRef = useRef<HTMLInputElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

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
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleSearchToggle]);

  const handleSignOut = useCallback(() => {
    localStorage.removeItem('aegisai_auth_token');
    window.location.href = '/login';
  }, []);

  return (
    <header
      className="glass-navbar-dark flex h-14 items-center gap-3 px-4 shrink-0"
      role="banner"
    >
      <div className="flex flex-1 items-center gap-3">
        <motion.button
          onClick={handleSearchToggle}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className={cn(
            'flex h-9 flex-1 items-center gap-2 rounded-lg border px-3 text-sm transition-all duration-200',
            'max-w-md',
          )}
          style={{
            borderColor: 'var(--color-border-light)',
            color: 'var(--color-text-muted)',
            backgroundColor: 'var(--color-hover-bg)',
          }}
          aria-label="Search (Cmd+K)"
        >
          <Search className="h-3.5 w-3.5" />
          <span className="text-neutral-500">Search resources, clusters, pods...</span>
          <div className="ml-auto hidden items-center gap-0.5 lg:flex">
            <kbd className="kbd flex h-5 w-5 items-center justify-center text-[10px]">
              <Command className="h-2.5 w-2.5" />
            </kbd>
            <kbd className="kbd flex h-5 items-center justify-center px-1 text-[10px]">
              K
            </kbd>
          </div>
        </motion.button>

        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-start justify-center pt-16"
            >
              <div className="absolute inset-0 backdrop-blur-sm" style={{ backgroundColor: 'var(--color-overlay)' }} onClick={() => setSearchOpen(false)} />
              <motion.div
                initial={{ scale: 0.96, opacity: 0, y: -10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.96, opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="relative w-full max-w-xl rounded-2xl border p-4 shadow-2xl"
                style={{ backgroundColor: 'var(--color-search-bg)', borderColor: 'var(--color-border-light)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}
              >
                <div className="flex items-center gap-3 rounded-xl border px-4 py-3" style={{ backgroundColor: 'var(--color-search-input-bg)', borderColor: 'var(--color-border-light)' }}>
                  <Search className="h-4 w-4 text-neutral-400" />
                  <input
                    ref={searchRef}
                    type="text"
                    placeholder="Search clusters, pods, deployments..."
                    className="flex-1 bg-transparent text-sm focus:outline-none"
                    style={{ color: 'var(--color-text-primary)' }}
                  />
                  <kbd className="kbd text-[10px] px-1.5 py-0.5 rounded">ESC</kbd>
                </div>
                <div className="mt-4 space-y-2">
                  <p className="text-[10px] font-medium uppercase tracking-wider px-1" style={{ color: 'var(--color-text-muted)' }}>Quick Actions</p>
                  {['Deploy latest release', 'View cluster health', 'Run security scan'].map((action) => (
                    <button
                      key={action}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs transition-colors hover-bg"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      <Sparkles className="h-3 w-3 text-primary-400" />
                      {action}
                    </button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 rounded-lg border px-3 py-1 text-xs" style={{ borderColor: 'var(--color-border-light)', color: 'var(--color-text-muted)', backgroundColor: 'var(--color-hover-bg)' }}>
          <GitBranch className="h-3 w-3" />
          <span className="hidden sm:inline">main</span>
        </div>

        <div className="flex items-center gap-1.5 rounded-lg border px-3 py-1 text-xs" style={{ borderColor: 'var(--color-border-light)', backgroundColor: 'var(--color-hover-bg)' }}>
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-success-500" />
          </span>
          <span style={{ color: 'var(--color-text-secondary)' }}>Healthy</span>
        </div>
      </div>

      <div className="flex items-center gap-0.5">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggle}
          className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30"
          style={{ color: 'var(--color-text-muted)' }}
          aria-label={mounted ? `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode` : 'Toggle theme'}
        >
          {mounted ? (theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />) : <div className="h-4 w-4" />}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => { setNotificationsOpen((prev) => !prev); onNotificationsOpen?.(); }}
          className="relative flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30"
          style={{ color: 'var(--color-text-muted)' }}
          aria-label={`Notifications (${notifications.filter(n => !n.read).length} unread)`}
        >
          <Bell className="h-4 w-4" />
          {notifications.filter(n => !n.read).length > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger-500 px-1 text-[9px] font-bold leading-none text-white shadow-lg shadow-danger-500/30">
              {notifications.filter(n => !n.read).length > 9 ? '9+' : notifications.filter(n => !n.read).length}
            </span>
          )}
        </motion.button>

        <div ref={userMenuRef} className="relative">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setUserMenuOpen((prev) => !prev)}
            className="ml-1 flex h-9 w-9 items-center justify-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30"
            aria-label="User menu"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-accent-500 text-xs font-bold text-white shadow-lg shadow-primary-500/25">
              NP
            </div>
          </motion.button>
          <AnimatePresence>
            {userMenuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -8 }}
                transition={{ duration: 0.12 }}
                className="absolute right-0 top-full mt-2 w-44 overflow-hidden rounded-xl border shadow-xl"
                style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border-light)' }}
              >
                <div className="border-b px-3 py-2.5" style={{ borderColor: 'var(--color-border-light)' }}>
                  <p className="text-xs font-medium" style={{ color: 'var(--color-text-primary)' }}>NovaPay User</p>
                  <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Administrator</p>
                </div>
                <div className="p-1">
                  <button
                    onClick={() => { window.location.href = '/settings'; setUserMenuOpen(false); }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs transition-colors hover-bg"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    <Settings className="h-3.5 w-3.5" />
                    Settings
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs transition-colors hover-bg"
                    style={{ color: 'var(--color-danger-400)' }}
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Sign Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {notificationsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
          >
            <div className="absolute inset-0" onClick={() => setNotificationsOpen(false)} />
            <motion.div
              ref={notifRef}
              initial={{ opacity: 0, scale: 0.96, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -8 }}
              transition={{ duration: 0.15 }}
              className="fixed right-4 top-14"
            >
              <NotificationPanel
                notifications={notifications}
                onDismiss={(id) => setNotifications((prev) => prev.filter((n) => n.id !== id))}
                onClearAll={() => setNotifications([])}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
