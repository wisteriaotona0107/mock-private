// src/heatModel.ts
// 焼成シミュレーションを担当する。

import type { CookState } from './state';
import { CONFIG } from './state';
import { clamp } from './utils';

export function computeHeatPower(distance: number): number {
  const minDistance = 20;
  const d = Math.max(minDistance, distance);
  const heat = CONFIG.heat.maxPower / Math.pow(d / 80, CONFIG.heat.exponent);
  return heat;
}

export function applyCookingStep(cook: CookState, dt: number, heatPower: number): void {
  const ambient = 20;
  const heatGain = heatPower * CONFIG.heat.surfaceGain * dt;
  const cooling = (cook.surfaceTemp - ambient) * CONFIG.heat.cooling * dt * 0.01;
  cook.surfaceTemp += heatGain - cooling;
  cook.surfaceTemp = Math.max(cook.surfaceTemp, ambient);

  const coreExchange = (cook.surfaceTemp - cook.coreTemp) * CONFIG.heat.coreGain * dt * 0.01;
  cook.coreTemp += coreExchange;
  cook.coreTemp = Math.max(cook.coreTemp, ambient);

  if (cook.surfaceTemp >= CONFIG.heat.charThreshold) {
    cook.char += (cook.surfaceTemp - CONFIG.heat.charThreshold) / 400 * CONFIG.heat.charRate * dt;
  }
  cook.char = clamp(cook.char, 0, 1);
}

export function coolDown(cook: CookState, dt: number): void {
  const ambient = 20;
  const cooling = (cook.surfaceTemp - ambient) * CONFIG.heat.cooling * 0.5 * dt * 0.01;
  cook.surfaceTemp -= cooling;
  cook.coreTemp -= cooling * 0.6;
  cook.surfaceTemp = Math.max(cook.surfaceTemp, ambient);
  cook.coreTemp = Math.max(cook.coreTemp, ambient);
}
