'use client';

import clsx from 'clsx';

interface ToggleProps {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  id: string;
}

export function Toggle({ checked, onChange, label, id }: ToggleProps) {
  return (
    <label htmlFor={id} className="flex items-center gap-3 cursor-pointer text-sm text-gray-200">
      <span>{label}</span>
      <span
        className={clsx(
          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-ring',
          checked ? 'bg-accent/80' : 'bg-slate-600'
        )}
      >
        <input
          id={id}
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span
          className={clsx(
            'inline-block h-5 w-5 transform rounded-full bg-white transition-transform',
            checked ? 'translate-x-5' : 'translate-x-1'
          )}
        />
      </span>
    </label>
  );
}
