import { create } from 'zustand';
import { seedStreak, seedTasks } from '../data/seed';
import { Streak, Task, TaskStatus } from '../types';
import { startOfDay } from '../utils/date';
import { getPeriodWindow } from '../utils/reward';
import { useRewardsStore } from './rewards';

interface CompletionLog {
  taskId: string;
  completedAt: string;
}

type Period = 'daily' | 'weekly' | 'monthly';

export interface NewTaskInput {
  id?: string;
  title: string;
  description: string;
  status: TaskStatus;
  difficulty: number;
  tags: string[];
  dependsOn?: string[];
  completedAt?: string;
}

interface TasksState {
  tasks: Task[];
  streak: Streak;
  completionLog: CompletionLog[];
  completeTask: (taskId: string) => void;
  addTask: (task: NewTaskInput) => void;
  getCompletionCounts: () => Record<Period, { count: number; start: string; end: string }>;
  getPeriodStats: () => Record<Period, { count: number; target: number; rate: number }>;
}

const ensureDependenciesReady = (tasks: Task[], target: Task) => {
  return target.dependsOn.every((id) => {
    const task = tasks.find((t) => t.id === id);
    return task && (task.status === 'done' || task.status === 'milestone');
  });
};

const updateStreak = (streak: Streak): Streak => {
  const today = startOfDay(new Date());
  if (!streak.lastIncrementDate) {
    return { currentDays: 1, longestDays: 1, lastIncrementDate: today.toISOString() };
  }
  const last = startOfDay(new Date(streak.lastIncrementDate));
  const diff = Math.floor((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) {
    return streak;
  }
  if (diff === 1) {
    const currentDays = streak.currentDays + 1;
    return {
      currentDays,
      longestDays: Math.max(streak.longestDays, currentDays),
      lastIncrementDate: today.toISOString()
    };
  }
  return {
    currentDays: 1,
    longestDays: Math.max(streak.longestDays, 1),
    lastIncrementDate: today.toISOString()
  };
};

export const useTasksStore = create<TasksState>((set, get) => ({
  tasks: seedTasks,
  streak: seedStreak,
  completionLog: [],
  completeTask: (taskId) => {
    const state = get();
    const task = state.tasks.find((t) => t.id === taskId);
    if (!task || task.status === 'done') return;
    if (!ensureDependenciesReady(state.tasks, task)) return;

    const now = new Date().toISOString();

    const updatedTasks = state.tasks.map((t) =>
      t.id === taskId
        ? { ...t, status: 'done', completedAt: now }
        : t
    );

    const streak = updateStreak(state.streak);

    set({
      tasks: updatedTasks.map((t) => {
        if (t.status === 'pending' && ensureDependenciesReady(updatedTasks, t)) {
          return { ...t, status: 'in_progress' };
        }
        return t;
      }),
      streak,
      completionLog: [...state.completionLog, { taskId, completedAt: now }]
    });

    const counts = get().getCompletionCounts();
    const rewardStore = useRewardsStore.getState();
    (['daily', 'weekly', 'monthly'] as Period[]).forEach((period) => {
      rewardStore.evaluateRewards(period, counts[period].count, counts[period].start, counts[period].end);
    });
  },
  addTask: (taskInput) => {
    const id = taskInput.id ?? crypto.randomUUID();
    const dependencies = taskInput.dependsOn ?? [];
    const initialStatus = dependencies.length === 0 && taskInput.status === 'pending' ? 'in_progress' : taskInput.status;
    const newTask: Task = {
      id,
      title: taskInput.title,
      description: taskInput.description,
      difficulty: taskInput.difficulty,
      tags: taskInput.tags,
      dependsOn: dependencies,
      status: initialStatus,
      completedAt: taskInput.completedAt
    };

    set((state) => {
      const base = [...state.tasks, newTask];
      const nextTasks = base.map((task) => {
        if (task.status === 'pending' && ensureDependenciesReady(base, task)) {
          return { ...task, status: 'in_progress' };
        }
        return task;
      });
      return { tasks: nextTasks };
    });
  },
  getCompletionCounts: () => {
    const result: Record<Period, { count: number; start: string; end: string }> = {
      daily: { count: 0, start: '', end: '' },
      weekly: { count: 0, start: '', end: '' },
      monthly: { count: 0, start: '', end: '' }
    };

    const now = new Date();
    (['daily', 'weekly', 'monthly'] as Period[]).forEach((period) => {
      const { start, end } = getPeriodWindow(period, now);
      const count = get().tasks.filter((task) => {
        if (!task.completedAt) return false;
        const completed = new Date(task.completedAt);
        return completed >= start && completed <= end;
      }).length;
      result[period] = { count, start: start.toISOString(), end: end.toISOString() };
    });

    return result;
  },
  getPeriodStats: () => {
    const counts = get().getCompletionCounts();
    const rules = useRewardsStore.getState().rules;
    const stats = {} as Record<Period, { count: number; target: number; rate: number }>;
    (['daily', 'weekly', 'monthly'] as Period[]).forEach((period) => {
      const target = rules.filter((rule) => rule.period === period).map((rule) => rule.targetCount)[0] ?? 5;
      const count = counts[period].count;
      stats[period] = {
        count,
        target,
        rate: target === 0 ? 0 : Math.min(1, count / target)
      };
    });
    return stats;
  }
}));
