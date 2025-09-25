import { DiagnosisForm } from '../../../components/DiagnosisForm';

export default function DiagnosisPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-accent">セルフ頭皮診断</h2>
        <p className="mt-2 text-sm text-slate-300">
          約5分で完了します。途中保存はアカウント作成後に対応予定です（MVPではモック）。
        </p>
      </div>
      <DiagnosisForm />
    </div>
  );
}
