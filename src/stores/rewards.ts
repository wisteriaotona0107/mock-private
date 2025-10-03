import { create } from 'zustand';
import { seedRewardRules, seedRewardUnlocks } from '../data/seed';
import { RewardRule, RewardUnlock } from '../types';

type Period = 'daily' | 'weekly' | 'monthly';

interface RewardsState {
  rules: RewardRule[];
  unlocks: RewardUnlock[];
  pendingUnlock: RewardUnlock | null;
  evaluateRewards: (period: Period, completedCount: number, startIso: string, endIso: string) => void;
  claimUnlock: (unlockId: string) => void;
  dismissPending: () => void;
}

export const useRewardsStore = create<RewardsState>((set, get) => ({
  rules: seedRewardRules,
  unlocks: seedRewardUnlocks,
  pendingUnlock: null,
  evaluateRewards: (period, completedCount, startIso, endIso) => {
    const now = new Date().toISOString();
    const state = get();
    const rules = state.rules.filter((rule) => rule.period === period);

    set((current) => {
      let pendingUnlock: RewardUnlock | null = current.pendingUnlock;
      const updatedUnlocks = current.unlocks.map((unlock) => {
        if (unlock.period === period && unlock.periodStart === startIso && unlock.periodEnd === endIso) {
          return { ...unlock, completedCount };
        }
        return unlock;
      });

      const ensureUnlock = (rule: RewardRule) => {
        let unlock = updatedUnlocks.find((item) => item.ruleId === rule.id && item.periodStart === startIso);
        if (!unlock) {
          unlock = {
            id: `${rule.id}-${startIso}`,
            ruleId: rule.id,
            period,
            periodStart: startIso,
            periodEnd: endIso,
            completedCount
          };
          updatedUnlocks.push(unlock);
        } else if (unlock.completedCount !== completedCount) {
          unlock.completedCount = completedCount;
        }

        if (completedCount >= rule.targetCount && !unlock.unlockedAt) {
          unlock.unlockedAt = now;
          pendingUnlock = unlock;
        }
      };

      rules.forEach(ensureUnlock);

      return { unlocks: updatedUnlocks, pendingUnlock };
    });
  },
  claimUnlock: (unlockId) => {
    set((state) => ({
      unlocks: state.unlocks.map((unlock) =>
        unlock.id === unlockId ? { ...unlock, claimedAt: new Date().toISOString() } : unlock
      ),
      pendingUnlock: state.pendingUnlock?.id === unlockId ? null : state.pendingUnlock
    }));
  },
  dismissPending: () => set({ pendingUnlock: null })
}));
