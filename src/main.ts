// src/main.ts
// エントリポイント。ゲームループと状態管理を司る。

import { setupInput } from './input';
import { createRenderer, render } from './renderer';
import { createFireSimulation, updateFire, getFireHeatFactor } from './fire';
import { applyCookingStep, computeHeatPower, coolDown } from './heatModel';
import { CONFIG, GamePhase, createInitialState } from './state';
import { evaluateCooking, getDrinkById, getIngredientById, getSeasoningById } from './ingredients';
import { findButtonAt, type UIButton } from './ui';
import { playDrink, playSizzle, setFireVolume } from './audio';
import { clamp } from './utils';

const app = document.getElementById('app');
if (!app) {
  throw new Error('#app not found');
}

const canvas = document.createElement('canvas');
app.appendChild(canvas);

const renderer = createRenderer(canvas);
const fire = createFireSimulation();
const state = createInitialState(fire);
state.phase = GamePhase.Playing;

let lastTime = performance.now();
let sizzleCheck = CONFIG.heat.charThreshold - 1;
let audioInitialized = false;

setupInput(canvas, {
  onSkewerMove: (deltaAngle, deltaHeight) => {
    const cook = state.cook;
    if (!cook || cook.done) return;
    cook.angle = clamp(cook.angle + deltaAngle * CONFIG.skewer.rotationSpeed, -0.7, 0.7);
    cook.rotation += deltaAngle * CONFIG.skewer.rotationSpeed * 1.4;
    cook.height = clamp(cook.height + deltaHeight * CONFIG.skewer.heightSensitivity, CONFIG.skewer.minHeight, CONFIG.skewer.maxHeight);
  },
  onTap: (x, y) => {
    if (!audioInitialized) {
      audioInitialized = true;
      void setFireVolume(0.6);
    }
    if (!renderer.layout) return;
    const button = findButtonAt(renderer.layout, x, y);
    if (button) {
      handleButton(button);
    }
  }
});

function handleButton(button: UIButton): void {
  switch (button.kind) {
    case 'ingredient':
      if (state.drinkWindowActive) return;
      startCooking(button.id);
      break;
    case 'seasoning':
      applySeasoning(button.id);
      break;
    case 'drink':
      state.selection.drinkId = button.id;
      if (state.drinkWindowActive) {
        const drink = getDrinkById(button.id);
        if (drink) {
          finalizeServe(drink);
          void playDrink();
        }
      }
      break;
    case 'serve':
      serveIngredient();
      break;
  }
}

function startCooking(ingredientId: string): void {
  const ingredient = getIngredientById(ingredientId);
  if (!ingredient) return;
  state.cook = {
    ingredient,
    seasoning: null,
    surfaceTemp: 20,
    coreTemp: 20,
    char: 0,
    angle: 0,
    height: -40,
    rotation: 0,
    done: false,
    doneTimer: 0,
    evaluation: null
  };
  state.selection.ingredientId = ingredientId;
  state.selection.seasoningId = null;
  state.selection.drinkId = null;
  sizzleCheck = CONFIG.heat.charThreshold - 1;
}

function applySeasoning(seasoningId: string): void {
  const cook = state.cook;
  if (!cook || cook.done) return;
  const seasoning = getSeasoningById(seasoningId);
  if (!seasoning) return;
  cook.seasoning = seasoning;
  state.selection.seasoningId = seasoningId;
}

function serveIngredient(): void {
  const cook = state.cook;
  if (!cook || cook.done) return;
  cook.done = true;
  cook.doneTimer = 0;
  cook.evaluation = evaluateCooking(
    cook.ingredient,
    cook.seasoning,
    null,
    { surface: cook.surfaceTemp, core: cook.coreTemp, char: cook.char },
    0,
    CONFIG
  );
  state.lastEvaluation = cook.evaluation;
  state.drinkWindowActive = true;
  state.drinkWindowTimer = 0;
}

function finalizeServe(drink: ReturnType<typeof getDrinkById> | null): void {
  const cook = state.cook;
  if (!cook) return;
  const sinceServe = state.drinkWindowTimer;
  const evaluation = evaluateCooking(
    cook.ingredient,
    cook.seasoning,
    drink ?? null,
    { surface: cook.surfaceTemp, core: cook.coreTemp, char: cook.char },
    sinceServe,
    CONFIG
  );
  state.score += evaluation.total;
  state.lastEvaluation = evaluation;
  state.drinkWindowActive = false;
  state.drinkWindowTimer = 0;
  state.cook = null;
  state.selection.ingredientId = null;
  state.selection.seasoningId = null;
  state.selection.drinkId = drink?.id ?? null;
}

function update(dt: number): void {
  state.timeRemaining = Math.max(0, state.timeRemaining - dt);
  updateFire(state.fire, dt);

  const cook = state.cook;
  if (cook) {
    if (!cook.done) {
      const distance = clamp(CONFIG.fire.radius + cook.height, 40, 280);
      const heat = computeHeatPower(distance) * getFireHeatFactor(state.fire);
      state.heatLevel = heat;
      applyCookingStep(cook, dt, heat);
      cook.rotation += dt * 1.2;
      if (cook.surfaceTemp >= CONFIG.heat.charThreshold && sizzleCheck < CONFIG.heat.charThreshold) {
        void playSizzle();
      }
      sizzleCheck = cook.surfaceTemp;
    } else {
      coolDown(cook, dt);
      state.heatLevel = 40;
      state.drinkWindowTimer += dt;
      if (state.drinkWindowTimer > CONFIG.drinkWindow.total) {
        finalizeServe(null);
      }
    }
  } else {
    state.heatLevel = 30;
  }

  if (audioInitialized) {
    const volume = clamp(state.heatLevel / 260, 0.2, 1);
    void setFireVolume(volume);
  }
}

function gameLoop(time: number): void {
  const dt = Math.min((time - lastTime) / 1000, 0.05);
  lastTime = time;
  update(dt);
  render(state, renderer);
  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
