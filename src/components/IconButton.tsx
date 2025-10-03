import { ButtonHTMLAttributes } from 'react';
import { clsx } from 'clsx';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

export const IconButton = ({ className, active = false, ...props }: IconButtonProps) => (
  <button
    className={clsx(
      'focus-ring rounded-xl border border-white/10 bg-white/5 p-2 text-white/70 transition hover:text-accent',
      active && 'border-accent/60 text-accent shadow-neon',
      className
    )}
    {...props}
  />
);
