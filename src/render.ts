import { TILE_DEFINITIONS, TILE_SIZE, type CameraState } from './types';
import type { PlayerState } from './types';
import { World } from './world';

interface PointerHighlight {
  tileX: number;
  tileY: number;
}

export function drawScene(
  ctx: CanvasRenderingContext2D,
  world: World,
  player: PlayerState,
  camera: CameraState,
  pointer: PointerHighlight | undefined,
): void {
  ctx.clearRect(0, 0, camera.width, camera.height);

  const startTileX = Math.floor(camera.x / TILE_SIZE) - 1;
  const endTileX = Math.ceil((camera.x + camera.width) / TILE_SIZE) + 1;
  const startTileY = Math.floor(camera.y / TILE_SIZE) - 1;
  const endTileY = Math.ceil((camera.y + camera.height) / TILE_SIZE) + 1;

  for (let ty = startTileY; ty <= endTileY; ty += 1) {
    for (let tx = startTileX; tx <= endTileX; tx += 1) {
      const tile = world.getTile(tx, ty);
      if (tile === 0) {
        continue;
      }
      const def = TILE_DEFINITIONS[tile];
      ctx.fillStyle = def.color;
      const screenX = Math.floor(tx * TILE_SIZE - camera.x);
      const screenY = Math.floor(ty * TILE_SIZE - camera.y);
      ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
    }
  }

  ctx.fillStyle = '#e9f1ff';
  const playerX = player.position.x - camera.x;
  const playerY = player.position.y - camera.y;
  ctx.fillRect(playerX, playerY, player.width, player.height);

  if (pointer) {
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 2;
    const screenX = pointer.tileX * TILE_SIZE - camera.x;
    const screenY = pointer.tileY * TILE_SIZE - camera.y;
    ctx.strokeRect(screenX + 0.5, screenY + 0.5, TILE_SIZE - 1, TILE_SIZE - 1);
  }
}

export function computeCamera(player: PlayerState, canvas: HTMLCanvasElement): CameraState {
  return {
    x: player.position.x + player.width / 2 - canvas.width / 2,
    y: player.position.y + player.height / 2 - canvas.height / 2,
    width: canvas.width,
    height: canvas.height,
  };
}
