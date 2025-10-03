import { HTMLAttributes } from 'react';
import { clsx } from 'clsx';

export const Card = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={clsx(
      'neon-card relative overflow-hidden rounded-2xl border border-white/10 bg-surface/80 p-6 text-[#E6EDF8] shadow-neon',
      className
    )}
    {...props}
  />
);
