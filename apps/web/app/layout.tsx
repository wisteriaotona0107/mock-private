import './globals.css';
import type { Metadata } from 'next';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: '頭皮ケア診断MVP',
  description: 'セルフ頭皮診断とおすすめケアを提供するMVP',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className="dark">
      <body className="bg-slate-950 text-slate-100">
        <Providers>
          <div className="min-h-screen flex flex-col">
            <header className="border-b border-slate-800 px-6 py-4">
              <h1 className="text-xl font-semibold text-accent">頭皮ケアナビ</h1>
            </header>
            <main className="flex-1 px-6 py-8">{children}</main>
            <footer className="border-t border-slate-800 px-6 py-4 text-xs text-slate-400">
              &copy; {new Date().getFullYear()} 頭皮ケアナビ
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
