import clsx from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'accent' | 'neutral';
  className?: string;
}

export function Badge({ children, variant = 'accent', className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide',
        variant === 'accent' ? 'bg-accent/20 text-accent' : 'bg-slate-700 text-gray-200',
        className
      )}
    >
      {children}
    </span>
  );
}
