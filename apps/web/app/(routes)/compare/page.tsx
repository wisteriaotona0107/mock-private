import { ResultRadar } from '../../../components/ResultRadar';

const mockScores = {
  productA: { 効果: 80, 低刺激: 70, エビデンス: 90, レビュー: 75, コスパ: 60 },
  productB: { 効果: 60, 低刺激: 85, エビデンス: 65, レビュー: 80, コスパ: 70 },
};

export default function ComparePage() {
  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold text-accent">比較レーダーチャート</h2>
        <p className="mt-2 text-sm text-slate-300">
          ログイン後に比較リストへ商品を追加すると、最大4件までのレーダーチャートと一覧比較が表示されます（現在はモックデータ）。
        </p>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        {Object.entries(mockScores).map(([name, scores]) => (
          <div key={name} className="rounded-lg border border-slate-800 bg-slate-900 p-4">
            <h3 className="text-lg font-semibold">{name}</h3>
            <ResultRadar scores={scores} />
          </div>
        ))}
      </div>
      <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="text-slate-400">
            <tr>
              <th className="py-2">項目</th>
              <th className="py-2">効果</th>
              <th className="py-2">低刺激</th>
              <th className="py-2">エビデンス</th>
              <th className="py-2">レビュー</th>
              <th className="py-2">コスパ</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(mockScores).map(([name, scores]) => (
              <tr key={name} className="border-t border-slate-800">
                <td className="py-2 font-semibold text-slate-100">{name}</td>
                {Object.values(scores).map((value, idx) => (
                  <td key={idx} className="py-2">
                    {value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
