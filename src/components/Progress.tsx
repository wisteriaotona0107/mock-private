import { HTMLAttributes } from 'react';
import { clsx } from 'clsx';

interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
}

export const Progress = ({ value, className, ...props }: ProgressProps) => {
  return (
    <div className={clsx('w-full rounded-full bg-white/10 p-1', className)} {...props}>
      <div
        className="h-2 w-full rounded-full bg-accent"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(value)}
      />
    </div>
  );
};
