import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from './App';
import { LoginPage } from './pages/Login';
import { DashboardPage } from './pages/Dashboard';
import { SkillTreePage } from './pages/SkillTree';
import { TasksPage } from './pages/Tasks';
import { RewardsPage } from './pages/Rewards';
import { SuggestionsPage } from './pages/Suggestions';
import { SettingsPage } from './pages/Settings';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />
  },
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'tree', element: <SkillTreePage /> },
      { path: 'tasks', element: <TasksPage /> },
      { path: 'rewards', element: <RewardsPage /> },
      { path: 'suggestions', element: <SuggestionsPage /> },
      { path: 'settings', element: <SettingsPage /> }
    ]
  }
]);
