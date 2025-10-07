// src/input.ts
// Pointerイベントから串の操作とUIクリックを抽象化する。

interface PointerState {
  active: boolean;
  id: number | null;
  lastX: number;
  lastY: number;
  totalDistance: number;
}

export interface PointerCallbacks {
  onSkewerMove: (deltaAngle: number, deltaHeight: number) => void;
  onTap: (x: number, y: number) => void;
}

const pointerState: PointerState = {
  active: false,
  id: null,
  lastX: 0,
  lastY: 0,
  totalDistance: 0
};

export function setupInput(canvas: HTMLCanvasElement, callbacks: PointerCallbacks): void {
  canvas.addEventListener('pointerdown', (event) => {
    pointerState.active = true;
    pointerState.id = event.pointerId;
    pointerState.lastX = event.clientX;
    pointerState.lastY = event.clientY;
    pointerState.totalDistance = 0;
    canvas.setPointerCapture(event.pointerId);
  });

  canvas.addEventListener('pointermove', (event) => {
    if (!pointerState.active || pointerState.id !== event.pointerId) return;
    const dx = event.clientX - pointerState.lastX;
    const dy = event.clientY - pointerState.lastY;
    pointerState.lastX = event.clientX;
    pointerState.lastY = event.clientY;
    pointerState.totalDistance += Math.sqrt(dx * dx + dy * dy);

    const deltaAngle = dx;
    const deltaHeight = dy;
    callbacks.onSkewerMove(deltaAngle, deltaHeight);
  });

  function endPointer(event: PointerEvent): void {
    if (!pointerState.active || pointerState.id !== event.pointerId) return;
    canvas.releasePointerCapture(event.pointerId);
    pointerState.active = false;
    if (pointerState.totalDistance < 10) {
      callbacks.onTap(event.offsetX, event.offsetY);
    }
  }

  canvas.addEventListener('pointerup', endPointer);
  canvas.addEventListener('pointercancel', endPointer);
}
