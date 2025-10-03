import { Card } from '../components/Card';
import { Progress } from '../components/Progress';
import { StreakMeter } from '../components/StreakMeter';
import { useTasksStore } from '../stores/tasks';
import { useRewardsStore } from '../stores/rewards';
import { formatDate } from '../utils/date';
import { RewardRule } from '../types';

const periodLabels: Record<'daily' | 'weekly' | 'monthly', string> = {
  daily: '今日',
  weekly: '今週',
  monthly: '今月'
};

const rewardTypeLabel: Record<RewardRule['rewardType'], string> = {
  food: 'フード',
  goods: 'アイテム',
  device_right: 'デバイス権利',
  other: 'その他'
};

export const DashboardPage = () => {
  const completion = useTasksStore((state) => state.getPeriodStats());
  const recent = useRewardsStore((state) =>
    [...state.unlocks]
      .filter((unlock) => unlock.unlockedAt)
      .sort((a, b) => (b.unlockedAt ?? '').localeCompare(a.unlockedAt ?? ''))
      .slice(0, 5)
  );

  return (
    <div className="space-y-8">
      <div className="card-grid">
        {(Object.keys(periodLabels) as Array<'daily' | 'weekly' | 'monthly'>).map((period) => (
          <Card key={period}>
            <p className="text-sm text-accent/80">{periodLabels[period]}の達成率</p>
            <h2 className="mt-2 text-3xl font-bold">
              {completion[period].count}/{completion[period].target}
            </h2>
            <Progress value={completion[period].rate * 100} className="mt-4" />
            <p className="mt-2 text-xs text-white/50">目標: {completion[period].target} タスク</p>
          </Card>
        ))}
      </div>
      <StreakMeter />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="text-lg font-semibold text-accent">直近の報酬解放</h3>
          <div className="mt-4 space-y-3">
            {recent.length === 0 && <p className="text-sm text-white/50">まだ報酬は解放されていません。</p>}
            {recent.map((unlock) => {
              const rule = useRewardsStore.getState().rules.find((r) => r.id === unlock.ruleId);
              if (!rule) return null;
              return (
                <div key={unlock.id} className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-milestone">{rule.rewardDesc}</p>
                    <p className="text-xs text-white/50">{formatDate(unlock.unlockedAt ?? unlock.periodEnd)}</p>
                  </div>
                  <span className="text-xs text-accent/80">{rewardTypeLabel[rule.rewardType]}</span>
                </div>
              );
            })}
          </div>
        </Card>
        <Card>
          <h3 className="text-lg font-semibold text-accent">フォーカスタグ</h3>
          <div className="mt-4 grid grid-cols-3 gap-4 text-center text-sm">
            {['health', 'study', 'work'].map((tag) => {
              const count = useTasksStore.getState().tasks.filter((task) => task.tags.includes(tag)).length;
              return (
                <div key={tag} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-6">
                  <p className="text-accent/80">{tag.toUpperCase()}</p>
                  <p className="mt-2 text-2xl font-bold">{count}</p>
                  <p className="text-xs text-white/50">登録タスク</p>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
};
