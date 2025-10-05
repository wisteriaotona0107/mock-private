import { GRAVITY, TILE_SIZE } from './types';
import type { PlayerState } from './types';
import { World } from './world';

const EPSILON = 0.001;

function resolveHorizontal(world: World, player: PlayerState, delta: number): void {
  if (delta === 0) {
    return;
  }
  const direction = Math.sign(delta);
  let newX = player.position.x + delta;
  const minY = Math.floor(player.position.y / TILE_SIZE);
  const maxY = Math.floor((player.position.y + player.height - EPSILON) / TILE_SIZE);
  if (direction > 0) {
    const futureRight = player.position.x + player.width + delta;
    const tileX = Math.floor(futureRight / TILE_SIZE);
    for (let ty = minY; ty <= maxY; ty += 1) {
      if (world.isSolid(tileX, ty)) {
        newX = tileX * TILE_SIZE - player.width - EPSILON;
        player.velocity.x = 0;
        break;
      }
    }
  } else {
    const futureLeft = player.position.x + delta;
    const tileX = Math.floor(futureLeft / TILE_SIZE);
    for (let ty = minY; ty <= maxY; ty += 1) {
      if (world.isSolid(tileX, ty)) {
        newX = (tileX + 1) * TILE_SIZE + EPSILON;
        player.velocity.x = 0;
        break;
      }
    }
  }
  player.position.x = newX;
}

function resolveVertical(world: World, player: PlayerState, delta: number): void {
  if (delta === 0) {
    return;
  }
  const direction = Math.sign(delta);
  let newY = player.position.y + delta;
  const minX = Math.floor(player.position.x / TILE_SIZE);
  const maxX = Math.floor((player.position.x + player.width - EPSILON) / TILE_SIZE);
  if (direction > 0) {
    const futureBottom = player.position.y + player.height + delta;
    const tileY = Math.floor(futureBottom / TILE_SIZE);
    for (let tx = minX; tx <= maxX; tx += 1) {
      if (world.isSolid(tx, tileY)) {
        newY = tileY * TILE_SIZE - player.height - EPSILON;
        player.velocity.y = 0;
        player.onGround = true;
        player.position.y = newY;
        return;
      }
    }
  } else {
    const futureTop = player.position.y + delta;
    const tileY = Math.floor(futureTop / TILE_SIZE);
    for (let tx = minX; tx <= maxX; tx += 1) {
      if (world.isSolid(tx, tileY)) {
        newY = (tileY + 1) * TILE_SIZE + EPSILON;
        player.velocity.y = 0;
        player.position.y = newY;
        return;
      }
    }
  }
  player.position.y = newY;
  if (direction !== 0) {
    player.onGround = direction < 0 ? player.onGround : false;
  }
}

/**
 * Integrate player position and resolve collisions with tiles.
 */
export function integratePlayer(world: World, player: PlayerState, dt: number): void {
  player.velocity.y += GRAVITY * dt;
  const deltaX = player.velocity.x * dt;
  const deltaY = player.velocity.y * dt;
  resolveHorizontal(world, player, deltaX);
  const wasFalling = player.velocity.y > 0;
  resolveVertical(world, player, deltaY);
  if (!wasFalling && player.velocity.y > 0) {
    player.onGround = false;
  }
}

export function snapToSurface(world: World, player: PlayerState): void {
  const tileX = Math.floor(player.position.x / TILE_SIZE);
  const surface = world.getSurfaceHeight(tileX);
  player.position.x = tileX * TILE_SIZE + TILE_SIZE / 2 - player.width / 2;
  player.position.y = surface * TILE_SIZE - player.height - 2;
}
