import type { Bottle } from "../models/bottle.schema";
import type { SKU } from "../models/sku.schema";
import type { TempLog } from "../models/temp_log.schema";

export interface QualityResult {
  score: number;
  badge: "OK" | "注意" | "要確認";
  inRangeRatio: number;
  spikeCount: number;
  overMaxMinutes: number;
  daysSinceOpen: number;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export function calculateQuality(
  bottle: Bottle,
  sku: SKU,
  logs: TempLog[],
  now: Date = new Date()
): QualityResult {
  if (!bottle.opened_at) {
    return {
      score: 0,
      badge: "要確認",
      inRangeRatio: 0,
      spikeCount: 0,
      overMaxMinutes: 0,
      daysSinceOpen: 0,
    };
  }

  const openedAt = new Date(bottle.opened_at);
  const endAt = bottle.emptied_at ? new Date(bottle.emptied_at) : now;

  const scoped = logs.filter((log) => {
    const ts = new Date(log.ts);
    return ts >= openedAt && ts <= endAt;
  });

  if (scoped.length === 0) {
    return {
      score: 0,
      badge: "要確認",
      inRangeRatio: 0,
      spikeCount: 0,
      overMaxMinutes: 0,
      daysSinceOpen: Math.max(0, (endAt.getTime() - openedAt.getTime()) / 86400000),
    };
  }

  const [minTemp, maxTemp] = sku.recommended_temp_c;
  const inRangeCount = scoped.filter(
    (log) => log.temp_c >= minTemp && log.temp_c <= maxTemp
  ).length;
  const spikeCount = scoped.filter((log) => log.temp_c >= 10).length;
  const overMaxCount = scoped.filter((log) => log.temp_c > maxTemp).length;

  const inRangeRatio = inRangeCount / scoped.length;
  const overMaxMinutes = overMaxCount * 5;
  const daysSinceOpen = Math.max(
    0,
    (endAt.getTime() - openedAt.getTime()) / 86400000
  );

  let score = 100;
  score -= (1 - inRangeRatio) * 60;
  score -= spikeCount * 5;
  score -= (overMaxMinutes / 60) * 2;
  score -= daysSinceOpen * sku.type_weight;
  score = clamp(score, 0, 100);

  let badge: QualityResult["badge"] = "要確認";
  if (score >= 80) badge = "OK";
  else if (score >= 60) badge = "注意";

  return {
    score,
    badge,
    inRangeRatio,
    spikeCount,
    overMaxMinutes,
    daysSinceOpen,
  };
}

export function generateCustomerComment(result: QualityResult, sku: SKU): string {
  if (result.badge === "OK") {
    return `${sku.name_ja}は適正温度で管理されています。安心してお楽しみください。`;
  }
  if (result.badge === "注意") {
    return `${sku.name_ja}は温度変化がありました。香味の変化にご注意ください。`;
  }
  return `${sku.name_ja}は温度管理の確認が必要です。スタッフにお声がけください。`;
}
