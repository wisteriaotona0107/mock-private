import type { CameraState, InputSnapshot, PointerState } from './types';

export class InputManager {
  readonly pointer: PointerState = {
    screenX: 0,
    screenY: 0,
    worldX: 0,
    worldY: 0,
    leftDown: false,
    rightDown: false,
    leftClicked: false,
    rightClicked: false,
  };

  private readonly keys: Set<string> = new Set();
  private readonly canvas: HTMLCanvasElement;
  private capturing = true;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.bindEvents();
  }

  private bindEvents(): void {
    window.addEventListener('keydown', (event) => {
      if (!this.capturing) {
        return;
      }
      this.keys.add(event.key.toLowerCase());
      if (event.key >= '1' && event.key <= '9') {
        event.preventDefault();
      }
    });
    window.addEventListener('keyup', (event) => {
      this.keys.delete(event.key.toLowerCase());
    });
    this.canvas.addEventListener('mousemove', (event) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      this.pointer.screenX = (event.clientX - rect.left) * scaleX;
      this.pointer.screenY = (event.clientY - rect.top) * scaleY;
    });
    this.canvas.addEventListener('mousedown', (event) => {
      if (event.button === 0) {
        this.pointer.leftDown = true;
        this.pointer.leftClicked = true;
      } else if (event.button === 2) {
        this.pointer.rightDown = true;
        this.pointer.rightClicked = true;
      }
    });
    this.canvas.addEventListener('mouseup', (event) => {
      if (event.button === 0) {
        this.pointer.leftDown = false;
      } else if (event.button === 2) {
        this.pointer.rightDown = false;
      }
    });
    this.canvas.addEventListener('contextmenu', (event) => event.preventDefault());
  }

  setCapturing(enabled: boolean): void {
    this.capturing = enabled;
    if (!enabled) {
      this.keys.clear();
      this.pointer.leftDown = false;
      this.pointer.rightDown = false;
    }
  }

  updateWorldPointer(camera: CameraState): void {
    this.pointer.worldX = camera.x + this.pointer.screenX;
    this.pointer.worldY = camera.y + this.pointer.screenY;
  }

  consumeClicks(): void {
    this.pointer.leftClicked = false;
    this.pointer.rightClicked = false;
  }

  snapshot(): InputSnapshot {
    return {
      left: this.keys.has('a') || this.keys.has('arrowleft'),
      right: this.keys.has('d') || this.keys.has('arrowright'),
      jump: this.keys.has(' ') || this.keys.has('space') || this.keys.has('w') || this.keys.has('arrowup'),
    };
  }

  isKeyPressed(key: string): boolean {
    return this.keys.has(key.toLowerCase());
  }
}
