export function Footer() {
  return (
    <footer className="bg-surface border-t border-slate-800 text-xs text-gray-400">
      <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <p>© {new Date().getFullYear()} Quick Colorize Demo</p>
        <div className="flex gap-4">
          <a href="/terms" className="hover:text-white focus-ring">
            利用規約
          </a>
          <a href="/privacy" className="hover:text-white focus-ring">
            プライバシー
          </a>
        </div>
      </div>
    </footer>
  );
}
