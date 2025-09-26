import { Redis } from '@upstash/redis';

const redisUrl = process.env.REDIS_URL;

const client = redisUrl
  ? new Redis({ url: redisUrl, token: process.env.REDIS_TOKEN ?? '' })
  : undefined;

export async function cacheGet<T>(key: string): Promise<T | null> {
  if (!client) return null;
  return (await client.get<T>(key)) ?? null;
}

export async function cacheSet<T>(key: string, value: T, ttlSeconds: number) {
  if (!client) return;
  await client.set(key, value, { ex: ttlSeconds });
}
