export const GRID_SIZE = { x: 8, y: 8, z: 5 };
export const BASE_Z = 2;

export function makeCell(x, y, z = BASE_Z) {
  return { x, y, z, heightLevel: z - BASE_Z, blocked: false, type: "normal" };
}

export function createGrid() {
  const cells = [];
  for (let y = 0; y < GRID_SIZE.y; y++) {
    const row = [];
    for (let x = 0; x < GRID_SIZE.x; x++) row.push(makeCell(x, y));
    cells.push(row);
  }
  return cells;
}

export function applySampleData(state) {
  const high = [[2,2,3],[3,2,4],[4,2,3],[5,5,1],[5,6,0],[1,6,3]];
  const blocked = [[3,3],[3,4],[4,4],[2,5]];
  high.forEach(([x,y,z]) => updateCellHeight(state.cells[y][x], z));
  blocked.forEach(([x,y]) => { state.cells[y][x].blocked = true; state.cells[y][x].type = "blocked";});
}

export function updateCellHeight(cell, z) {
  cell.z = Math.max(0, Math.min(4, z));
  cell.heightLevel = cell.z - BASE_Z;
}

export function inBounds(x, y) {
  return x >= 0 && x < GRID_SIZE.x && y >= 0 && y < GRID_SIZE.y;
}

export function toSerializableState(state) {
  return {
    gridSize: GRID_SIZE,
    baseZ: BASE_Z,
    cells: state.cells.flat().map(({x,y,z,blocked}) => ({x,y,z,blocked})),
    start: state.start,
    goal: state.goal,
    path: state.path,
    logs: state.logs
  };
}
