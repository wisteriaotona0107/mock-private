export function costPerformanceScore(price: number, volumeMl: number, baseline = 50): number {
  if (price <= 0 || volumeMl <= 0) {
    return baseline;
  }
  const pricePerMl = price / volumeMl;
  if (pricePerMl <= 5) {
    return Math.min(100, baseline + 30);
  }
  if (pricePerMl >= 30) {
    return Math.max(0, baseline - 30);
  }
  const normalized = ((30 - pricePerMl) / 25) * 30;
  return Math.min(100, Math.max(0, baseline + normalized));
}
