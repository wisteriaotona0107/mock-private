export default function MyPage() {
  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold text-accent">マイページ</h2>
        <p className="mt-2 text-sm text-slate-300">
          ログイン済みユーザーはここで診断履歴やルーティン進捗を確認できます（現在はダミー表示）。
        </p>
      </header>
      <section className="rounded-lg border border-slate-800 bg-slate-900 p-4">
        <h3 className="text-lg font-semibold">最近の診断</h3>
        <ul className="mt-2 space-y-2 text-sm text-slate-300">
          <li>2024-02-01 Oily (推奨3件)</li>
          <li>2024-01-12 Dry (推奨2件)</li>
        </ul>
      </section>
      <section className="rounded-lg border border-slate-800 bg-slate-900 p-4">
        <h3 className="text-lg font-semibold">ルーティン達成率</h3>
        <p className="mt-2 text-sm text-slate-300">週次 75% / 月次 68%</p>
        <p className="mt-1 text-xs text-slate-400">通知はMVPではダミー実装です。</p>
      </section>
    </div>
  );
}
