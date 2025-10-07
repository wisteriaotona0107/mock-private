// src/state.ts
// ゲーム全体の共有状態と列挙体を定義する。

import type { Drink, Ingredient, Seasoning } from './ingredients';
import type { FireSimulation } from './fire';

export enum GamePhase {
  Intro = 'intro',
  Playing = 'playing',
  Result = 'result'
}

export interface EvaluationResult {
  ingredient: Ingredient;
  seasoning: Seasoning | null;
  drink: Drink | null;
  baseScore: number;
  seasoningBonus: number;
  drinkBonus: number;
  timingMultiplier: number;
  total: number;
  label: string;
}

export interface CookState {
  ingredient: Ingredient;
  seasoning: Seasoning | null;
  surfaceTemp: number;
  coreTemp: number;
  char: number;
  angle: number;
  height: number;
  rotation: number;
  done: boolean;
  doneTimer: number;
  evaluation: EvaluationResult | null;
}

export interface SelectionState {
  ingredientId: string | null;
  seasoningId: string | null;
  drinkId: string | null;
}

export interface FloatingText {
  text: string;
  timer: number;
  duration: number;
}

export interface GameState {
  phase: GamePhase;
  timeRemaining: number;
  score: number;
  cook: CookState | null;
  selection: SelectionState;
  fire: FireSimulation;
  heatLevel: number;
  floatingTexts: FloatingText[];
  lastEvaluation: EvaluationResult | null;
  drinkWindowTimer: number;
  drinkWindowActive: boolean;
}

export const CONFIG = {
  canvas: {
    baseWidth: 960,
    baseHeight: 540
  },
  round: {
    duration: 60
  },
  skewer: {
    minHeight: -120,
    maxHeight: 80,
    rotationSpeed: 0.003,
    heightSensitivity: 0.5,
    baseLength: 320
  },
  heat: {
    exponent: 1.6,
    maxPower: 220,
    surfaceGain: 55,
    coreGain: 12,
    cooling: 8,
    charThreshold: 200,
    charRate: 0.12
  },
  scoring: {
    idealSurface: [160, 190] as [number, number],
    idealCore: [60, 75] as [number, number],
    idealChar: 0.15,
    maxBase: 20
  },
  drinkWindow: {
    perfectStart: 0.5,
    perfectEnd: 3,
    total: 4,
    multiplier: 1.25
  },
  fire: {
    radius: 140,
    particleRate: 48,
    particleLifetime: [1.2, 2.4] as [number, number],
    flickerStrength: 0.4,
    ambientHeat: 32
  },
  ui: {
    panelWidthRatio: 0.28,
    padding: 16,
    gaugeHeight: 72
  }
} as const;

export type Config = typeof CONFIG;

export function createInitialSelection(): SelectionState {
  return {
    ingredientId: null,
    seasoningId: null,
    drinkId: null
  };
}

export function createInitialState(fire: FireSimulation): GameState {
  return {
    phase: GamePhase.Intro,
    timeRemaining: CONFIG.round.duration,
    score: 0,
    cook: null,
    selection: createInitialSelection(),
    fire,
    heatLevel: 0,
    floatingTexts: [],
    lastEvaluation: null,
    drinkWindowTimer: 0,
    drinkWindowActive: false
  };
}
