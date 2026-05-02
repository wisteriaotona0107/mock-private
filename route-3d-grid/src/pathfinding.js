import { inBounds } from './grid.js';

const dirs = [[1,0],[-1,0],[0,1],[0,-1]];

const key = (x,y) => `${x},${y}`;

function heuristic(a, b, az, bz) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y) + Math.abs(az - bz) * 0.4;
}

function moveCost(from, to) {
  const diff = to.z - from.z;
  if (diff > 0) return 1 + diff;
  if (diff < 0) return 1 + 0.5 * Math.abs(diff);
  return 1;
}

export function runAStarSteps(state, logger) {
  const start = state.cells[state.start.y][state.start.x];
  const goal = state.cells[state.goal.y][state.goal.x];
  const open = [{ x:start.x, y:start.y, f:0, g:0 }];
  const gScore = new Map([[key(start.x,start.y), 0]]);
  const came = new Map();
  const closedOrder = [];

  while (open.length) {
    open.sort((a,b)=>a.f-b.f);
    const cur = open.shift();
    const curCell = state.cells[cur.y][cur.x];
    closedOrder.push({x:cur.x,y:cur.y});
    logger.add({ action:'EVAL', from:curCell, to:curCell, heightDiff:0, cost:0, totalCost:cur.g, result:'OK' });

    if (cur.x === goal.x && cur.y === goal.y) {
      const path = [];
      let ck = key(cur.x,cur.y);
      while (ck) {
        const [x,y] = ck.split(',').map(Number);
        const c = state.cells[y][x];
        path.push({x,y,z:c.z});
        ck = came.get(ck);
      }
      path.reverse();
      return { found:true, closedOrder, path };
    }

    for (const [dx,dy] of dirs) {
      const nx = cur.x + dx, ny = cur.y + dy;
      if (!inBounds(nx,ny)) continue;
      const next = state.cells[ny][nx];
      const diff = next.z - curCell.z;
      if (next.blocked) { logger.add({ action:'BLOCKED', from:curCell, to:next, reason:'blocked' }); continue; }
      if (Math.abs(diff) > 1) { logger.add({ action:'BLOCKED', from:curCell, to:next, reason:'height_diff_over_limit' }); continue; }

      const tentativeG = cur.g + moveCost(curCell, next);
      const nk = key(nx,ny);
      if (tentativeG < (gScore.get(nk) ?? Infinity)) {
        came.set(nk, key(cur.x,cur.y));
        gScore.set(nk, tentativeG);
        const f = tentativeG + heuristic({x:nx,y:ny}, goal, next.z, goal.z);
        if (!open.some(n=>n.x===nx&&n.y===ny)) open.push({x:nx,y:ny,g:tentativeG,f});
        logger.add({ action:'MOVE', from:curCell, to:next, heightDiff:diff, cost:tentativeG-cur.g, totalCost:tentativeG, result:'OK' });
      }
    }
  }
  return { found:false, closedOrder, path:[] };
}
