import './globals.css';
import { ReactNode } from 'react';
import { AppShell } from './(components)/app-shell';

export const metadata = {
  title: 'Quick Colorize',
  description: 'One-click grayscale colorization demo'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja" className="dark">
      <body className="bg-background text-textPrimary">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
