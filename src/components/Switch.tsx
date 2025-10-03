import { ButtonHTMLAttributes } from 'react';
import { clsx } from 'clsx';

interface SwitchProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export const Switch = ({ checked, onCheckedChange, className, ...props }: SwitchProps) => {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={clsx(
        'focus-ring relative h-8 w-14 rounded-full border border-white/10 px-1 transition',
        checked ? 'bg-accent/80' : 'bg-white/10',
        className
      )}
      {...props}
    >
      <span
        className={clsx(
          'absolute top-1 left-1 h-6 w-6 rounded-full bg-white transition-transform',
          checked ? 'translate-x-6' : 'translate-x-0'
        )}
      />
    </button>
  );
};
