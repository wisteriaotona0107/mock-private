import { create } from 'zustand';

type Theme = 'dark' | 'neon';

type TreeLayout = 'cola' | 'concentric';

interface UIState {
  theme: Theme;
  animationsOn: boolean;
  notificationsOn: boolean;
  treeLayout: TreeLayout;
  toggleTheme: () => void;
  setAnimationsOn: (value: boolean) => void;
  setNotificationsOn: (value: boolean) => void;
  setTreeLayout: (layout: TreeLayout) => void;
}

export const useUIStore = create<UIState>((set) => ({
  theme: 'neon',
  animationsOn: true,
  notificationsOn: true,
  treeLayout: 'cola',
  toggleTheme: () =>
    set((state) => ({
      theme: state.theme === 'dark' ? 'neon' : 'dark'
    })),
  setAnimationsOn: (value) => set({ animationsOn: value }),
  setNotificationsOn: (value) => set({ notificationsOn: value }),
  setTreeLayout: (layout) => set({ treeLayout: layout })
}));
