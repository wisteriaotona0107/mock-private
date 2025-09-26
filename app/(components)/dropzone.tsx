'use client';

import { useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from './toast-context';
import { Button } from './ui/button';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png'];

export function Dropzone({ consent }: { consent: boolean }) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { notify } = useToast();

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      if (!consent) {
        notify('利用規約に同意してください。', 'error');
        return;
      }
      const file = files[0];
      if (!ACCEPTED_TYPES.includes(file.type)) {
        notify('JPEG/PNGのみ対応しています。', 'error');
        return;
      }
      if (file.size > 8 * 1024 * 1024) {
        notify('ファイルサイズは8MB以下にしてください。', 'error');
        return;
      }
      const formData = new FormData();
      formData.append('file', file);
      try {
        const res = await fetch('/api/uploads', {
          method: 'POST',
          body: formData,
          headers: {
            'X-Requested-With': 'quick-colorize'
          }
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({ message: 'アップロードに失敗しました。' }));
          notify(err.message || 'アップロードに失敗しました。', 'error');
          return;
        }
        const data = await res.json();
        router.push(`/colorize?imageId=${data.imageId}`);
      } catch (error) {
        notify('ネットワークエラーが発生しました。', 'error');
      }
    },
    [consent, notify, router]
  );

  return (
    <div
      className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-20 transition-colors ${dragActive ? 'border-accent bg-accent/10' : 'border-slate-600 bg-surface/60'}`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragActive(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setDragActive(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setDragActive(false);
        handleFiles(e.dataTransfer?.files ?? null);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        className="sr-only"
        onChange={(e) => handleFiles(e.target.files)}
        capture="environment"
      />
      <p className="text-lg font-semibold text-gray-200">ファイルをドラッグ & ドロップ</p>
      <p className="mt-2 text-sm text-gray-400">JPEG/PNG ・ 長辺2000px以下 ・ 8MB以下</p>
      <div className="mt-6 flex flex-col sm:flex-row gap-4">
        <Button onClick={() => inputRef.current?.click()}>アップロード</Button>
        <Button
          type="button"
          variant="secondary"
          onClick={async () => {
            if (!inputRef.current) return;
            inputRef.current.setAttribute('capture', 'environment');
            inputRef.current.click();
          }}
        >
          カメラで撮影
        </Button>
      </div>
    </div>
  );
}
