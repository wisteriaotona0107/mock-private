// src/renderer.ts
// Canvas2D を用いてゲームシーン全体を描画する。

import { CONFIG, type GameState } from './state';
import type { CookState } from './state';
import { buildUILayout, drawUI, type UILayout } from './ui';
import type { FireParticle } from './fire';
import { clamp, lerp } from './utils';

export interface Renderer {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  layout: UILayout | null;
}

export function createRenderer(canvas: HTMLCanvasElement): Renderer {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context is not available');
  }
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.touchAction = 'none';
  return {
    canvas,
    ctx,
    width: CONFIG.canvas.baseWidth,
    height: CONFIG.canvas.baseHeight,
    layout: null
  };
}

export function resizeRenderer(renderer: Renderer): void {
  const aspect = CONFIG.canvas.baseWidth / CONFIG.canvas.baseHeight;
  const availableWidth = window.innerWidth;
  const availableHeight = window.innerHeight;
  let width = availableWidth;
  let height = width / aspect;
  if (height > availableHeight) {
    height = availableHeight;
    width = height * aspect;
  }
  renderer.canvas.style.width = `${width}px`;
  renderer.canvas.style.height = `${height}px`;

  const dpr = window.devicePixelRatio || 1;
  renderer.canvas.width = width * dpr;
  renderer.canvas.height = height * dpr;
  renderer.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  renderer.width = width;
  renderer.height = height;
}

export function render(state: GameState, renderer: Renderer): void {
  resizeRenderer(renderer);
  const ctx = renderer.ctx;
  const width = renderer.width;
  const height = renderer.height;

  ctx.clearRect(0, 0, width, height);
  drawBackground(ctx, width, height);

  const layout = buildUILayout(width, height, state);
  renderer.layout = layout;

  drawTable(ctx, width, height);
  drawFire(ctx, state, width, height);
  if (state.cook) {
    drawSkewer(ctx, state.cook, width, height);
    drawIngredient(ctx, state.cook, width, height);
  }

  drawUI(ctx, state, layout);

  if (state.drinkWindowActive) {
    drawDrinkRipple(ctx, width, height, state.drinkWindowTimer / CONFIG.drinkWindow.total);
  }
}

function drawBackground(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#0f1115');
  gradient.addColorStop(1, '#1f1308');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

function drawTable(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  ctx.save();
  const panelWidth = width * CONFIG.ui.panelWidthRatio;
  const tableWidth = width - panelWidth;
  const tableHeight = height * 0.3;
  const y = height - tableHeight;
  const gradient = ctx.createLinearGradient(0, y, 0, height);
  gradient.addColorStop(0, '#4e342e');
  gradient.addColorStop(1, '#2d1f19');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, y, tableWidth, tableHeight + 20);
  ctx.restore();
}

function drawFire(ctx: CanvasRenderingContext2D, state: GameState, width: number, height: number): void {
  const panelWidth = width * CONFIG.ui.panelWidthRatio;
  const centerX = (width - panelWidth) / 2;
  const baseY = height * 0.72;
  const fireRadius = CONFIG.fire.radius * (width / CONFIG.canvas.baseWidth);

  // 焚き火の光のにじみ
  const radial = ctx.createRadialGradient(centerX, baseY, 10, centerX, baseY, fireRadius * 1.4);
  radial.addColorStop(0, 'rgba(255, 160, 64, 0.6)');
  radial.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = radial;
  ctx.fillRect(centerX - fireRadius * 1.4, baseY - fireRadius * 1.4, fireRadius * 2.8, fireRadius * 2.8);

  ctx.save();
  ctx.translate(centerX, baseY);
  ctx.globalCompositeOperation = 'lighter';
  state.fire.particles.forEach((particle: FireParticle) => {
    const alpha = 1 - particle.life / particle.maxLife;
    ctx.fillStyle = `rgba(255, ${Math.round(120 + alpha * 80)}, ${Math.round(40 + alpha * 40)}, ${alpha})`;
    ctx.beginPath();
    ctx.ellipse(particle.x, -particle.y, particle.size * 0.4, particle.size, 0, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();

  // 焚き火本体
  ctx.save();
  ctx.translate(centerX, baseY);
  const flameGradient = ctx.createRadialGradient(0, 0, 10, 0, 0, fireRadius * 0.7);
  flameGradient.addColorStop(0, 'rgba(255, 200, 120, 0.9)');
  flameGradient.addColorStop(0.5, 'rgba(255, 120, 60, 0.8)');
  flameGradient.addColorStop(1, 'rgba(200, 60, 20, 0)');
  ctx.fillStyle = flameGradient;
  ctx.beginPath();
  ctx.ellipse(0, -fireRadius * 0.1, fireRadius * 0.5, fireRadius * 0.7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawSkewer(ctx: CanvasRenderingContext2D, cook: CookState, width: number, height: number): void {
  ctx.save();
  const panelWidth = width * CONFIG.ui.panelWidthRatio;
  const originX = (width - panelWidth) / 2;
  const baseY = height * 0.55 + cook.height;
  const length = CONFIG.skewer.baseLength;
  const angle = cook.angle;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  const startX = originX - cos * length;
  const startY = baseY - sin * length;
  const endX = originX + cos * length;
  const endY = baseY + sin * length;

  ctx.lineWidth = 6;
  ctx.strokeStyle = '#c0a080';
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(endX, endY);
  ctx.stroke();

  ctx.fillStyle = '#d7ccc8';
  ctx.beginPath();
  ctx.arc(startX, startY, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawIngredient(ctx: CanvasRenderingContext2D, cook: CookState, width: number, height: number): void {
  const panelWidth = width * CONFIG.ui.panelWidthRatio;
  const centerX = (width - panelWidth) / 2;
  const centerY = height * 0.55 + cook.height;
  const radius = cook.ingredient.size * (width / CONFIG.canvas.baseWidth);

  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(cook.rotation);

  const [base, mid, dark] = cook.ingredient.colorStops;
  const burn = clamp(cook.char, 0, 1);
  const charMix = lerp(0, 0.8, burn);

  const gradient = ctx.createRadialGradient(0, 0, radius * 0.2, 0, 0, radius);
  gradient.addColorStop(0, lightenColor(base, 0.2 - charMix * 0.2));
  gradient.addColorStop(0.6, lerpColor(mid ?? base, dark ?? base, burn * 0.5));
  gradient.addColorStop(1, lerpColor(dark ?? mid ?? base, '#1b1b1b', burn));

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.ellipse(0, 0, radius * 1.6, radius, 0, 0, Math.PI * 2);
  ctx.fill();

  const highlight = ctx.createLinearGradient(-radius, -radius, radius, radius);
  highlight.addColorStop(0, 'rgba(255,255,255,0.1)');
  highlight.addColorStop(0.5, 'rgba(255,255,255,0.3)');
  highlight.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = highlight;
  ctx.beginPath();
  ctx.ellipse(-radius * 0.2, -radius * 0.2, radius, radius * 0.6, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawDrinkRipple(ctx: CanvasRenderingContext2D, width: number, height: number, t: number): void {
  const maxRadius = Math.min(width, height) * 0.25;
  const centerX = width * 0.85;
  const centerY = height * 0.15;
  const alpha = clamp(1 - t, 0, 1) * 0.5;

  ctx.save();
  ctx.strokeStyle = `rgba(200, 220, 255, ${alpha})`;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(centerX, centerY, maxRadius * t, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function lightenColor(color: string, amount: number): string {
  const c = parseColor(color);
  return `rgb(${clamp(Math.round(c[0] + 255 * amount), 0, 255)}, ${clamp(Math.round(c[1] + 255 * amount), 0, 255)}, ${clamp(Math.round(c[2] + 255 * amount), 0, 255)})`;
}

function lerpColor(a: string, b: string, t: number): string {
  const ca = parseColor(a);
  const cb = parseColor(b);
  const color = [
    Math.round(lerp(ca[0], cb[0], t)),
    Math.round(lerp(ca[1], cb[1], t)),
    Math.round(lerp(ca[2], cb[2], t))
  ];
  return `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
}

function parseColor(hex: string): [number, number, number] {
  if (hex.startsWith('#')) {
    const normalized = hex.replace('#', '');
    const size = normalized.length === 3 ? 1 : 2;
    const r = parseInt(normalized.slice(0, size), 16);
    const g = parseInt(normalized.slice(size, size * 2), 16);
    const b = parseInt(normalized.slice(size * 2), 16);
    if (size === 1) {
      return [r * 17, g * 17, b * 17];
    }
    return [r, g, b];
  }
  const match = hex.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (match) {
    return [Number(match[1]), Number(match[2]), Number(match[3])];
  }
  return [255, 255, 255];
}
