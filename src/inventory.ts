import { InventoryState, InventorySlot, MAX_STACK_SIZE, TileId } from './types';

const HOTBAR_SIZE = 9;

export function createInventory(): InventoryState {
  const slots: InventorySlot[] = Array.from({ length: HOTBAR_SIZE }, () => ({ tile: TileId.Air, count: 0 }));
  slots[0] = { tile: TileId.Dirt, count: 64 };
  slots[1] = { tile: TileId.Stone, count: 32 };
  slots[2] = { tile: TileId.Wood, count: 16 };
  return { slots, selected: 0 };
}

export function addItem(inventory: InventoryState, tile: TileId, count: number): number {
  let remaining = count;
  for (const slot of inventory.slots) {
    if ((slot.tile === tile || slot.tile === TileId.Air) && slot.count < MAX_STACK_SIZE && remaining > 0) {
      slot.tile = tile;
      const space = MAX_STACK_SIZE - slot.count;
      const add = Math.min(space, remaining);
      slot.count += add;
      remaining -= add;
    }
  }
  return remaining;
}

export function getSelectedSlot(inventory: InventoryState): InventorySlot {
  return inventory.slots[inventory.selected];
}

export function selectSlot(inventory: InventoryState, index: number): void {
  const clamped = Math.max(0, Math.min(inventory.slots.length - 1, index));
  inventory.selected = clamped;
}

export function consumeSelected(inventory: InventoryState): boolean {
  const slot = getSelectedSlot(inventory);
  if (slot.tile === TileId.Air || slot.count <= 0) {
    return false;
  }
  slot.count -= 1;
  if (slot.count <= 0) {
    slot.tile = TileId.Air;
    slot.count = 0;
  }
  return true;
}

export function addToInventory(inventory: InventoryState, tile: TileId, count = 1): void {
  const remainder = addItem(inventory, tile, count);
  if (remainder > 0) {
    console.warn('Inventory overflow, dropping items', remainder);
  }
}
