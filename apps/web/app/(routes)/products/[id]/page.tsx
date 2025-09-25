import { notFound } from 'next/navigation';
import { apiFetch } from '../../../../lib/api';

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = await apiFetch<any>(`/products?id=${params.id}`);
  if (!product || product.length === 0) {
    notFound();
  }
  const detail = product[0];
  return (
    <article className="mx-auto max-w-3xl space-y-4 rounded-xl border border-slate-800 bg-slate-900 p-6">
      <header>
        <h2 className="text-2xl font-semibold text-accent">{detail.name}</h2>
        <p className="mt-2 text-sm text-slate-300">カテゴリ: {detail.category}</p>
      </header>
      <p className="text-sm text-slate-300">税込価格: {detail.price} 円</p>
      <section>
        <h3 className="text-lg font-semibold text-accent">主要成分</h3>
        <pre className="mt-2 whitespace-pre-wrap rounded-md bg-slate-950/60 p-4 text-xs text-slate-300">
          {JSON.stringify(detail.ingredients, null, 2)}
        </pre>
      </section>
      <section>
        <h3 className="text-lg font-semibold text-accent">タグ</h3>
        <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-400">
          {detail.tags?.map((tag: any) => (
            <span key={tag.tag.name} className="rounded-full bg-slate-800 px-2 py-1">
              #{tag.tag.name}
            </span>
          ))}
        </div>
      </section>
    </article>
  );
}
