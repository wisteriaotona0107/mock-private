import { HTMLAttributes } from 'react';
import { clsx } from 'clsx';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'pending' | 'progress' | 'done' | 'milestone';
}

export const Badge = ({ variant = 'pending', className, ...props }: BadgeProps) => {
  const styles = {
    pending: 'badge-pending',
    progress: 'badge-progress',
    done: 'badge-done',
    milestone: 'badge-milestone'
  };
  return <span className={clsx('badge', styles[variant], className)} {...props} />;
};
