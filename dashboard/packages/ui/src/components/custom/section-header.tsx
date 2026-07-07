import { cn } from '../../lib/utils';

interface SectionHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function SectionHeader({ title, description, action, className }: SectionHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between gap-4', className)}>
      <div className="space-y-0.5">
        <h2 className="text-base font-semibold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
          {title}
        </h2>
        {description && (
          <p className="text-sm text-neutral-400">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
