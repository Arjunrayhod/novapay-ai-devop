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
  PanelLeftClose,
  PanelLeft,
  type LucideIcon,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '../../lib/utils';

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  shortcut?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'environment', label: 'Environment', icon: Cloud },
  { id: 'docker', label: 'Docker', icon: Container },
  { id: 'kubernetes', label: 'Kubernetes', icon: Sailboat },
  { id: 'helm', label: 'Helm', icon: ShipWheel },
  { id: 'terraform', label: 'Terraform', icon: Hexagon },
  { id: 'github', label: 'GitHub', icon: GitBranch },
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
    <aside
      className={cn(
        'glass-sidebar dark:glass-sidebar-dark flex h-screen flex-col transition-all duration-300 ease-out',
        collapsed ? 'w-14' : 'w-60',
      )}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className={cn('flex h-14 items-center border-b border-border/50', collapsed ? 'justify-center px-2' : 'px-4')}>
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary-400 to-accent-400 text-[10px] font-bold text-white shadow-glow-primary">
              A
            </div>
            <span className="text-sm font-semibold tracking-tight">AegisAI</span>
          </div>
        )}
        {collapsed && (
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary-400 to-accent-400 text-[10px] font-bold text-white shadow-glow-primary">
            A
          </div>
        )}
      </div>

      <nav
        ref={navRef}
        className="flex-1 overflow-y-auto px-2 py-3 scrollbar-thin dark:scrollbar-thin-dark"
        onKeyDown={handleKeyDown}
        role="menubar"
        aria-orientation="vertical"
      >
        <ul role="menu" className="flex flex-col gap-0.5">
          {NAV_ITEMS.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;
            const isFocused = focusedIndex === index;
            return (
              <li key={item.id} role="none">
                <button
                  data-nav-item
                  role="menuitem"
                  tabIndex={isFocused ? 0 : -1}
                  aria-current={isActive ? 'page' : undefined}
                  onClick={() => onNavigate?.(item.id)}
                  onFocus={() => setFocusedIndex(index)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50',
                    collapsed && 'justify-center px-0',
                    isActive
                      ? 'bg-primary-500/10 text-primary-600 dark:bg-primary-500/15 dark:text-primary-400'
                      : 'text-neutral-600 hover:bg-neutral-100/80 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800/50 dark:hover:text-neutral-200',
                  )}
                >
                  <Icon className={cn('h-4.5 w-4.5 shrink-0', isActive && 'text-primary-500 dark:text-primary-400')} />
                  {!collapsed && (
                    <span className="truncate">{item.label}</span>
                  )}
                  {!collapsed && item.shortcut && (
                    <kbd className="ml-auto hidden text-[10px] text-neutral-400 lg:inline">{item.shortcut}</kbd>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="flex items-center justify-center border-t border-border/50 p-2">
        <button
          onClick={onToggle}
          className="flex items-center justify-center rounded-lg p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 dark:hover:bg-neutral-800/50 dark:hover:text-neutral-300"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>
    </aside>
  );
}
