import { ButtonHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', children, ...props }, ref) => {
    const base = 'focus-ring inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-semibold transition shadow-neon';
    const variants = {
      primary: 'bg-accent text-[#0B1020] hover:bg-accent/90',
      secondary: 'bg-success/20 text-success hover:bg-success/30',
      ghost: 'bg-transparent text-accent hover:bg-accent/10'
    };

    return (
      <button ref={ref} className={clsx(base, variants[variant], className)} {...props}>
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
