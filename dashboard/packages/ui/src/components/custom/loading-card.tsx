import { cn } from '../../lib/utils';

interface LoadingCardProps {
  className?: string;
  rows?: number;
}

export function LoadingCard({ className, rows = 3 }: LoadingCardProps) {
  return (
    <div className={cn('rounded-xl border border-border bg-surface p-6 shadow-sm', className)}>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-4 w-24 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
          <div className="h-4 w-16 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
        </div>
        <div className="h-8 w-32 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="h-3 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"
            style={{ width: `${70 + i * 10}%` }}
          />
        ))}
      </div>
    </div>
  );
}
