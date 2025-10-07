// src/ingredients.ts
// 食材・調味料・飲み物のデータと相性ロジック。

import type { Config, EvaluationResult } from './state';
import { clamp, mapRange } from './utils';

export interface Ingredient {
  id: string;
  name: string;
  size: number;
  colorStops: string[];
}

export interface Seasoning {
  id: string;
  name: string;
  accentColor: string;
}

export interface Drink {
  id: string;
  name: string;
  accentColor: string;
}

export const INGREDIENTS: Ingredient[] = [
  { id: 'marshmallow', name: 'マシュマロ', size: 42, colorStops: ['#ffffff', '#ffd9b3', '#d98c4c'] },
  { id: 'sausage', name: 'ソーセージ', size: 54, colorStops: ['#ff9a63', '#cc4d1f', '#802711'] },
  { id: 'cheese', name: 'チーズ', size: 50, colorStops: ['#ffe27a', '#ffc947', '#d69c1e'] },
  { id: 'mushroom', name: 'マッシュルーム', size: 48, colorStops: ['#f8f1e7', '#d3c2ae', '#9a8164'] },
  { id: 'apple', name: 'りんご', size: 46, colorStops: ['#ff7373', '#c62828', '#7a1a1a'] }
];

export const SEASONINGS: Seasoning[] = [
  { id: 'butter', name: 'バター', accentColor: '#ffd54f' },
  { id: 'salt', name: '岩塩', accentColor: '#b0bec5' },
  { id: 'pepper', name: 'ペッパー', accentColor: '#8d6e63' },
  { id: 'cinnamon', name: 'シナモン', accentColor: '#a1887f' },
  { id: 'honey', name: 'ハニー', accentColor: '#ffb74d' },
  { id: 'soy', name: '醤油', accentColor: '#6d4c41' }
];

export const DRINKS: Drink[] = [
  { id: 'whisky', name: 'ウィスキー', accentColor: '#f57c00' },
  { id: 'redwine', name: '赤ワイン', accentColor: '#ad1457' },
  { id: 'whitewine', name: '白ワイン', accentColor: '#fdd835' },
  { id: 'sake', name: '日本酒', accentColor: '#90caf9' },
  { id: 'coffee', name: 'コーヒー', accentColor: '#4e342e' },
  { id: 'tea', name: 'お茶', accentColor: '#7cb342' }
];

const DRINK_PAIRINGS = new Map<string, number>([
  [['marshmallow', 'whisky'].join(':'), 15],
  [['marshmallow', 'coffee'].join(':'), 6],
  [['sausage', 'redwine'].join(':'), 6],
  [['cheese', 'redwine'].join(':'), 18],
  [['cheese', 'whisky'].join(':'), 4],
  [['mushroom', 'sake'].join(':'), 16],
  [['mushroom', 'whitewine'].join(':'), 10],
  [['apple', 'tea'].join(':'), 5]
]);

const SEASONING_PAIRINGS = new Map<string, number>([
  [['marshmallow', 'honey'].join(':'), 6],
  [['marshmallow', 'soy'].join(':'), -2],
  [['sausage', 'pepper'].join(':'), 5],
  [['sausage', 'butter'].join(':'), 3],
  [['cheese', 'pepper'].join(':'), 3],
  [['cheese', 'soy'].join(':'), 2],
  [['mushroom', 'butter'].join(':'), 6],
  [['mushroom', 'salt'].join(':'), 3],
  [['apple', 'cinnamon'].join(':'), 8],
  [['apple', 'honey'].join(':'), 4]
]);

function pairingKey(a: string, b: string): string {
  return `${a}:${b}`;
}

export interface CookingSnapshot {
  surface: number;
  core: number;
  char: number;
}

export function getIngredientById(id: string): Ingredient | undefined {
  return INGREDIENTS.find((item) => item.id === id);
}

export function getSeasoningById(id: string): Seasoning | undefined {
  return SEASONINGS.find((item) => item.id === id);
}

export function getDrinkById(id: string): Drink | undefined {
  return DRINKS.find((item) => item.id === id);
}

function rangeScore(value: number, min: number, max: number): number {
  const center = (min + max) / 2;
  const span = (max - min) / 2;
  const diff = Math.abs(value - center);
  return clamp(1 - diff / (span * 1.6), 0, 1);
}

function charScore(char: number, ideal: number): number {
  if (char <= ideal) {
    const t = clamp(char / ideal, 0, 1);
    return clamp(0.7 + 0.3 * t, 0, 1);
  }
  return clamp(1 - (char - ideal) / (1 - ideal) * 1.2, 0, 1);
}

function labelFromScore(total: number): string {
  if (total >= 32) return 'Perfect';
  if (total >= 24) return 'Great';
  if (total >= 16) return 'Good';
  if (total >= 8) return 'Under';
  return 'Over';
}

function computeTimingMultiplier(sinceServe: number, config: Config): number {
  if (sinceServe < 0) return 1;
  if (sinceServe >= config.drinkWindow.total) {
    return 0.8;
  }
  if (sinceServe >= config.drinkWindow.perfectStart && sinceServe <= config.drinkWindow.perfectEnd) {
    return config.drinkWindow.multiplier;
  }
  const t = mapRange(sinceServe, 0, config.drinkWindow.perfectStart, 0.9, 1.0);
  return clamp(t, 0.85, config.drinkWindow.multiplier);
}

export function evaluateCooking(
  ingredient: Ingredient,
  seasoning: Seasoning | null,
  drink: Drink | null,
  cooking: CookingSnapshot,
  sinceServe: number,
  config: Config
): EvaluationResult {
  const surfaceScore = rangeScore(cooking.surface, config.scoring.idealSurface[0], config.scoring.idealSurface[1]);
  const coreScore = rangeScore(cooking.core, config.scoring.idealCore[0], config.scoring.idealCore[1]);
  const charMultiplier = charScore(cooking.char, config.scoring.idealChar);
  const baseScore = Math.round(config.scoring.maxBase * ((surfaceScore + coreScore) / 2) * charMultiplier);

  const seasoningBonus = seasoning ? (SEASONING_PAIRINGS.get(pairingKey(ingredient.id, seasoning.id)) ?? 0) : 0;
  const drinkBonus = drink ? (DRINK_PAIRINGS.get(pairingKey(ingredient.id, drink.id)) ?? 0) : 0;
  const timingMultiplier = drink ? computeTimingMultiplier(sinceServe, config) : 1;

  const total = Math.round((baseScore + seasoningBonus + drinkBonus) * timingMultiplier);

  return {
    ingredient,
    seasoning,
    drink,
    baseScore,
    seasoningBonus,
    drinkBonus,
    timingMultiplier,
    total,
    label: labelFromScore(total)
  };
}
