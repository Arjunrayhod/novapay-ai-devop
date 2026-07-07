'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '../../lib/utils';
import { Sidebar } from './sidebar';
import { Navbar } from './navbar';

const NAV_ROUTES: Record<string, string> = {
  dashboard: '/',
  environment: '/environment',
  'dev-experience': '/dev-experience',
  docker: '/docker',
  kubernetes: '/kubernetes',
  helm: '/helm',
  terraform: '/terraform',
  github: '/github',
  integrations: '/integrations',
  security: '/security',
  monitoring: '/observability',
  logs: '/observability',
  registry: '/registry',
  vault: '/vault',
  'ai-assistant': '/ai',
  settings: '/settings',
};

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeItem?: string;
  onNavigate?: (id: string) => void;
  rightPanel?: React.ReactNode;
  healthStatus?: 'healthy' | 'warning' | 'critical';
  healthScore?: number;
}

export function DashboardLayout({ children, activeItem, onNavigate, rightPanel, healthStatus, healthScore }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const router = useRouter();

  const handleToggle = useCallback(() => {
    setSidebarCollapsed((prev) => !prev);
  }, []);

  const handleNavigate = useCallback((id: string) => {
    if (onNavigate) {
      onNavigate(id);
    } else {
      const route = NAV_ROUTES[id];
      if (route) {
        router.push(route);
      }
    }
  }, [onNavigate, router]);

  return (
    <div className="flex h-screen overflow-hidden gemini-border" style={{ backgroundColor: 'var(--color-page-bg)' }}>
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={handleToggle}
        activeItem={activeItem}
        onNavigate={handleNavigate}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar healthStatus={healthStatus} healthScore={healthScore} />

        <main
          className={cn(
            'flex-1 overflow-y-auto',
            'scrollbar-thin-dark',
          )}
        >
          <div className={cn(
            'flex',
            rightPanel ? 'gap-0' : '',
          )}>
            <div className="flex-1 min-w-0">
              {children}
            </div>
            {rightPanel && (
              <aside className="hidden xl:block w-80 shrink-0 border-l" style={{ borderColor: 'var(--color-border-light)' }}>
                {rightPanel}
              </aside>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
