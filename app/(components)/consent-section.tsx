'use client';

import { useState } from 'react';
import { Badge } from './ui/badge';
import { Dropzone } from './dropzone';
import { Gallery } from './gallery';
import { Checkbox } from './ui/checkbox';

export function ConsentSection() {
  const [consent, setConsent] = useState(false);
  return (
    <div className="space-y-6">
      <section className="space-y-4">
        <Badge>Quick Demo</Badge>
        <h1 className="text-3xl font-bold text-white">10秒以内でカラー化するデモ</h1>
        <p className="text-gray-300">
          モノクロ写真をアップロードして「カラー化」をクリックするだけ。キャッシュ機能で同じ画像は一瞬で再利用します。
        </p>
      </section>
      <Checkbox id="consent" label="利用規約とプライバシーポリシーに同意します" checked={consent} onChange={setConsent} />
      <Dropzone consent={consent} />
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-gray-100">サンプルギャラリー</h2>
        <Gallery />
      </section>
    </div>
  );
}
