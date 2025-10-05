export const TILE_SIZE = 32;
export const CHUNK_SIZE = 64;
export const WORLD_HEIGHT = 256;
export const GRAVITY = 1800;
export const PLAYER_SPEED = 180;
export const PLAYER_ACCEL = 900;
export const PLAYER_JUMP_VELOCITY = 520;
export const AUTO_SAVE_INTERVAL_MS = 5000;
export const MAX_STACK_SIZE = 999;

export enum TileId {
  Air = 0,
  Dirt = 1,
  Stone = 2,
  Wood = 3,
  Leaves = 4,
}

export interface TileDefinition {
  id: TileId;
  name: string;
  color: string;
  solid: boolean;
}

export const TILE_DEFINITIONS: Record<TileId, TileDefinition> = {
  [TileId.Air]: { id: TileId.Air, name: 'Air', color: 'transparent', solid: false },
  [TileId.Dirt]: { id: TileId.Dirt, name: 'Dirt', color: '#5b3d2e', solid: true },
  [TileId.Stone]: { id: TileId.Stone, name: 'Stone', color: '#7d8896', solid: true },
  [TileId.Wood]: { id: TileId.Wood, name: 'Wood', color: '#8c6239', solid: true },
  [TileId.Leaves]: { id: TileId.Leaves, name: 'Leaves', color: '#3d8f40', solid: false },
};

export interface Chunk {
  key: string;
  x: number;
  y: number;
  tiles: Uint16Array;
  initialTiles: Uint16Array;
}

export interface WorldSaveChunk {
  key: string;
  tiles: Array<{ index: number; value: number }>;
}

export interface WorldSerializedState {
  seed: number;
  chunks: WorldSaveChunk[];
}

export interface PlayerState {
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  width: number;
  height: number;
  onGround: boolean;
}

export interface InventorySlot {
  tile: TileId;
  count: number;
}

export interface InventoryState {
  slots: InventorySlot[];
  selected: number;
}

export interface SaveData {
  world: WorldSerializedState;
  player: PlayerState;
  inventory: InventoryState;
  timestamp: number;
}

export interface CameraState {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PointerState {
  screenX: number;
  screenY: number;
  worldX: number;
  worldY: number;
  leftDown: boolean;
  rightDown: boolean;
  leftClicked: boolean;
  rightClicked: boolean;
}

export interface InputSnapshot {
  left: boolean;
  right: boolean;
  jump: boolean;
}

export type ChunkDiffMap = Map<string, Map<number, TileId>>;
