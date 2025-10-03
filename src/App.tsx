import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Flame, LayoutGrid, Map as MapIcon, ListCheck, Gift, Bot, Settings, LogOut } from 'lucide-react';
import { useEffect } from 'react';
import { useUIStore } from './stores/ui';
import { useTasksStore } from './stores/tasks';
import { useRewardsStore } from './stores/rewards';
import { RewardModal } from './components/RewardModal';

const navItems = [
  { to: '/', label: 'ダッシュボード', icon: LayoutGrid },
  { to: '/tree', label: 'スキルツリー', icon: MapIcon },
  { to: '/tasks', label: 'タスク', icon: ListCheck },
  { to: '/rewards', label: '報酬', icon: Gift },
  { to: '/suggestions', label: '提案', icon: Bot },
  { to: '/settings', label: '設定', icon: Settings }
];

export const AppLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useUIStore((state) => state.theme);
  const streak = useTasksStore((state) => state.streak);
  const pendingUnlock = useRewardsStore((state) => state.pendingUnlock);
  const closeUnlockModal = useRewardsStore((state) => state.dismissPending);

  useEffect(() => {
    if (location.pathname === '/login') {
      navigate('/');
    }
  }, [location.pathname, navigate]);

  const currentNav = navItems.find((item) => location.pathname === item.to);

  return (
    <div className={`min-h-screen bg-[#0B1020] text-[#E6EDF8] ${theme === 'neon' ? 'neon-theme' : ''}`}>
      <div className="flex min-h-screen">
        <aside className="hidden w-64 flex-col border-r border-white/10 bg-[#0B1020]/80 p-6 md:flex">
          <div className="flex items-center gap-3">
            <Flame className="text-milestone" />
            <div>
              <p className="text-sm text-accent/80">ストリーク</p>
              <p className="text-2xl font-bold text-milestone">{streak.currentDays}日</p>
            </div>
          </div>
          <nav className="mt-10 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `focus-ring flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition hover:bg-accent/10 ${
                      isActive ? 'bg-accent/15 text-accent' : 'text-white/70'
                    }`
                  }
                  aria-label={item.label}
                >
                  <Icon size={18} />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
          <button
            className="focus-ring mt-auto flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-white/60 transition hover:bg-red-500/10 hover:text-red-300"
            aria-label="ログアウト"
            onClick={() => navigate('/login')}
          >
            <LogOut size={18} />ログアウト
          </button>
        </aside>
        <main className="flex-1">
          <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/10 bg-[#0B1020]/80 px-6 py-4 backdrop-blur">
            <div>
              <p className="text-xs uppercase tracking-widest text-accent/70">Neo Skill Planner</p>
              <h1 className="text-2xl font-bold">{currentNav?.label ?? 'ダッシュボード'}</h1>
            </div>
            <div className="flex items-center gap-3 text-sm text-white/60">
              <span>テーマ: {theme === 'neon' ? 'ネオン' : 'ダーク'}</span>
            </div>
          </header>
          <div className="px-4 pb-12 pt-6">
            <Outlet />
          </div>
        </main>
      </div>
      {pendingUnlock && <RewardModal unlock={pendingUnlock} onClose={closeUnlockModal} />}
    </div>
  );
};

export default AppLayout;
