import { ReactNode } from 'react';

export function ControlBar({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-4 rounded-lg border border-slate-700 bg-surface px-4 py-3">{children}</div>;
}
