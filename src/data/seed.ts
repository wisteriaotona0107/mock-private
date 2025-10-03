import { RewardRule, RewardUnlock, Streak, Suggestion, Task } from '../types';
import { getPeriodWindow } from '../utils/reward';

const now = new Date();
const { start: dailyStart, end: dailyEnd } = getPeriodWindow('daily', now);
const { start: weeklyStart, end: weeklyEnd } = getPeriodWindow('weekly', now);
const { start: monthlyStart, end: monthlyEnd } = getPeriodWindow('monthly', now);

export const seedTasks: Task[] = [
  {
    id: 'task-1',
    title: '朝の瞑想10分',
    description: '集中力を高めるための瞑想。呼吸を整える。',
    status: 'in_progress',
    difficulty: 2,
    tags: ['health'],
    dependsOn: []
  },
  {
    id: 'task-2',
    title: 'TypeScript教材を1セクション学習',
    description: '進行中のオンライン講座を1チャンク進める。',
    status: 'pending',
    difficulty: 3,
    tags: ['study'],
    dependsOn: ['task-1']
  },
  {
    id: 'task-3',
    title: '週次の振り返りノート',
    description: '今週の成果をまとめ、次週の優先度を決める。',
    status: 'milestone',
    difficulty: 4,
    tags: ['work'],
    dependsOn: ['task-1', 'task-2']
  },
  {
    id: 'task-4',
    title: '軽いHIITトレーニング',
    description: '自宅で15分のHIITを行う。',
    status: 'pending',
    difficulty: 3,
    tags: ['health'],
    dependsOn: ['task-1']
  },
  {
    id: 'task-5',
    title: 'ブログ記事の下書き',
    description: 'アウトプット用に500文字の下書きを作成。',
    status: 'done',
    difficulty: 3,
    tags: ['work'],
    dependsOn: ['task-2'],
    completedAt: new Date(now.getTime() - 1000 * 60 * 60 * 20).toISOString()
  }
];

export const seedRewardRules: RewardRule[] = [
  {
    id: 'reward-d-1',
    period: 'daily',
    targetCount: 3,
    rewardType: 'food',
    rewardDesc: 'ご褒美スムージー',
    autoClaimDefault: true
  },
  {
    id: 'reward-w-1',
    period: 'weekly',
    targetCount: 15,
    rewardType: 'goods',
    rewardDesc: '新しいノートを購入',
    autoClaimDefault: false
  },
  {
    id: 'reward-m-1',
    period: 'monthly',
    targetCount: 60,
    rewardType: 'device_right',
    rewardDesc: '週末のゲーム解禁日',
    autoClaimDefault: false
  }
];

export const seedRewardUnlocks: RewardUnlock[] = [
  {
    id: 'unlock-d-1',
    ruleId: 'reward-d-1',
    period: 'daily',
    periodStart: dailyStart.toISOString(),
    periodEnd: dailyEnd.toISOString(),
    completedCount: 2
  },
  {
    id: 'unlock-w-1',
    ruleId: 'reward-w-1',
    period: 'weekly',
    periodStart: weeklyStart.toISOString(),
    periodEnd: weeklyEnd.toISOString(),
    completedCount: 8
  },
  {
    id: 'unlock-m-1',
    ruleId: 'reward-m-1',
    period: 'monthly',
    periodStart: monthlyStart.toISOString(),
    periodEnd: monthlyEnd.toISOString(),
    completedCount: 22
  }
];

export const seedStreak: Streak = {
  currentDays: 4,
  longestDays: 7,
  lastIncrementDate: now.toISOString()
};

export const seedSuggestions: Suggestion[] = [
  {
    id: 'sug-1',
    title: '昼休みにストレッチ5分',
    reason: '座りっぱなし対策としてChatGPTが推奨',
    estMinutes: 5,
    difficulty: 1,
    tags: ['health'],
    decision: 'pending'
  },
  {
    id: 'sug-2',
    title: '記事のSEO改善リサーチ',
    reason: 'ブログのパフォーマンス向上のため',
    estMinutes: 40,
    difficulty: 3,
    tags: ['work'],
    decision: 'pending'
  },
  {
    id: 'sug-3',
    title: '英語のPodcastを1本聞く',
    reason: 'リスニング強化のための提案',
    estMinutes: 30,
    difficulty: 2,
    tags: ['study'],
    decision: 'pending'
  }
];
