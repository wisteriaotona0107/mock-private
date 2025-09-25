import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ResultRadar } from '../../../../components/ResultRadar';
import { apiFetch } from '../../../../lib/api';

type DiagnosisDetail = {
  id: string;
  scores: Record<string, number>;
  labels: string[];
  recommendations: { productId: string; score: number; reason: string }[];
  medicalReferral: boolean;
};

export default async function DiagnosisResultPage({ searchParams }: { searchParams: { id?: string } }) {
  const id = searchParams.id;
  if (!id) {
    notFound();
  }
  const diagnosis = await apiFetch<DiagnosisDetail>(`/diagnoses/${id}`);

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="text-2xl font-semibold text-accent">診断結果</h2>
        <p className="mt-2 text-sm text-slate-300">主要ラベル: {diagnosis.labels.join(', ')}</p>
        {diagnosis.medicalReferral && (
          <div className="mt-4 rounded-md border border-warning bg-slate-950/60 p-4 text-warning">
            強い炎症・出血が確認されたため、専門医への受診を推奨します。
          </div>
        )}
        <div className="mt-6 bg-slate-950/40 p-4">
          <ResultRadar scores={diagnosis.scores} />
        </div>
      </section>
      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-accent">おすすめケア用品</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {diagnosis.recommendations.map((item) => (
            <article key={item.productId} className="rounded-lg border border-slate-800 bg-slate-900 p-4">
              <h4 className="font-semibold">商品ID: {item.productId}</h4>
              <p className="mt-1 text-sm text-slate-300">スコア: {item.score.toFixed(1)}%</p>
              <p className="mt-2 text-xs text-slate-400">理由: {item.reason}</p>
              <div className="mt-3 flex gap-2">
                <Link
                  href={`/products?id=${item.productId}`}
                  className="text-sm text-accent underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
                >
                  詳細を見る
                </Link>
                <Link
                  href={`/compare?add=${item.productId}`}
                  className="text-sm text-slate-300 underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-600"
                >
                  比較に追加
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
