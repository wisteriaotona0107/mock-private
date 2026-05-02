export class Logger {
  constructor() { this.logs = []; this.step = 1; }
  add(entry) { this.logs.push({ step: this.step++, ...entry }); }
  clear() { this.logs = []; this.step = 1; }
}

export function formatCoord(c) {
  if (!c) return "-";
  return `(${c.x},${c.y},z${c.z}|h${c.heightLevel})`;
}
