export type TaskStatus = 'pending' | 'in_progress' | 'done' | 'milestone';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  difficulty: number;
  tags: string[];
  dependsOn: string[];
  completedAt?: string;
}

export interface RewardRule {
  id: string;
  period: 'daily' | 'weekly' | 'monthly';
  targetCount: number;
  rewardType: 'food' | 'goods' | 'device_right' | 'other';
  rewardDesc: string;
  autoClaimDefault: boolean;
}

export interface RewardUnlock {
  id: string;
  ruleId: string;
  period: 'daily' | 'weekly' | 'monthly';
  periodStart: string;
  periodEnd: string;
  unlockedAt?: string;
  completedCount: number;
  claimedAt?: string;
}

export interface Streak {
  currentDays: number;
  longestDays: number;
  lastIncrementDate?: string;
}

export interface Suggestion {
  id: string;
  title: string;
  reason: string;
  estMinutes: number;
  difficulty: number;
  tags: string[];
  decision: 'pending' | 'approved' | 'rejected';
}
