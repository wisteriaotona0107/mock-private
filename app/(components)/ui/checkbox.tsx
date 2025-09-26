'use client';

import clsx from 'clsx';

interface CheckboxProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}

export function Checkbox({ id, label, checked, onChange }: CheckboxProps) {
  return (
    <label htmlFor={id} className="flex items-start gap-3 text-sm text-gray-200">
      <input
        id={id}
        type="checkbox"
        className="mt-1 h-4 w-4 rounded border border-slate-500 bg-slate-800 text-accent focus:ring-emphasis"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>{label}</span>
    </label>
  );
}
