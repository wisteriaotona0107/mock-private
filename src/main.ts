import '../styles.css';
import {
  AUTO_SAVE_INTERVAL_MS,
  CHUNK_SIZE,
  TILE_DEFINITIONS,
  TILE_SIZE,
  TileId,
  type CameraState,
  type InventoryState,
  type PlayerState,
} from './types';
import { World } from './world';
import { createPlayer, updatePlayer } from './player';
import { InputManager } from './input';
import { addToInventory, consumeSelected, createInventory, getSelectedSlot, selectSlot } from './inventory';
import { computeCamera, drawScene } from './render';
import { loadGame, resetSaves, saveGame } from './save';

const DEFAULT_SEED = 424242;

const canvas = document.getElementById('game') as HTMLCanvasElement | null;
if (!canvas) {
  throw new Error('Canvas element missing');
}
const ctx = canvas.getContext('2d');
if (!ctx) {
  throw new Error('Unable to create 2D context');
}

const debugPanel = document.getElementById('debug-panel');
const hotbarElement = document.getElementById('hotbar');
const menuElement = document.getElementById('menu');
const notificationElement = document.getElementById('notification');
const saveBtn = document.getElementById('save-btn');
const loadBtn = document.getElementById('load-btn');
const resetBtn = document.getElementById('reset-btn');

if (!debugPanel || !hotbarElement || !menuElement || !notificationElement || !saveBtn || !loadBtn || !resetBtn) {
  throw new Error('UI elements missing');
}

let currentSeed = DEFAULT_SEED;
let world: World = new World(currentSeed);
let inventory: InventoryState = createInventory();
let player: PlayerState = spawnPlayer(world);

world.ensureArea(0, world.getSurfaceHeight(0), CHUNK_SIZE * 2);

const input = new InputManager(canvas);
let camera: CameraState = computeCamera(player, canvas);
let paused = false;
let lastTime = performance.now();
let fps = 60;
let breakCooldown = 0;
let placeCooldown = 0;
const slotElements: HTMLDivElement[] = [];

function spawnPlayer(targetWorld: World): PlayerState {
  const tileX = 0;
  const surface = targetWorld.getSurfaceHeight(tileX);
  const spawnX = tileX * TILE_SIZE + TILE_SIZE / 2;
  const spawnY = (surface - 2) * TILE_SIZE;
  const newPlayer = createPlayer(spawnX, spawnY);
  newPlayer.position.x -= newPlayer.width / 2;
  return newPlayer;
}

function resizeCanvas(): void {
  const dpr = window.devicePixelRatio || 1;
  const width = Math.floor(window.innerWidth * dpr);
  const height = Math.floor(window.innerHeight * dpr);
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
}

function buildHotbar(): void {
  hotbarElement.innerHTML = '';
  slotElements.length = 0;
  inventory.slots.forEach((_, index) => {
    const slot = document.createElement('div');
    slot.className = 'hotbar-slot';
    const label = document.createElement('div');
    label.className = 'label';
    label.textContent = String(index + 1);
    const count = document.createElement('div');
    count.className = 'count';
    slot.append(count);
    slot.append(label);
    hotbarElement.append(slot);
    slotElements.push(slot);
  });
  refreshHotbar();
}

function refreshHotbar(): void {
  inventory.slots.forEach((slot, index) => {
    const el = slotElements[index];
    if (!el) return;
    el.classList.toggle('selected', index === inventory.selected);
    const countEl = el.querySelector('.count') as HTMLDivElement | null;
    if (slot.tile === TileId.Air || slot.count <= 0) {
      el.style.background = 'rgba(255,255,255,0.04)';
      if (countEl) countEl.textContent = '';
      el.title = 'Empty';
    } else {
      const def = TILE_DEFINITIONS[slot.tile];
      el.style.background = `${def.color}aa`;
      if (countEl) countEl.textContent = String(slot.count);
      el.title = `${def.name} x${slot.count}`;
    }
  });
}

function updateDebugPanel(): void {
  const chunkX = Math.floor(player.position.x / TILE_SIZE / CHUNK_SIZE);
  const chunkY = Math.floor(player.position.y / TILE_SIZE / CHUNK_SIZE);
  debugPanel.innerHTML = `FPS: ${fps.toFixed(0)}<br/>Chunk: ${chunkX}, ${chunkY}<br/>Seed: ${world.seed}`;
}

function tileFromPointer(): { x: number; y: number } {
  return {
    x: Math.floor(input.pointer.worldX / TILE_SIZE),
    y: Math.floor(input.pointer.worldY / TILE_SIZE),
  };
}

function playerIntersectsTile(tileX: number, tileY: number): boolean {
  const tileLeft = tileX * TILE_SIZE;
  const tileTop = tileY * TILE_SIZE;
  const tileRight = tileLeft + TILE_SIZE;
  const tileBottom = tileTop + TILE_SIZE;
  const playerLeft = player.position.x;
  const playerTop = player.position.y;
  const playerRight = player.position.x + player.width;
  const playerBottom = player.position.y + player.height;
  return !(tileRight <= playerLeft || tileLeft >= playerRight || tileBottom <= playerTop || tileTop >= playerBottom);
}

async function performSave(showToast = true): Promise<void> {
  const payload = {
    world: world.serialize(),
    player: {
      position: { ...player.position },
      velocity: { ...player.velocity },
      width: player.width,
      height: player.height,
      onGround: player.onGround,
    },
    inventory: {
      selected: inventory.selected,
      slots: inventory.slots.map((slot) => ({ ...slot })),
    },
    timestamp: Date.now(),
  };
  await saveGame(payload);
  if (showToast) {
    showNotification('Saved');
  }
}

async function performLoad(): Promise<void> {
  const data = await loadGame();
  if (!data) {
    showNotification('No save data');
    return;
  }
  currentSeed = data.world.seed ?? currentSeed;
  world = new World(currentSeed);
  world.applySerialized(data.world);
  player.position.x = data.player.position.x;
  player.position.y = data.player.position.y;
  player.velocity.x = data.player.velocity.x;
  player.velocity.y = data.player.velocity.y;
  player.onGround = data.player.onGround;
  player.width = data.player.width;
  player.height = data.player.height;
  inventory = {
    selected: data.inventory.selected,
    slots: data.inventory.slots.map((slot) => ({ ...slot })),
  };
  buildHotbar();
  world.ensureArea(
    player.position.x / TILE_SIZE,
    player.position.y / TILE_SIZE,
    CHUNK_SIZE * 2,
  );
  showNotification('Loaded');
}

async function performReset(): Promise<void> {
  await resetSaves();
  world = new World(currentSeed);
  inventory = createInventory();
  player = spawnPlayer(world);
  buildHotbar();
  world.ensureArea(
    player.position.x / TILE_SIZE,
    player.position.y / TILE_SIZE,
    CHUNK_SIZE * 2,
  );
  showNotification('World reset');
}

function toggleMenu(force?: boolean): void {
  if (force !== undefined) {
    paused = force;
  } else {
    paused = !paused;
  }
  menuElement.classList.toggle('hidden', !paused);
  input.setCapturing(!paused);
}

function showNotification(text: string): void {
  notificationElement.textContent = text;
  notificationElement.classList.remove('hidden');
  setTimeout(() => {
    notificationElement.classList.add('hidden');
  }, 1500);
}

function handleEditing(dt: number, pointerTile: { x: number; y: number }): void {
  breakCooldown = Math.max(0, breakCooldown - dt);
  placeCooldown = Math.max(0, placeCooldown - dt);
  if (input.pointer.leftDown && breakCooldown <= 0) {
    const tile = world.getTile(pointerTile.x, pointerTile.y);
    if (tile !== TileId.Air) {
      world.setTile(pointerTile.x, pointerTile.y, TileId.Air);
      addToInventory(inventory, tile);
      refreshHotbar();
      breakCooldown = 0.18;
    }
  }
  if (input.pointer.rightDown && placeCooldown <= 0) {
    const slot = getSelectedSlot(inventory);
    if (slot.tile !== TileId.Air && slot.count > 0) {
      const existing = world.getTile(pointerTile.x, pointerTile.y);
      if (!TILE_DEFINITIONS[existing].solid && !playerIntersectsTile(pointerTile.x, pointerTile.y)) {
        world.setTile(pointerTile.x, pointerTile.y, slot.tile);
        if (consumeSelected(inventory)) {
          refreshHotbar();
        }
        placeCooldown = 0.18;
      }
    }
  }
}

function update(dt: number): void {
  const inputSnapshot = input.snapshot();
  const tileCenterX = (player.position.x + player.width / 2) / TILE_SIZE;
  const tileCenterY = (player.position.y + player.height / 2) / TILE_SIZE;
  world.ensureArea(tileCenterX, tileCenterY, CHUNK_SIZE * 2);
  updatePlayer(world, player, inputSnapshot, dt);
}

function gameLoop(now: number): void {
  const dt = Math.min((now - lastTime) / 1000, 0.05);
  lastTime = now;
  fps = fps * 0.92 + (1 / Math.max(dt, 0.0001)) * 0.08;

  resizeCanvas();
  camera = computeCamera(player, canvas);
  input.updateWorldPointer(camera);
  const pointerTile = tileFromPointer();

  if (!paused) {
    handleEditing(dt, pointerTile);
    update(dt);
  }

  drawScene(ctx, world, player, camera, pointerTile);
  updateDebugPanel();

  input.consumeClicks();
  requestAnimationFrame(gameLoop);
}

buildHotbar();
updateDebugPanel();
resizeCanvas();
requestAnimationFrame(gameLoop);

window.addEventListener('resize', () => {
  resizeCanvas();
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    toggleMenu();
  }
  if (!paused && event.key >= '1' && event.key <= '9') {
    selectSlot(inventory, Number(event.key) - 1);
    refreshHotbar();
  }
});

saveBtn.addEventListener('click', () => {
  void performSave();
});

loadBtn.addEventListener('click', () => {
  void performLoad();
});

resetBtn.addEventListener('click', () => {
  void performReset();
});

setInterval(() => {
  if (!paused) {
    void performSave(false);
  }
}, AUTO_SAVE_INTERVAL_MS);

void loadGame().then((data) => {
  if (!data) {
    return;
  }
  currentSeed = data.world.seed ?? currentSeed;
  world = new World(currentSeed);
  world.applySerialized(data.world);
  inventory = {
    selected: data.inventory.selected,
    slots: data.inventory.slots.map((slot) => ({ ...slot })),
  };
  player.position.x = data.player.position.x;
  player.position.y = data.player.position.y;
  player.velocity.x = data.player.velocity.x;
  player.velocity.y = data.player.velocity.y;
  player.width = data.player.width;
  player.height = data.player.height;
  player.onGround = data.player.onGround;
  buildHotbar();
  world.ensureArea(
    player.position.x / TILE_SIZE,
    player.position.y / TILE_SIZE,
    CHUNK_SIZE * 2,
  );
});
