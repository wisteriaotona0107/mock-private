import { NoiseGenerator } from './noise';
import {
  CHUNK_SIZE,
  Chunk,
  ChunkDiffMap,
  TileId,
  TILE_DEFINITIONS,
  WorldSaveChunk,
  WorldSerializedState,
} from './types';

const SURFACE_LEVEL = 64;
const STONE_DEPTH = 12;
const TREE_CHANCE = 0.08;
const TREE_HEIGHT_MIN = 3;
const TREE_HEIGHT_MAX = 5;

/**
 * Tile world with deterministic chunk generation and diff tracking for saves.
 */
export class World {
  readonly seed: number;
  private readonly noise: NoiseGenerator;
  private readonly chunks: Map<string, Chunk> = new Map();
  private readonly diffs: ChunkDiffMap = new Map();

  constructor(seed: number) {
    this.seed = seed;
    this.noise = new NoiseGenerator(seed);
  }

  getDiffs(): ChunkDiffMap {
    return this.diffs;
  }

  clearDiffs(): void {
    this.diffs.clear();
  }

  private chunkKey(cx: number, cy: number): string {
    return `${cx},${cy}`;
  }

  private createChunk(cx: number, cy: number): Chunk {
    const key = this.chunkKey(cx, cy);
    const tiles = new Uint16Array(CHUNK_SIZE * CHUNK_SIZE);
    const initialTiles = new Uint16Array(CHUNK_SIZE * CHUNK_SIZE);
    const chunk: Chunk = { key, x: cx, y: cy, tiles, initialTiles };
    this.populateChunk(chunk);
    chunk.initialTiles.set(chunk.tiles);
    this.chunks.set(key, chunk);
    return chunk;
  }

  private populateChunk(chunk: Chunk): void {
    for (let localY = 0; localY < CHUNK_SIZE; localY += 1) {
      for (let localX = 0; localX < CHUNK_SIZE; localX += 1) {
        const wx = chunk.x * CHUNK_SIZE + localX;
        const wy = chunk.y * CHUNK_SIZE + localY;
        const surface = this.getSurfaceHeight(wx);
        let tile = TileId.Air;
        if (wy > surface) {
          const depth = wy - surface;
          tile = depth > STONE_DEPTH ? TileId.Stone : TileId.Dirt;
        } else if (wy === surface) {
          tile = TileId.Dirt;
        }
        chunk.tiles[localY * CHUNK_SIZE + localX] = tile;
      }
    }

    this.decorateChunk(chunk);
  }

  private decorateChunk(chunk: Chunk): void {
    for (let localX = 0; localX < CHUNK_SIZE; localX += 1) {
      const wx = chunk.x * CHUNK_SIZE + localX;
      const treeNoise = this.noise.sample(wx * 0.12);
      if (treeNoise > 1 - TREE_CHANCE) {
        const surface = this.getSurfaceHeight(wx);
        const localSurface = surface - chunk.y * CHUNK_SIZE;
        if (localSurface > 1 && localSurface < CHUNK_SIZE - TREE_HEIGHT_MAX - 2) {
          const height = TREE_HEIGHT_MIN + Math.floor((treeNoise % 1) * (TREE_HEIGHT_MAX - TREE_HEIGHT_MIN + 1));
          for (let i = 1; i <= height; i += 1) {
            this.setTile(wx, surface - i, TileId.Wood, false);
          }
          const leafRadius = 2;
          for (let ly = -leafRadius; ly <= leafRadius; ly += 1) {
            for (let lx = -leafRadius; lx <= leafRadius; lx += 1) {
              if (Math.abs(lx) + Math.abs(ly) <= leafRadius + 1) {
                this.setTile(wx + lx, surface - height - 1 + ly, TileId.Leaves, false);
              }
            }
          }
        }
      }
    }
  }

  private ensureChunk(cx: number, cy: number): Chunk {
    const key = this.chunkKey(cx, cy);
    return this.chunks.get(key) ?? this.createChunk(cx, cy);
  }

  private getChunkForTile(wx: number, wy: number): Chunk {
    const cx = Math.floor(wx / CHUNK_SIZE);
    const cy = Math.floor(wy / CHUNK_SIZE);
    return this.ensureChunk(cx, cy);
  }

  private getLocalIndex(wx: number, wy: number): { chunk: Chunk; index: number } {
    const chunk = this.getChunkForTile(wx, wy);
    const localX = ((wx % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
    const localY = ((wy % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
    const index = localY * CHUNK_SIZE + localX;
    return { chunk, index };
  }

  getTile(wx: number, wy: number): TileId {
    const { chunk, index } = this.getLocalIndex(wx, wy);
    return chunk.tiles[index] as TileId;
  }

  setTile(wx: number, wy: number, tile: TileId, trackDiff = true): void {
    const { chunk, index } = this.getLocalIndex(wx, wy);
    const current = chunk.tiles[index] as TileId;
    if (current === tile) {
      return;
    }
    chunk.tiles[index] = tile;
    if (trackDiff) {
      let diff = this.diffs.get(chunk.key);
      if (!diff) {
        diff = new Map();
        this.diffs.set(chunk.key, diff);
      }
      const original = chunk.initialTiles[index] as TileId;
      if (tile === original) {
        diff.delete(index);
        if (diff.size === 0) {
          this.diffs.delete(chunk.key);
        }
      } else {
        diff.set(index, tile);
      }
    }
  }

  getSurfaceHeight(wx: number): number {
    const noiseValue = this.noise.fbm(wx * 0.04, 5, 0.55, 2.2);
    return Math.floor(SURFACE_LEVEL + noiseValue * 18);
  }

  ensureArea(centerX: number, centerY: number, radius: number): void {
    const minX = Math.floor((centerX - radius) / CHUNK_SIZE);
    const maxX = Math.floor((centerX + radius) / CHUNK_SIZE);
    const minY = Math.floor((centerY - radius) / CHUNK_SIZE);
    const maxY = Math.floor((centerY + radius) / CHUNK_SIZE);
    for (let cy = minY; cy <= maxY; cy += 1) {
      for (let cx = minX; cx <= maxX; cx += 1) {
        this.ensureChunk(cx, cy);
      }
    }
  }

  serialize(): WorldSerializedState {
    const chunks: WorldSaveChunk[] = [];
    for (const [key, diff] of this.diffs) {
      const tiles: Array<{ index: number; value: number }> = [];
      diff.forEach((value, index) => {
        tiles.push({ index, value });
      });
      chunks.push({ key, tiles });
    }
    return { seed: this.seed, chunks };
  }

  applySerialized(serialized: WorldSerializedState | undefined): void {
    if (!serialized || serialized.seed !== this.seed) {
      return;
    }
    for (const chunkData of serialized.chunks) {
      const [cxStr, cyStr] = chunkData.key.split(',');
      const cx = Number(cxStr);
      const cy = Number(cyStr);
      const chunk = this.ensureChunk(cx, cy);
      for (const entry of chunkData.tiles) {
        chunk.tiles[entry.index] = entry.value;
      }
      let diff = this.diffs.get(chunk.key);
      if (!diff) {
        diff = new Map();
        this.diffs.set(chunk.key, diff);
      }
      diff.clear();
      for (const entry of chunkData.tiles) {
        diff.set(entry.index, entry.value as TileId);
      }
    }
  }

  isSolid(wx: number, wy: number): boolean {
    const tile = this.getTile(wx, wy);
    return TILE_DEFINITIONS[tile].solid;
  }
}
