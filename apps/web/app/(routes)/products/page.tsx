import Link from 'next/link';
import { apiFetch } from '../../../lib/api';

type Product = {
  id: string;
  name: string;
  category: string;
  price: string;
  tags: { tag: { name: string } }[];
};

export default async function ProductsPage() {
  const products = await apiFetch<Product[]>('/products');
  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold text-accent">ケア用品一覧</h2>
        <p className="mt-2 text-sm text-slate-300">価格帯やタグでフィルタリングできる検索UIは今後追加予定です。</p>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        {products.map((product) => (
          <article key={product.id} className="rounded-lg border border-slate-800 bg-slate-900 p-4">
            <h3 className="text-lg font-semibold">{product.name}</h3>
            <p className="text-sm text-slate-400">カテゴリ: {product.category}</p>
            <p className="mt-2 text-sm text-slate-300">税込価格: {product.price} 円</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-400">
              {product.tags.map((tag) => (
                <span key={tag.tag.name} className="rounded-full bg-slate-800 px-2 py-1">
                  #{tag.tag.name}
                </span>
              ))}
            </div>
            <Link
              href={`/products/${product.id}`}
              className="mt-4 inline-block text-sm text-accent underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
            >
              詳細を見る
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
