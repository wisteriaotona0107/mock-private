import Link from 'next/link';

const highlights = [
  { title: 'セルフ頭皮診断', description: '8-12問の設問で現在の頭皮状態を可視化します。' },
  { title: 'パーソナライズ推薦', description: 'ルールセットとアルゴリズムに基づき最適なケア用品を提案します。' },
  { title: 'ルーティン管理', description: 'ケア習慣の登録とチェックインで改善状況を追跡します。' },
];

export default function HomePage() {
  return (
    <div className="space-y-8">
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-xl">
        <h2 className="text-2xl font-semibold">あなたの頭皮状態を可視化し最適なケアへ</h2>
        <p className="mt-4 text-slate-300">
          季節や生活習慣まで考慮した多軸スコアリングで、現状を把握し次の一手を明確にします。
        </p>
        <div className="mt-6 flex gap-4">
          <Link
            href="/diagnosis"
            className="rounded-md bg-accent px-5 py-2 text-slate-950 font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
          >
            診断を始める
          </Link>
          <Link
            href="/products"
            className="rounded-md border border-slate-700 px-5 py-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-600"
          >
            ケア用品を探す
          </Link>
        </div>
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        {highlights.map((item) => (
          <div key={item.title} className="rounded-lg border border-slate-800 bg-slate-900 p-6">
            <h3 className="text-lg font-medium text-accent">{item.title}</h3>
            <p className="mt-2 text-sm text-slate-300">{item.description}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
