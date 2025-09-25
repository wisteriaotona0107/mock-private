'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { diagnosisRequestSchema, DiagnosisRequest } from '@scalp-care/shared';
import { apiFetch } from '../lib/api';

const questions = [
  { code: 'Q1', text: '頭皮のベタつき具合', options: ['低い', '普通', '高い'] },
  { code: 'Q2', text: '乾燥やかゆみ', options: ['なし', '時々', '頻繁'] },
  { code: 'Q3', text: '炎症や赤み', options: ['なし', '軽度', '強い'] },
  { code: 'Q4', text: '抜け毛の頻度', options: ['少ない', '普通', '多い'] },
  { code: 'Q5', text: '生活習慣の乱れ', options: ['少ない', '普通', '多い'] },
  { code: 'Q6', text: 'ストレスレベル', options: ['低い', '普通', '高い'] },
  { code: 'Q7', text: '出血や急な痛み', options: ['なし', 'まれに', '頻繁'] },
  { code: 'Q8', text: 'フケの量', options: ['少ない', '普通', '多い'] },
];

type FormValues = {
  age: number;
  sex: 'male' | 'female' | 'other';
  answers: Record<string, string>;
};

export function DiagnosisForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      age: 35,
      sex: 'male',
      answers: {},
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true);
    try {
      const payload: DiagnosisRequest = {
        profile: { age: values.age, sex: values.sex, season: undefined },
        answers: questions.map((q) => ({ questionCode: q.code, value: values.answers[q.code] ?? '普通' })),
        filters: {},
      };
      diagnosisRequestSchema.parse(payload);
      const response = await apiFetch<{ id: string }>('/diagnoses', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      router.push(`/diagnosis/result?id=${response.id}`);
    } catch (error) {
      console.error('diagnosis failed', error);
      alert('診断の送信に失敗しました');
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="text-sm text-slate-300">年齢</span>
          <input
            type="number"
            className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
            {...register('age', { valueAsNumber: true, min: 10, max: 90 })}
          />
          {errors.age && <span className="text-xs text-warning">年齢を正しく入力してください</span>}
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm text-slate-300">性別</span>
          <select
            className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
            {...register('sex')}
          >
            <option value="male">男性</option>
            <option value="female">女性</option>
            <option value="other">その他</option>
          </select>
        </label>
      </div>
      <div className="space-y-4">
        {questions.map((q, index) => (
          <div key={q.code} className="rounded-lg border border-slate-800 bg-slate-900 p-4">
            <div className="flex items-center justify-between text-sm text-slate-400">
              <span>
                質問 {index + 1} / {questions.length}
              </span>
              <div className="h-1 w-32 overflow-hidden rounded-full bg-slate-800">
                <div className="h-full bg-accent" style={{ width: `${((index + 1) / questions.length) * 100}%` }} />
              </div>
            </div>
            <p className="mt-3 text-base text-slate-100">{q.text}</p>
            <div className="mt-4 grid gap-2 md:grid-cols-3">
              {q.options.map((option) => (
                <label key={option} className="flex items-center gap-2 rounded-md border border-slate-700 bg-slate-800 px-3 py-2">
                  <input
                    type="radio"
                    value={option}
                    {...register(`answers.${q.code}` as const, { required: true })}
                    className="h-4 w-4"
                  />
                  <span className="text-sm">{option}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-md bg-accent px-4 py-2 text-slate-950 font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:opacity-50"
      >
        {submitting ? '診断中...' : '診断結果を見る'}
      </button>
    </form>
  );
}
