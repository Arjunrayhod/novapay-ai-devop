'use client';

import * as React from 'react';
import { cn } from '../../lib/utils';

interface SidebarContextValue {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const SidebarContext = React.createContext<SidebarContextValue | undefined>(undefined);

function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) throw new Error('useSidebar must be used within a SidebarProvider');
  return context;
}

const SidebarProvider = ({
  children,
  defaultCollapsed = false,
}: {
  children: React.ReactNode;
  defaultCollapsed?: boolean;
}) => {
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed);
  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
};

const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { collapsible?: boolean }
>(({ className, collapsible = true, ...props }, ref) => {
  const { collapsed } = useSidebar();
  return (
    <div
      ref={ref}
      className={cn(
        'flex h-full flex-col border-r border-neutral-200 bg-white transition-all duration-200 dark:border-neutral-700 dark:bg-neutral-900',
        collapsible && (collapsed ? 'w-16' : 'w-64'),
        className,
      )}
      {...props}
    />
  );
});
Sidebar.displayName = 'Sidebar';

const SidebarHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex h-14 items-center border-b border-neutral-200 px-4 dark:border-neutral-700', className)}
      {...props}
    />
  ),
);
SidebarHeader.displayName = 'SidebarHeader';

const SidebarContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex-1 overflow-y-auto py-2', className)} {...props} />
  ),
);
SidebarContent.displayName = 'SidebarContent';

const SidebarFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex border-t border-neutral-200 p-4 dark:border-neutral-700', className)}
      {...props}
    />
  ),
);
SidebarFooter.displayName = 'SidebarFooter';

const SidebarItem = React.forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement> & { active?: boolean }
>(({ className, active, ...props }, ref) => {
  const { collapsed } = useSidebar();
  return (
    <a
      ref={ref}
      className={cn(
        'flex items-center gap-3 px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-50',
        active && 'bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-50',
        collapsed && 'justify-center px-2',
        className,
      )}
      {...props}
    />
  );
});
SidebarItem.displayName = 'SidebarItem';

const SidebarLabel = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => {
  const { collapsed } = useSidebar();
  if (collapsed) return null;
  return <span className={cn('truncate', className)} {...props} />;
};

const SidebarToggle = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, ...props }, ref) => {
    const { collapsed, setCollapsed } = useSidebar();
    return (
      <button
        ref={ref}
        onClick={() => setCollapsed(!collapsed)}
        className={cn(
          'inline-flex items-center justify-center rounded-md p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-50',
          className,
        )}
        {...props}
      />
    );
  },
);
SidebarToggle.displayName = 'SidebarToggle';

export {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarItem,
  SidebarLabel,
  SidebarToggle,
  SidebarProvider,
  useSidebar,
};
