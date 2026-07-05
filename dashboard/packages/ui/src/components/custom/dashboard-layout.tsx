'use client';

import { useState, useCallback } from 'react';
import { cn } from '../../lib/utils';
import { Sidebar } from './sidebar';
import { Navbar } from './navbar';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeItem?: string;
  onNavigate?: (id: string) => void;
  rightPanel?: React.ReactNode;
}

export function DashboardLayout({ children, activeItem, onNavigate, rightPanel }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleToggle = useCallback(() => {
    setSidebarCollapsed((prev) => !prev);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={handleToggle}
        activeItem={activeItem}
        onNavigate={onNavigate}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar />

        <main
          className={cn(
            'flex-1 overflow-y-auto',
            'scrollbar-thin dark:scrollbar-thin-dark',
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
              <aside className="hidden xl:block w-80 shrink-0 border-l border-border/50">
                {rightPanel}
              </aside>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
