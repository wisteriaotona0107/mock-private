import { ReactNode, useEffect } from 'react';
import { useUIStore } from '../stores/ui';

interface Props {
  children: ReactNode;
}

export const UIProvider = ({ children }: Props) => {
  const theme = useUIStore((state) => state.theme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.remove('neon');
      root.classList.add('dark');
    } else {
      root.classList.add('neon');
      root.classList.add('dark');
    }
  }, [theme]);

  return <>{children}</>;
};
