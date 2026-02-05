import test from 'node:test';
import assert from 'node:assert/strict';
import { applyDirection, createInitialState, placeFood, stepGame } from './gameLogic.js';

test('applyDirection blocks immediate reverse', () => {
  assert.equal(applyDirection('right', 'left'), 'right');
  assert.equal(applyDirection('up', 'left'), 'left');
});

test('stepGame moves snake by one cell', () => {
  const next = stepGame(createInitialState(() => 0));
  assert.deepEqual(next.snake[0], { x: 11, y: 10 });
  assert.equal(next.score, 0);
  assert.equal(next.gameOver, false);
});

test('stepGame grows and increments score when food is eaten', () => {
  const state = createInitialState(() => 0);
  state.food = { x: 11, y: 10 };
  const next = stepGame(state, () => 0);

  assert.equal(next.snake.length, state.snake.length + 1);
  assert.equal(next.score, 1);
  assert.notDeepEqual(next.food, { x: 11, y: 10 });
});

test('stepGame sets gameOver on wall collision', () => {
  const state = {
    gridSize: 20,
    snake: [{ x: 19, y: 10 }],
    direction: 'right',
    queuedDirection: 'right',
    food: { x: 0, y: 0 },
    score: 0,
    gameOver: false,
  };

  const next = stepGame(state);
  assert.equal(next.gameOver, true);
});

test('placeFood never lands on snake body', () => {
  const snake = [{ x: 0, y: 0 }, { x: 1, y: 0 }];
  const food = placeFood(snake, 2, () => 0.99);
  assert.deepEqual(food, { x: 1, y: 1 });
});
