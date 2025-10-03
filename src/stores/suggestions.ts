import { create } from 'zustand';
import { seedSuggestions } from '../data/seed';
import { Suggestion } from '../types';
import { useTasksStore, NewTaskInput } from './tasks';

interface SuggestionsState {
  suggestions: Suggestion[];
  approve: (id: string) => void;
  reject: (id: string) => void;
}

export const useSuggestionsStore = create<SuggestionsState>((set) => ({
  suggestions: seedSuggestions,
  approve: (id) => {
    set((state) => {
      const suggestion = state.suggestions.find((item) => item.id === id);
      if (!suggestion || suggestion.decision === 'approved') return state;

      const tasksState = useTasksStore.getState();
      const dependsOn = tasksState.tasks
        .filter((task) => suggestion.tags.some((tag) => task.tags.includes(tag)))
        .slice(0, 2)
        .map((task) => task.id);

      const newTask: NewTaskInput = {
        id: `task-from-${id}`,
        title: suggestion.title,
        description: suggestion.reason,
        difficulty: suggestion.difficulty,
        tags: suggestion.tags,
        dependsOn,
        status: dependsOn.length === 0 ? 'in_progress' : 'pending'
      };

      tasksState.addTask(newTask);

      return {
        suggestions: state.suggestions.map((item) =>
          item.id === id ? { ...item, decision: 'approved' } : item
        )
      };
    });
  },
  reject: (id) => {
    set((state) => ({
      suggestions: state.suggestions.map((item) =>
        item.id === id ? { ...item, decision: 'rejected' } : item
      )
    }));
  }
}));
