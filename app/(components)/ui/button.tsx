import { ButtonHTMLAttributes, DetailedHTMLProps } from 'react';
import clsx from 'clsx';

interface ButtonProps extends DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
}

export function Button({ className, variant = 'primary', ...props }: ButtonProps) {
  const base = 'focus-ring inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  const variants: Record<typeof variant, string> = {
    primary: 'bg-accent text-black hover:bg-emerald-400',
    secondary: 'bg-slate-700 text-white hover:bg-slate-600',
    ghost: 'bg-transparent text-gray-300 hover:bg-slate-800'
  } as const;

  return <button className={clsx(base, variants[variant], className)} {...props} />;
}
