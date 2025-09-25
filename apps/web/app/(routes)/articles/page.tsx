const articles = [
  { slug: 'spring-care', title: '春の皮脂コントロール術', excerpt: '花粉と皮脂のダブルケアで春を快適に。' },
  { slug: 'thirties-care', title: '30代男性の薄毛予防', excerpt: '生活習慣と頭皮ケアの両輪で攻める。' },
  { slug: 'fifties-female', title: '50代女性のボリュームケア', excerpt: 'ホルモンバランスに寄り添う習慣づくり。' },
];

export default function ArticlesPage() {
  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold text-accent">記事・コラム</h2>
        <p className="mt-2 text-sm text-slate-300">CMS機能は管理画面から利用できます（MVPでは静的データ）。</p>
      </header>
      <div className="space-y-4">
        {articles.map((article) => (
          <article key={article.slug} className="rounded-lg border border-slate-800 bg-slate-900 p-4">
            <h3 className="text-lg font-semibold">{article.title}</h3>
            <p className="mt-2 text-sm text-slate-300">{article.excerpt}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
