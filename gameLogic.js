export const GRID_SIZE = 20;

export const DIRECTIONS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const OPPOSITE = {
  up: 'down',
  down: 'up',
  left: 'right',
  right: 'left',
};

export function createInitialState(rng = Math.random) {
  const snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ];

  return {
    gridSize: GRID_SIZE,
    snake,
    direction: 'right',
    queuedDirection: 'right',
    food: placeFood(snake, GRID_SIZE, rng),
    score: 0,
    gameOver: false,
  };
}

export function applyDirection(currentDirection, requestedDirection) {
  if (!DIRECTIONS[requestedDirection]) {
    return currentDirection;
  }

  if (OPPOSITE[currentDirection] === requestedDirection) {
    return currentDirection;
  }

  return requestedDirection;
}

export function placeFood(snake, gridSize, rng = Math.random) {
  const occupied = new Set(snake.map((segment) => `${segment.x},${segment.y}`));
  const freeCells = [];

  for (let y = 0; y < gridSize; y += 1) {
    for (let x = 0; x < gridSize; x += 1) {
      if (!occupied.has(`${x},${y}`)) {
        freeCells.push({ x, y });
      }
    }
  }

  if (freeCells.length === 0) {
    return null;
  }

  const index = Math.floor(rng() * freeCells.length);
  return freeCells[index];
}

export function stepGame(state, rng = Math.random) {
  if (state.gameOver) {
    return state;
  }

  const direction = state.queuedDirection;
  const vector = DIRECTIONS[direction];
  const nextHead = {
    x: state.snake[0].x + vector.x,
    y: state.snake[0].y + vector.y,
  };

  const hitWall =
    nextHead.x < 0 ||
    nextHead.y < 0 ||
    nextHead.x >= state.gridSize ||
    nextHead.y >= state.gridSize;

  if (hitWall) {
    return { ...state, direction, gameOver: true };
  }

  const grew = state.food && nextHead.x === state.food.x && nextHead.y === state.food.y;
  const bodyToCheck = grew ? state.snake : state.snake.slice(0, -1);
  const hitSelf = bodyToCheck.some((segment) => segment.x === nextHead.x && segment.y === nextHead.y);

  if (hitSelf) {
    return { ...state, direction, gameOver: true };
  }

  const snake = [nextHead, ...state.snake];
  if (!grew) {
    snake.pop();
  }

  const food = grew ? placeFood(snake, state.gridSize, rng) : state.food;

  return {
    ...state,
    snake,
    direction,
    food,
    score: state.score + (grew ? 1 : 0),
    gameOver: food === null,
  };
}
