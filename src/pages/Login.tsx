import { Button } from '../components/Button';

export const LoginPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0B1020]">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#121833]/90 p-10 text-center shadow-neon">
        <h1 className="mb-6 text-3xl font-bold text-accent">Neo Skill Planner</h1>
        <p className="mb-10 text-sm text-white/70">ゲーム感覚でスキルを育てるタスク管理。ログインはダミーです。</p>
        <form className="space-y-4" aria-label="ログインフォーム">
          <input
            className="focus-ring w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm"
            placeholder="メールアドレス"
            type="email"
            aria-label="メールアドレス"
          />
          <input
            className="focus-ring w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm"
            placeholder="パスワード"
            type="password"
            aria-label="パスワード"
          />
          <Button type="submit" className="w-full">
            ログイン（ダミー）
          </Button>
        </form>
      </div>
    </div>
  );
};
