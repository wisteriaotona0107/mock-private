import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getSignedUrl, extractKeyFromUrl } from '@/lib/storage';
import { DownloadButtons } from '../../(components)/download-buttons';
import { MetaPanel } from '../../(components)/meta-panel';
import { Badge } from '../../(components)/ui/badge';

async function loadResult(id: string) {
  const result = await prisma.result.findUnique({ where: { id }, include: { image: { include: { jobs: { orderBy: { created_at: 'desc' }, take: 1 } } } } });
  if (!result) return null;
  const signed = await getSignedUrl(extractKeyFromUrl(result.result_url));
  return {
    id: result.id,
    url: signed,
    sha256: result.image.sha256,
    modelName: result.image.jobs[0]?.model_name ?? 'opencv-colorization',
    durationMs: result.image.jobs[0]?.duration ?? 0,
    imageId: result.image.id,
    cached: false
  };
}

export default async function ResultPage({ params }: { params: { id: string } }) {
  const result = await loadResult(params.id);
  if (!result) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">カラー化結果</h1>
          <p className="text-sm text-gray-400">結果ID: {params.id}</p>
        </div>
        <Badge>{result.cached ? 'キャッシュ済み' : '新規生成'}</Badge>
      </header>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-lg border border-slate-700 bg-surface p-4">
          <img src={result.url} alt="カラー化結果" className="w-full rounded" />
        </div>
        <div className="space-y-6">
          <MetaPanel
            entries={[
              { label: 'ハッシュ', value: result.sha256 },
              { label: 'モデル', value: result.modelName },
              { label: '処理時間', value: `${result.durationMs}ms` }
            ]}
          />
          <DownloadButtons resultId={params.id} />
          <a
            href={`/pro-request?imageId=${result.imageId}`}
            className="block rounded-lg border border-accent/40 bg-accent/10 px-4 py-3 text-sm text-accent"
          >
            高画質仕上げは持ち帰り処理へ
          </a>
        </div>
      </div>
    </div>
  );
}
