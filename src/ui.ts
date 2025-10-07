// src/ui.ts
// HUDとUIパネルのレイアウト／描画を担当する。

import type { GameState } from './state';
import { CONFIG } from './state';
import { DRINKS, INGREDIENTS, SEASONINGS } from './ingredients';
import type { Rectangle } from './utils';
import { clamp, easeOutCubic } from './utils';

export type UIButtonKind = 'ingredient' | 'seasoning' | 'drink' | 'serve';

export interface UIButton {
  id: string;
  kind: UIButtonKind;
  rect: Rectangle;
  label: string;
  accent: string;
  active: boolean;
}

export interface UILayout {
  panelRect: Rectangle;
  gaugeRect: Rectangle;
  heatRect: Rectangle;
  buttons: UIButton[];
}

export function buildUILayout(width: number, height: number, state: GameState): UILayout {
  const panelWidth = width * CONFIG.ui.panelWidthRatio;
  const panelRect: Rectangle = {
    x: width - panelWidth,
    y: 0,
    width: panelWidth,
    height
  };

  const padding = CONFIG.ui.padding;
  const buttonWidth = panelRect.width - padding * 2;
  const buttonHeight = 44;

  const buttons: UIButton[] = [];
  let cursorY = panelRect.y + 120;

  const addButton = (id: string, kind: UIButtonKind, label: string, accent: string, active: boolean, col?: number, cols?: number, rowIndex?: number): void => {
    if (cols && cols > 1 && rowIndex !== undefined && col !== undefined) {
      const spacing = 12;
      const cellWidth = (buttonWidth - spacing * (cols - 1)) / cols;
      const x = panelRect.x + padding + col * (cellWidth + spacing);
      const y = cursorY + rowIndex * (buttonHeight + 10);
      buttons.push({
        id,
        kind,
        label,
        accent,
        active,
        rect: { x, y, width: cellWidth, height: buttonHeight }
      });
    } else {
      buttons.push({
        id,
        kind,
        label,
        accent,
        active,
        rect: { x: panelRect.x + padding, y: cursorY, width: buttonWidth, height: buttonHeight }
      });
      cursorY += buttonHeight + 10;
    }
  };

  INGREDIENTS.forEach((ingredient) => {
    const active = state.cook?.ingredient.id === ingredient.id;
    addButton(ingredient.id, 'ingredient', ingredient.name, ingredient.colorStops[1] ?? '#fff', active);
  });

  cursorY += 10;
  const seasoningRows = Math.ceil(SEASONINGS.length / 2);
  for (let row = 0; row < seasoningRows; row++) {
    for (let col = 0; col < 2; col++) {
      const index = row * 2 + col;
      if (index >= SEASONINGS.length) continue;
      const item = SEASONINGS[index];
      const active = state.cook?.seasoning?.id === item.id;
      addButton(item.id, 'seasoning', item.name, item.accentColor, active, col, 2, row);
    }
  }
  cursorY += seasoningRows * (buttonHeight + 10) + 20;

  const drinkRows = Math.ceil(DRINKS.length / 2);
  for (let row = 0; row < drinkRows; row++) {
    for (let col = 0; col < 2; col++) {
      const index = row * 2 + col;
      if (index >= DRINKS.length) continue;
      const item = DRINKS[index];
      const active = state.selection.drinkId === item.id;
      addButton(item.id, 'drink', item.name, item.accentColor, active, col, 2, row);
    }
  }

  const serveRect: Rectangle = {
    x: panelRect.x + padding,
    y: height - padding - buttonHeight,
    width: buttonWidth,
    height: buttonHeight
  };
  buttons.push({
    id: 'serve',
    kind: 'serve',
    label: state.cook?.done ? '評価待ち' : 'サーブする',
    accent: '#ff8f00',
    active: state.cook !== null && !state.cook.done,
    rect: serveRect
  });

  const gaugeRect: Rectangle = {
    x: padding,
    y: height - CONFIG.ui.gaugeHeight - padding,
    width: width - panelRect.width - padding * 2,
    height: CONFIG.ui.gaugeHeight
  };

  const heatRect: Rectangle = {
    x: gaugeRect.x,
    y: gaugeRect.y - 40,
    width: gaugeRect.width,
    height: 24
  };

  return {
    panelRect,
    gaugeRect,
    heatRect,
    buttons
  };
}

export function drawUI(ctx: CanvasRenderingContext2D, state: GameState, layout: UILayout): void {
  drawPanel(ctx, layout.panelRect);
  drawHeader(ctx, state, layout.panelRect);
  drawButtons(ctx, layout.buttons);
  drawGauge(ctx, state, layout.gaugeRect);
  drawHeatBar(ctx, state, layout.heatRect);
  drawFloatingText(ctx, state, layout.panelRect);
}

function drawPanel(ctx: CanvasRenderingContext2D, rect: Rectangle): void {
  ctx.save();
  ctx.fillStyle = 'rgba(24, 18, 12, 0.8)';
  ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
  ctx.restore();
}

function drawHeader(ctx: CanvasRenderingContext2D, state: GameState, rect: Rectangle): void {
  ctx.save();
  ctx.fillStyle = '#ffe0b2';
  ctx.font = 'bold 28px "Noto Sans JP", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('FireTaste', rect.x + rect.width / 2, rect.y + 40);

  ctx.font = '20px "Noto Sans JP", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`残り時間: ${state.timeRemaining.toFixed(0)}s`, rect.x + 20, rect.y + 80);
  ctx.fillText(`総スコア: ${state.score}`, rect.x + 20, rect.y + 110);
  ctx.restore();
}

function drawButtons(ctx: CanvasRenderingContext2D, buttons: UIButton[]): void {
  buttons.forEach((button) => {
    ctx.save();
    ctx.fillStyle = button.active ? `${button.accent}cc` : 'rgba(255, 255, 255, 0.08)';
    ctx.strokeStyle = button.active ? '#fff' : 'rgba(255,255,255,0.2)';
    roundRect(ctx, button.rect.x, button.rect.y, button.rect.width, button.rect.height, 10);
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = button.active ? '#1b1b1b' : '#fff';
    ctx.font = '16px "Noto Sans JP", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(button.label, button.rect.x + button.rect.width / 2, button.rect.y + button.rect.height / 2 + 1);
    ctx.restore();
  });
}

function drawGauge(ctx: CanvasRenderingContext2D, state: GameState, rect: Rectangle): void {
  ctx.save();
  ctx.fillStyle = 'rgba(15, 10, 6, 0.6)';
  roundRect(ctx, rect.x, rect.y, rect.width, rect.height, 12);
  ctx.fill();

  const cook = state.cook;
  if (cook) {
    const ratioSurface = clamp((cook.surfaceTemp - 50) / 200, 0, 1);
    const ratioCore = clamp((cook.coreTemp - 30) / 120, 0, 1);
    const ratioChar = cook.char;

    const barHeight = rect.height / 3 - 4;
    drawGaugeBar(ctx, rect.x + 16, rect.y + 12, rect.width - 32, barHeight, ratioSurface, '#ffb74d', '表面温度');
    drawGaugeBar(ctx, rect.x + 16, rect.y + 12 + barHeight + 6, rect.width - 32, barHeight, ratioCore, '#81d4fa', '中心温度');
    drawGaugeBar(ctx, rect.x + 16, rect.y + 12 + (barHeight + 6) * 2, rect.width - 32, barHeight, ratioChar, '#8d6e63', '焦げ');
  } else {
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '18px "Noto Sans JP", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('食材を選んで開始', rect.x + rect.width / 2, rect.y + rect.height / 2);
  }
  ctx.restore();
}

function drawHeatBar(ctx: CanvasRenderingContext2D, state: GameState, rect: Rectangle): void {
  ctx.save();
  ctx.fillStyle = 'rgba(15,10,6,0.6)';
  roundRect(ctx, rect.x, rect.y, rect.width, rect.height, 12);
  ctx.fill();

  const heat = clamp(state.heatLevel / 260, 0, 1);
  const barWidth = rect.width - 32;
  const x = rect.x + 16;
  const y = rect.y + rect.height / 2 - 10;
  ctx.fillStyle = '#ff7043';
  roundRect(ctx, x, y, barWidth * heat, 20, 10);
  ctx.fill();

  ctx.strokeStyle = 'rgba(255,255,255,0.3)';
  roundRect(ctx, x, y, barWidth, 20, 10);
  ctx.stroke();

  ctx.fillStyle = '#fff';
  ctx.font = '16px "Noto Sans JP", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('火力', rect.x + 16, rect.y + 18);
  ctx.restore();
}

function drawFloatingText(ctx: CanvasRenderingContext2D, state: GameState, panelRect: Rectangle): void {
  if (!state.lastEvaluation) return;
  const evalResult = state.lastEvaluation;
  const baseY = panelRect.y + 150;
  const t = clamp(evalResult.total / 40, 0, 1);
  const color = `rgba(${Math.round(255 - 80 * t)}, ${Math.round(180 * t + 40)}, 120, 0.9)`;
  ctx.save();
  ctx.fillStyle = color;
  ctx.font = '24px "Noto Sans JP", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`${evalResult.label} +${evalResult.total}`, panelRect.x + panelRect.width / 2, baseY);

  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.font = '16px "Noto Sans JP", sans-serif';
  ctx.textAlign = 'left';
  const lines = [
    `ベース: ${evalResult.baseScore}`,
    `調味料: ${evalResult.seasoningBonus}`,
    `飲み物: ${evalResult.drinkBonus}`
  ];
  lines.forEach((line, index) => {
    ctx.fillText(line, panelRect.x + 24, baseY + 26 + index * 20);
  });
  if (evalResult.drink) {
    ctx.fillText(`タイミング倍率: x${evalResult.timingMultiplier.toFixed(2)}`, panelRect.x + 24, baseY + 26 + lines.length * 20);
  }
  ctx.restore();
}

function drawGaugeBar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  ratio: number,
  color: string,
  label: string
): void {
  ctx.save();
  ctx.fillStyle = 'rgba(255,255,255,0.1)';
  roundRect(ctx, x, y, width, height, 8);
  ctx.fill();

  const eased = easeOutCubic(ratio);
  ctx.fillStyle = color;
  roundRect(ctx, x, y, width * eased, height, 8);
  ctx.fill();

  ctx.fillStyle = '#fff';
  ctx.font = '14px "Noto Sans JP", sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x + 8, y + height / 2);
  ctx.restore();
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number): void {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

export function findButtonAt(layout: UILayout, x: number, y: number): UIButton | null {
  for (const button of layout.buttons) {
    if (x >= button.rect.x && x <= button.rect.x + button.rect.width && y >= button.rect.y && y <= button.rect.y + button.rect.height) {
      return button;
    }
  }
  return null;
}
