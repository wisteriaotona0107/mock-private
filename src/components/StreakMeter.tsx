import { Flame } from 'lucide-react';
import { useTasksStore } from '../stores/tasks';

export const StreakMeter = () => {
  const streak = useTasksStore((state) => state.streak);
  const intensity = Math.min(1, streak.currentDays / 7);

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-accent/30 bg-[#111936]/80 px-6 py-4 shadow-neon">
      <div
        className="rounded-full p-3"
        style={{
          background: `radial-gradient(circle, rgba(241,196,15,${0.4 + intensity * 0.4}), rgba(241,196,15,0.1))`
        }}
      >
        <Flame className="text-milestone" size={32} />
      </div>
      <div>
        <p className="text-sm text-accent/80">連続達成日数</p>
        <p className="text-2xl font-bold text-milestone">{streak.currentDays}日</p>
        <p className="text-xs text-white/50">最長 {streak.longestDays} 日</p>
      </div>
    </div>
  );
};
