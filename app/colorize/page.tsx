'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SplitPane } from '../(components)/split-pane';
import { Button } from '../(components)/ui/button';
import { Toggle } from '../(components)/ui/toggle';
import { ControlBar } from '../(components)/control-bar';
import { Progress } from '../(components)/ui/progress';
import { CompareSlider } from '../(components)/compare-slider';
import { Badge } from '../(components)/ui/badge';
import { useToast } from '../(components)/toast-context';

interface ImageData {
  imageId: string;
  previewUrl: string;
  width: number;
  height: number;
  sha256: string;
}

interface ColorizeResponse {
  resultId: string;
  url: string;
  durationMs: number;
  cached: boolean;
}

export default function ColorizePage() {
  const params = useSearchParams();
  const router = useRouter();
  const { notify } = useToast();
  const imageId = params.get('imageId');
  const [image, setImage] = useState<ImageData | null>(null);
  const [result, setResult] = useState<ColorizeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [watermark, setWatermark] = useState(true);
  const [simpleLabel, setSimpleLabel] = useState(true);
  const [progress, setProgress] = useState(0);
  const [format, setFormat] = useState<'png' | 'jpeg'>('png');

  useEffect(() => {
    if (!imageId) return;
    fetch(`/api/uploads?imageId=${imageId}`, {
      headers: {
        'X-Requested-With': 'quick-colorize'
      }
    })
      .then((res) => {
        if (!res.ok) throw new Error('画像の取得に失敗しました');
        return res.json();
      })
      .then((data) => setImage(data))
      .catch(() => {
        notify('画像が見つかりません。', 'error');
        router.replace('/');
      });
  }, [imageId, notify, router]);

  useEffect(() => {
    if (!loading) return;
    const timer = setInterval(() => {
      setProgress((prev) => Math.min(100, prev + 10));
    }, 600);
    return () => clearInterval(timer);
  }, [loading]);

  const handleColorize = async () => {
    if (!imageId) return;
    setLoading(true);
    setProgress(10);
    try {
      const res = await fetch('/api/colorize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'quick-colorize'
        },
        body: JSON.stringify({
          imageId,
          options: {
            watermark,
            simpleLabel,
            format
          }
        })
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: 'カラー化に失敗しました' }));
        throw new Error(error.message);
      }
      const data = (await res.json()) as ColorizeResponse;
      setResult(data);
      notify(data.cached ? 'キャッシュ命中！' : 'カラー化が完了しました', 'success');
    } catch (error: any) {
      notify(error.message ?? '処理に失敗しました。', 'error');
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const compareUrls = useMemo(() => {
    if (!image || !result) return null;
    return {
      before: image.previewUrl,
      after: result.url
    };
  }, [image, result]);

  if (!imageId) {
    return <p className="text-sm text-gray-300">画像が指定されていません。</p>;
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">カラー化プレビュー</h1>
          <p className="text-sm text-gray-400">画像ID: {imageId}</p>
        </div>
        <Badge variant={result?.cached ? 'accent' : 'neutral'}>{result?.cached ? 'キャッシュ命中' : 'Quick Demo'}</Badge>
      </header>
      <SplitPane
        left={
          <div className="space-y-4">
            <div className="rounded-lg border border-slate-700 bg-surface p-3">
              {image ? (
                <img src={image.previewUrl} alt="カラー化前" className="w-full rounded" />
              ) : (
                <p className="text-sm text-gray-400">読み込み中...</p>
              )}
            </div>
            <div>
              <Button onClick={handleColorize} disabled={loading}>
                カラー化
              </Button>
            </div>
            {loading && <Progress value={progress} />}
          </div>
        }
        right={
          <div className="space-y-4">
            <div className="rounded-lg border border-slate-700 bg-surface p-3 min-h-[300px] flex items-center justify-center">
              {result ? (
                <img src={result.url} alt="カラー化後" className="w-full rounded" />
              ) : (
                <p className="text-sm text-gray-500">カラー化を実行してください</p>
              )}
            </div>
            {compareUrls && <CompareSlider beforeUrl={compareUrls.before} afterUrl={compareUrls.after} />}
          </div>
        }
      />
      <ControlBar>
        <Toggle id="toggle-watermark" label="Quick Demoウォーターマーク" checked={watermark} onChange={setWatermark} />
        <Toggle id="toggle-label" label="簡易ラベル" checked={simpleLabel} onChange={setSimpleLabel} />
        <div className="flex items-center gap-3 text-sm text-gray-300">
          <label htmlFor="format">フォーマット</label>
          <select
            id="format"
            value={format}
            onChange={(e) => setFormat(e.target.value as 'png' | 'jpeg')}
            className="rounded border border-slate-600 bg-slate-900 px-3 py-2 text-sm"
          >
            <option value="png">PNG</option>
            <option value="jpeg">JPEG</option>
          </select>
        </div>
      </ControlBar>
    </div>
  );
}
