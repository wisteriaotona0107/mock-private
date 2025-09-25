import { apiFetch } from '../../../lib/api';

type RuleSet = {
  id: string;
  version: string;
  title: string;
  active: boolean;
};

export default async function AdminPage() {
  let ruleSets: RuleSet[] = [];
  try {
    ruleSets = await apiFetch<RuleSet[]>('/admin/rule-sets');
  } catch (error) {
    ruleSets = [];
  }
  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold text-accent">管理ダッシュボード</h2>
        <p className="mt-2 text-sm text-slate-300">ここからルールセットを確認しアクティブ化できます（要管理者権限）。</p>
      </header>
      <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
        {ruleSets.length === 0 ? (
          <p className="text-sm text-slate-300">権限がないか、ルールセットが未登録です。</p>
        ) : (
          <table className="w-full text-left text-sm text-slate-300">
            <thead>
              <tr className="text-slate-400">
                <th className="py-2">バージョン</th>
                <th className="py-2">タイトル</th>
                <th className="py-2">状態</th>
              </tr>
            </thead>
            <tbody>
              {ruleSets.map((rule) => (
                <tr key={rule.id} className="border-t border-slate-800">
                  <td className="py-2">{rule.version}</td>
                  <td className="py-2">{rule.title}</td>
                  <td className="py-2">{rule.active ? 'アクティブ' : '待機'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
