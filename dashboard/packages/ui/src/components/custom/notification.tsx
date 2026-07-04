'use client';

import * as React from 'react';
import { Bell, X, Check, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

type NotificationType = 'info' | 'success' | 'warning' | 'error';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  timestamp: Date;
  read?: boolean;
}

interface NotificationBellProps extends React.HTMLAttributes<HTMLButtonElement> {
  count?: number;
  onOpen?: () => void;
}

const NotificationBell = React.forwardRef<HTMLButtonElement, NotificationBellProps>(
  ({ className, count = 0, onOpen, ...props }, ref) => (
    <button
      ref={ref}
      onClick={onOpen}
      className={cn('relative inline-flex items-center justify-center rounded-md p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-50', className)}
      {...props}
    >
      <Bell className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger-500 px-1 text-[10px] font-bold text-white">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  ),
);
NotificationBell.displayName = 'NotificationBell';

const typeIcons: Record<NotificationType, React.ReactNode> = {
  info: <Info className="h-4 w-4 text-primary-500" />,
  success: <Check className="h-4 w-4 text-success-500" />,
  warning: <AlertTriangle className="h-4 w-4 text-warning-500" />,
  error: <AlertCircle className="h-4 w-4 text-danger-500" />,
};

interface NotificationItemProps {
  notification: Notification;
  onDismiss?: (id: string) => void;
}

const NotificationItem = ({ notification, onDismiss }: NotificationItemProps) => (
  <div
    className={cn(
      'flex gap-3 border-b border-neutral-100 px-4 py-3 transition-colors last:border-0 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800/50',
      !notification.read && 'bg-primary-50/30 dark:bg-primary-900/10',
    )}
  >
    <div className="mt-0.5 shrink-0">{typeIcons[notification.type]}</div>
    <div className="flex-1 space-y-0.5">
      <p className="text-sm font-medium">{notification.title}</p>
      {notification.message && (
        <p className="text-xs text-neutral-500 dark:text-neutral-400">{notification.message}</p>
      )}
      <p className="text-[10px] text-neutral-400">
        {formatTimestamp(notification.timestamp)}
      </p>
    </div>
    {onDismiss && (
      <button
        onClick={() => onDismiss(notification.id)}
        className="shrink-0 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
      >
        <X className="h-3 w-3" />
      </button>
    )}
  </div>
);

function formatTimestamp(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

interface NotificationPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  notifications: Notification[];
  onDismiss?: (id: string) => void;
  onClearAll?: () => void;
}

const NotificationPanel = React.forwardRef<HTMLDivElement, NotificationPanelProps>(
  ({ className, notifications, onDismiss, onClearAll, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'w-80 overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-lg dark:border-neutral-700 dark:bg-neutral-900',
        className,
      )}
      {...props}
    >
      <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 dark:border-neutral-700">
        <h3 className="text-sm font-semibold">Notifications</h3>
        {onClearAll && notifications.length > 0 && (
          <button
            onClick={onClearAll}
            className="text-xs text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
          >
            Clear all
          </button>
        )}
      </div>
      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
            <Bell className="h-8 w-8 text-neutral-300 dark:text-neutral-600" />
            <p className="text-sm text-neutral-500">No notifications</p>
          </div>
        ) : (
          notifications.map((n) => (
            <NotificationItem key={n.id} notification={n} onDismiss={onDismiss} />
          ))
        )}
      </div>
    </div>
  ),
);
NotificationPanel.displayName = 'NotificationPanel';

export { NotificationBell, NotificationItem, NotificationPanel };
export type { Notification, NotificationType };
