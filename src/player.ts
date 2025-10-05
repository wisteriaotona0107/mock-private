import {
  PLAYER_ACCEL,
  PLAYER_JUMP_VELOCITY,
  PLAYER_SPEED,
  TILE_SIZE,
  type InputSnapshot,
  type PlayerState,
} from './types';
import { integratePlayer } from './physics';
import { World } from './world';

export function createPlayer(spawnX: number, spawnY: number): PlayerState {
  return {
    position: { x: spawnX, y: spawnY },
    velocity: { x: 0, y: 0 },
    width: TILE_SIZE * 0.6,
    height: TILE_SIZE * 1.8,
    onGround: false,
  };
}

function approach(current: number, target: number, accel: number, dt: number): number {
  if (current < target) {
    return Math.min(target, current + accel * dt);
  }
  if (current > target) {
    return Math.max(target, current - accel * dt);
  }
  return target;
}

/**
 * Update velocity from input and integrate the physics step.
 */
export function updatePlayer(world: World, player: PlayerState, input: InputSnapshot, dt: number): void {
  let target = 0;
  if (input.left && !input.right) {
    target = -PLAYER_SPEED;
  } else if (input.right && !input.left) {
    target = PLAYER_SPEED;
  }
  player.velocity.x = approach(player.velocity.x, target, PLAYER_ACCEL, dt);

  if (input.jump && player.onGround) {
    player.velocity.y = -PLAYER_JUMP_VELOCITY;
    player.onGround = false;
  }

  integratePlayer(world, player, dt);
}
