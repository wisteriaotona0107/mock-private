import { Modal } from './Modal';
import { RewardChestAnimation } from './RewardChestAnimation';
import { Button } from './Button';
import { useRewardsStore } from '../stores/rewards';
import { formatRange } from '../utils/date';
import { RewardRule } from '../types';

interface RewardModalProps {
  unlock: ReturnType<typeof useRewardsStore.getState>['pendingUnlock'];
  onClose: () => void;
}

const rewardTypeLabel: Record<RewardRule['rewardType'], string> = {
  food: 'フード',
  goods: 'アイテム',
  device_right: 'デバイス権利',
  other: 'その他'
};

export const RewardModal = ({ unlock, onClose }: RewardModalProps) => {
  const claimUnlock = useRewardsStore((state) => state.claimUnlock);
  const rule = useRewardsStore((state) => state.rules.find((r) => r.id === unlock?.ruleId));

  if (!unlock || !rule) return null;

  return (
    <Modal
      open={Boolean(unlock)}
      onClose={onClose}
      title={`報酬解放: ${rewardTypeLabel[rule.rewardType]}`}
      footer={
        <Button
          onClick={() => {
            claimUnlock(unlock.id);
            onClose();
          }}
        >
          受け取る
        </Button>
      }
    >
      <RewardChestAnimation title={rule.rewardDesc} description={rewardTypeLabel[rule.rewardType]} />
      <p>
        期間: {formatRange(unlock.periodStart, unlock.periodEnd)} / 達成数: {unlock.completedCount} / 目標:
        {rule.targetCount}
      </p>
    </Modal>
  );
};
