# mock-private

Classic Snake implementation using plain HTML/CSS/JS.

## Run locally

1. Start a local server:
   ```bash
   npm run start
   ```
2. Open `http://localhost:4173`.

## Controls

- Keyboard: Arrow keys or `WASD`
- Mobile/on-screen: directional buttons under the board
- Restart: `Restart` button

## Manual verification checklist

- [ ] Snake moves one tile per tick in current direction.
- [ ] Direction changes work with Arrow keys and WASD.
- [ ] Reverse direction is blocked (no instant 180° turn).
- [ ] Eating food grows snake and increments score.
- [ ] Hitting wall or body triggers game over.
- [ ] Restart resets snake, score, and food.
