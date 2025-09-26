import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  if (request.headers.get('x-admin-token') !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ message: 'unauthorized' }, { status: 401 });
  }
  const [jobs, successes, cacheHits] = await Promise.all([
    prisma.job.findMany({ orderBy: { created_at: 'desc' }, take: 100 }),
    prisma.job.findMany({ where: { status: 'succeeded' }, orderBy: { created_at: 'desc' }, take: 100 }),
    prisma.job.count({ where: { status: 'succeeded' } })
  ]);
  const durations = successes.map((j) => j.duration ?? 0).sort((a, b) => a - b);
  const percentile = (p: number) => {
    if (!durations.length) return 0;
    const idx = Math.floor((p / 100) * (durations.length - 1));
    return durations[idx];
  };
  const storageBytes = (await prisma.image.aggregate({ _sum: { size_bytes: true } }))._sum.size_bytes ?? 0;
  const metrics = {
    cacheHitRatio: cacheHits ? Number((cacheHits / Math.max(jobs.length, 1)).toFixed(2)) : 0,
    p50: percentile(50),
    p95: percentile(95),
    p99: percentile(99),
    costPerRunYen: Number(process.env.COST_PER_RUN_YEN ?? 5),
    provider: process.env.DEFAULT_PROVIDER ?? 'replicate',
    storageBytes,
    ttlHours: Number(process.env.IMAGE_TTL_HOURS ?? 24)
  };
  return NextResponse.json(metrics);
}
