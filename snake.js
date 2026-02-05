import { GRID_SIZE, applyDirection, createInitialState, stepGame } from './gameLogic.js';

const boardEl = document.getElementById('board');
const scoreEl = document.getElementById('score');
const statusEl = document.getElementById('status');
const restartEl = document.getElementById('restart');

const TICK_MS = 140;
let state = createInitialState();
let timerId;

const cells = [];
for (let i = 0; i < GRID_SIZE * GRID_SIZE; i += 1) {
  const cell = document.createElement('div');
  cell.className = 'cell';
  boardEl.appendChild(cell);
  cells.push(cell);
}

function toIndex({ x, y }) {
  return y * GRID_SIZE + x;
}

function render() {
  cells.forEach((cell) => {
    cell.className = 'cell';
  });

  if (state.food) {
    cells[toIndex(state.food)].classList.add('food');
  }

  state.snake.forEach((segment) => {
    cells[toIndex(segment)].classList.add('snake');
  });

  scoreEl.textContent = String(state.score);

  if (state.gameOver) {
    statusEl.textContent = state.food === null ? 'You win! Board filled. Press Restart.' : 'Game over. Press Restart.';
  } else {
    statusEl.textContent = 'Use Arrow keys or WASD to move.';
  }
}

function tick() {
  state = stepGame(state);
  render();

  if (state.gameOver) {
    clearInterval(timerId);
  }
}

function setDirection(direction) {
  state = {
    ...state,
    queuedDirection: applyDirection(state.direction, direction),
  };
}

function restart() {
  state = createInitialState();
  clearInterval(timerId);
  timerId = setInterval(tick, TICK_MS);
  render();
}

window.addEventListener('keydown', (event) => {
  const key = event.key.toLowerCase();
  const mapping = {
    arrowup: 'up',
    w: 'up',
    arrowdown: 'down',
    s: 'down',
    arrowleft: 'left',
    a: 'left',
    arrowright: 'right',
    d: 'right',
  };

  const direction = mapping[key];
  if (direction) {
    event.preventDefault();
    setDirection(direction);
  }
});

restartEl.addEventListener('click', restart);

document.querySelectorAll('[data-direction]').forEach((button) => {
  button.addEventListener('click', () => {
    setDirection(button.dataset.direction);
  });
});

restart();
