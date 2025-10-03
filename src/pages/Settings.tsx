import { Card } from '../components/Card';
import { useUIStore } from '../stores/ui';
import { Switch } from '../components/Switch';

export const SettingsPage = () => {
  const theme = useUIStore((state) => state.theme);
  const animationsOn = useUIStore((state) => state.animationsOn);
  const notificationsOn = useUIStore((state) => state.notificationsOn);
  const toggleTheme = useUIStore((state) => state.toggleTheme);
  const setAnimationsOn = useUIStore((state) => state.setAnimationsOn);
  const setNotificationsOn = useUIStore((state) => state.setNotificationsOn);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-accent">テーマ</h3>
            <p className="text-xs text-white/50">ネオンとダークテーマを切り替え</p>
          </div>
          <button className="focus-ring rounded-full bg-accent/20 px-4 py-2 text-sm" onClick={toggleTheme} aria-label="テーマ切替">
            {theme === 'neon' ? 'ネオン' : 'ダーク'}
          </button>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-accent">アニメーション</h3>
            <p className="text-xs text-white/50">演出を有効にするか選択</p>
          </div>
          <Switch
            checked={animationsOn}
            onCheckedChange={setAnimationsOn}
            aria-label="アニメーション切替"
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-accent">通知</h3>
            <p className="text-xs text-white/50">完了や報酬時の通知</p>
          </div>
          <Switch
            checked={notificationsOn}
            onCheckedChange={setNotificationsOn}
            aria-label="通知切替"
          />
        </div>
      </Card>
    </div>
  );
};
