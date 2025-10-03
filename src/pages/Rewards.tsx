import { useMemo, useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Progress } from '../components/Progress';
import { useRewardsStore } from '../stores/rewards';
import { useTasksStore } from '../stores/tasks';
import { formatRange } from '../utils/date';
import { RewardRule } from '../types';

const periods: Array<'daily' | 'weekly' | 'monthly'> = ['daily', 'weekly', 'monthly'];

const periodLabel: Record<'daily' | 'weekly' | 'monthly', string> = {
  daily: '日次',
  weekly: '週次',
  monthly: '月次'
};

const rewardTypeLabel: Record<RewardRule['rewardType'], string> = {
  food: 'フード',
  goods: 'アイテム',
  device_right: 'デバイス権利',
  other: 'その他'
};

export const RewardsPage = () => {
  const [selected, setSelected] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const rules = useRewardsStore((state) => state.rules.filter((rule) => rule.period === selected));
  const unlocks = useRewardsStore((state) => state.unlocks.filter((unlock) => unlock.period === selected));
  const claimUnlock = useRewardsStore((state) => state.claimUnlock);
  const stats = useTasksStore((state) => state.getPeriodStats());

  const currentUnlockMap = useMemo(() => {
    const map = new Map<string, typeof unlocks[number]>();
    unlocks.forEach((unlock) => map.set(unlock.ruleId, unlock));
    return map;
  }, [unlocks]);

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {periods.map((period) => (
          <button
            key={period}
            onClick={() => setSelected(period)}
            className={`focus-ring rounded-full px-4 py-2 text-sm ${
              selected === period ? 'bg-accent text-[#0B1020]' : 'bg-white/10 text-white/60'
            }`}
            aria-label={`${periodLabel[period]}タブ`}
          >
            {periodLabel[period]}
          </button>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {rules.map((rule) => {
          const unlock = currentUnlockMap.get(rule.id);
          const completion = stats[selected];
          const achieved = completion.count >= rule.targetCount;
          const progressValue = rule.targetCount === 0 ? 100 : Math.min(100, (completion.count / rule.targetCount) * 100);
          return (
            <Card key={rule.id}>
              <p className="text-xs uppercase tracking-widest text-accent/70">{rewardTypeLabel[rule.rewardType]}</p>
              <h3 className="mt-2 text-lg font-semibold text-milestone">{rule.rewardDesc}</h3>
              <p className="mt-2 text-xs text-white/60">条件: {rule.targetCount}タスク達成</p>
              <Progress value={progressValue} className="mt-4" />
              <p className="mt-2 text-xs text-white/50">
                {completion.count}/{rule.targetCount} 達成 ({Math.round(completion.rate * 100)}%)
              </p>
              {unlock && (
                <p className="mt-3 text-xs text-white/40">期間: {formatRange(unlock.periodStart, unlock.periodEnd)}</p>
              )}
              <div className="mt-4 flex items-center justify-between">
                <span className={`text-xs ${achieved ? 'text-success' : 'text-white/40'}`}>
                  {achieved ? '解放条件クリア' : '未達'}
                </span>
                {unlock && !unlock.claimedAt ? (
                  <Button onClick={() => claimUnlock(unlock.id)} aria-label="報酬を受け取る">
                    受け取る
                  </Button>
                ) : (
                  <Button variant="ghost" disabled={!achieved} aria-label="報酬未解放">
                    {unlock?.claimedAt ? '受取済み' : '解放待ち'}
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
