'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { useToast } from './toast-context';

interface DownloadButtonsProps {
  resultId: string;
}

export function DownloadButtons({ resultId }: DownloadButtonsProps) {
  const [loading, setLoading] = useState(false);
  const { notify } = useToast();

  const download = async (format: 'png' | 'jpeg') => {
    setLoading(true);
    try {
      const res = await fetch(`/api/results/${resultId}?format=${format}`, {
        headers: {
          'X-Requested-With': 'quick-colorize'
        }
      });
      if (!res.ok) throw new Error('ダウンロードURLの取得に失敗しました');
      const { url } = await res.json();
      window.location.href = url;
      notify('ダウンロードリンクを発行しました', 'success');
    } catch (error) {
      notify('ダウンロードに失敗しました', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-3">
      <Button onClick={() => download('png')} disabled={loading}>
        PNGをダウンロード
      </Button>
      <Button variant="secondary" onClick={() => download('jpeg')} disabled={loading}>
        JPEGをダウンロード
      </Button>
    </div>
  );
}
