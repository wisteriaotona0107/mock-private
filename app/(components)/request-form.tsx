'use client';

import { FormEvent, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from './ui/button';
import { useToast } from './toast-context';

export function RequestForm() {
  const params = useSearchParams();
  const defaultImageId = params.get('imageId') ?? '';
  const [email, setEmail] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const { notify } = useToast();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    try {
      const res = await fetch('/api/pro-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'quick-colorize'
        },
        body: JSON.stringify({
          contactEmail: formData.get('contactEmail'),
          note: formData.get('note'),
          imageId: formData.get('imageId')
        })
      });
      if (!res.ok) throw new Error('送信に失敗しました');
      notify('お問い合わせを受け付けました。', 'success');
      setEmail('');
      setNote('');
    } catch (error) {
      notify('送信に失敗しました。', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" aria-label="プロ向けリクエストフォーム">
      <input type="hidden" name="imageId" defaultValue={defaultImageId} />
      <div>
        <label className="block text-sm font-medium text-gray-200" htmlFor="contactEmail">
          メールアドレス
        </label>
        <input
          id="contactEmail"
          name="contactEmail"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-md border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-gray-100 focus:ring-emphasis"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-200" htmlFor="note">
          メモ（任意）
        </label>
        <textarea
          id="note"
          name="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          className="mt-1 w-full rounded-md border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-gray-100 focus:ring-emphasis"
        />
      </div>
      <Button type="submit" disabled={loading}>
        送信する
      </Button>
    </form>
  );
}
