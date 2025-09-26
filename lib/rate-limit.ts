import { Redis } from '@upstash/redis';

const redisUrl = process.env.REDIS_URL;
const redisToken = process.env.REDIS_TOKEN;

const client = redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : undefined;

export async function rateLimit(identifier: string, limit: number, windowSeconds: number) {
  if (!client) return { allowed: true, remaining: limit };
  const key = `ratelimit:${identifier}`;
  const current = (await client.get<number>(key)) ?? 0;
  if (current >= limit) {
    return { allowed: false, remaining: 0 };
  }
  await client.set(key, current + 1, { ex: windowSeconds });
  return { allowed: true, remaining: Math.max(0, limit - current - 1) };
}
