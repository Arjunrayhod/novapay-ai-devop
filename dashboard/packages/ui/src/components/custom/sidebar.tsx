'use client';

import {
  LayoutDashboard,
  Cloud,
  Container,
  Sailboat,
  ShipWheel,
  Hexagon,
  GitBranch,
  Shield,
  Activity,
  FileText,
  Package,
  Lock,
  Bot,
  Settings,
  Code,
  PlugZap,
  PanelLeftClose,
  PanelLeft,
  type LucideIcon,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

const MODULE_ACCENTS: Record<string, string> = {
  dashboard: '#3b82f6',
  environment: '#22c55e',
  'dev-experience': '#a855f7',
  docker: '#0ea5e9',
  kubernetes: '#3b82f6',
  helm: '#f59e0b',
  terraform: '#8b5cf6',
  github: '#6366f1',
  integrations: '#f97316',
  security: '#ef4444',
  monitoring: '#06b6d4',
  logs: '#f97316',
  registry: '#14b8a6',
  vault: '#8b5cf6',
  'ai-assistant': '#a855f7',
  settings: '#64748b',
};

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  shortcut?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, shortcut: '⌘1' },
  { id: 'environment', label: 'Environment', icon: Cloud, shortcut: '⌘2' },
  { id: 'dev-experience', label: 'Developer Experience', icon: Code, shortcut: '⌘3' },
  { id: 'docker', label: 'Docker', icon: Container, shortcut: '⌘4' },
  { id: 'kubernetes', label: 'Kubernetes', icon: Sailboat, shortcut: '⌘5' },
  { id: 'helm', label: 'Helm', icon: ShipWheel, shortcut: '⌘6' },
  { id: 'terraform', label: 'Terraform', icon: Hexagon, shortcut: '⌘7' },
  { id: 'github', label: 'GitHub', icon: GitBranch },
  { id: 'integrations', label: 'Integrations', icon: PlugZap },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'monitoring', label: 'Monitoring', icon: Activity },
  { id: 'logs', label: 'Logs', icon: FileText },
  { id: 'registry', label: 'Registry', icon: Package },
  { id: 'vault', label: 'Vault', icon: Lock },
  { id: 'ai-assistant', label: 'AI Assistant', icon: Bot },
  { id: 'settings', label: 'Settings', icon: Settings },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  activeItem?: string;
  onNavigate?: (id: string) => void;
}

export function Sidebar({ collapsed, onToggle, activeItem, onNavigate }: SidebarProps) {
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const navRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedIndex((prev) => (prev + 1) % NAV_ITEMS.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedIndex((prev) => (prev - 1 + NAV_ITEMS.length) % NAV_ITEMS.length);
      } else if (e.key === 'Enter' && focusedIndex >= 0) {
        e.preventDefault();
        onNavigate?.(NAV_ITEMS[focusedIndex]!.id);
      }
    },
    [focusedIndex, onNavigate],
  );

  useEffect(() => {
    if (focusedIndex >= 0) {
      const items = navRef.current?.querySelectorAll('[data-nav-item]');
      (items?.[focusedIndex] as HTMLElement)?.focus();
    }
  }, [focusedIndex]);

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 256 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="glass-sidebar-dark flex h-screen flex-col overflow-hidden shrink-0"
      role="navigation"
      aria-label="Main navigation"
    >
      <div       className={cn(
        'flex h-14 items-center shrink-0',
        collapsed ? 'justify-center' : 'px-4',
      )}
      style={{ borderBottom: '1px solid var(--color-border-light)' }}>
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 text-xs font-bold text-white shadow-lg shadow-primary-500/25">
              A
            </div>
            <div>
              <span className="text-sm font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>AegisAI</span>
              <p className="text-[10px] leading-none" style={{ color: 'var(--color-text-muted)' }}>Control Center</p>
            </div>
          </div>
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 text-xs font-bold text-white shadow-lg shadow-primary-500/25">
            A
          </div>
        )}
      </div>

      <nav
        ref={navRef}
        className="flex-1 overflow-y-auto py-3 scrollbar-thin-dark"
        onKeyDown={handleKeyDown}
        role="menubar"
        aria-orientation="vertical"
      >
        <ul role="menu" className="flex flex-col gap-0.5 px-2">
          {NAV_ITEMS.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;
            const isFocused = focusedIndex === index;
            const accent = MODULE_ACCENTS[item.id] ?? '#64748b';

            return (
              <li key={item.id} role="none">
                <motion.button
                  data-nav-item
                  role="menuitem"
                  tabIndex={isFocused ? 0 : -1}
                  aria-current={isActive ? 'page' : undefined}
                  onClick={() => onNavigate?.(item.id)}
                  onFocus={() => setFocusedIndex(index)}
                  whileHover={{ x: collapsed ? 0 : 4 }}
                  whileTap={{ scale: 0.97 }}
                  className={cn(
                    'relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all duration-200',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-2',
                    collapsed && 'justify-center px-2',
                    isActive
                      ? 'text-[var(--color-text-primary)]'
                      : 'text-[var(--color-text-secondary)] hover:text-[var(--color-hover-text)]',
                  )}
                  style={{
                    background: isActive
                      ? `linear-gradient(135deg, ${accent}15, ${accent}08, transparent)`
                      : undefined,
                  }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute inset-0 rounded-xl border"
                      style={{
                        borderColor: `${accent}30`,
                        boxShadow: `inset 0 0 0 1px ${accent}15, 0 0 20px ${accent}10`,
                      }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <div className={cn(
                    'relative z-10 flex items-center justify-center h-5 w-5',
                    isActive && 'drop-shadow-sm',
                  )} style={{ color: isActive ? accent : undefined }}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -6 }}
                        transition={{ duration: 0.15 }}
                        className={cn('relative z-10 truncate flex-1', isActive && 'font-semibold')}
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {!collapsed && isActive && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="relative z-10 flex items-center gap-1"
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: accent, boxShadow: `0 0 8px ${accent}` }}
                      />
                    </motion.div>
                  )}
                  {!collapsed && !isActive && item.shortcut && (
                    <kbd className="kbd relative z-10 text-[10px]">{item.shortcut}</kbd>
                  )}
                </motion.button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="flex items-center justify-center p-3 shrink-0" style={{ borderTop: '1px solid var(--color-border-light)' }}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onToggle}
          className={cn(
            'flex items-center justify-center rounded-lg p-2 text-[var(--color-text-muted)] transition-colors hover-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50',
            collapsed ? 'w-9' : 'w-full',
          )}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <PanelLeft className="h-4 w-4" />
          ) : (
            <div className="flex items-center gap-2 w-full justify-center">
              <PanelLeftClose className="h-4 w-4" />
              <span className="text-xs">Collapse</span>
            </div>
          )}
        </motion.button>
      </div>
    </motion.aside>
  );
}
