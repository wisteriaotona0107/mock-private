import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { Badge } from '../(components)/ui/badge';

async function getMetrics(token: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/admin/metrics`, {
    headers: {
      'x-admin-token': token,
      'X-Requested-With': 'quick-colorize'
    }
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function AdminPage() {
  const cookieStore = cookies();
  const token = cookieStore.get('qc_admin_token')?.value ?? headers().get('x-admin-token') ?? '';
  if (!token) {
    redirect('/');
  }
  const metrics = await getMetrics(token);
  if (!metrics) {
    redirect('/');
  }
  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-white">管理ダッシュボード</h1>
        <Badge>Admin</Badge>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        {Object.entries(metrics).map(([key, value]) => (
          <div key={key} className="rounded-lg border border-slate-700 bg-surface p-4 text-sm text-gray-200">
            <div className="text-xs uppercase tracking-wide text-gray-400">{key}</div>
            <div className="mt-2 text-lg font-semibold">{String(value)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
