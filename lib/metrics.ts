import pino from 'pino';

const logger = pino({ level: process.env.LOG_LEVEL ?? 'info' });

export interface MetricEntry {
  route: string;
  durationMs: number;
  status: number;
  cacheHit?: boolean;
  provider?: string;
  costYen?: number;
  requestId?: string;
  ip24?: string;
}

export function logMetric(entry: MetricEntry) {
  logger.info(entry);
}
