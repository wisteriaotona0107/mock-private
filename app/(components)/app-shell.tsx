'use client';

import Link from 'next/link';
import { ReactNode, useState } from 'react';
import { Footer } from './footer';
import { ToastProvider } from './toast-context';

export function AppShell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <ToastProvider>
      <div className="min-h-screen flex flex-col bg-background text-textPrimary">
        <header className="bg-surface border-b border-slate-800">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/" className="text-xl font-semibold text-accent focus-ring">
              Quick Colorize
            </Link>
            <nav className="hidden md:flex gap-6 text-sm text-gray-300">
              <Link href="/privacy" className="hover:text-white focus-ring">
                プライバシー
              </Link>
              <Link href="/terms" className="hover:text-white focus-ring">
                利用規約
              </Link>
              <Link href="/pro-request" className="hover:text-white focus-ring">
                高画質仕上げ
              </Link>
            </nav>
            <button
              type="button"
              className="md:hidden text-gray-300 focus-ring"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={() => setMenuOpen((prev) => !prev)}
            >
              <span className="sr-only">メニュー</span>
              ☰
            </button>
          </div>
          {menuOpen && (
            <div id="mobile-menu" className="md:hidden px-6 pb-4 flex flex-col gap-3 text-sm text-gray-300">
              <Link href="/privacy" className="hover:text-white focus-ring">
                プライバシー
              </Link>
              <Link href="/terms" className="hover:text-white focus-ring">
                利用規約
              </Link>
              <Link href="/pro-request" className="hover:text-white focus-ring">
                高画質仕上げ
              </Link>
            </div>
          )}
        </header>
        <main className="flex-1">
          <div className="max-w-6xl mx-auto px-6 py-8">{children}</div>
        </main>
        <Footer />
      </div>
    </ToastProvider>
  );
}
