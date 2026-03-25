// =========================
// ゲームバランス定数
// =========================
const CONFIG = {
  timeSlots: ["朝", "昼", "夜"],
  sheetTypes: {
    s2: { label: "2人用", capacity: 2, cells: 2, placeBonus: 1.15 },
    s4: { label: "4人用", capacity: 4, cells: 4, placeBonus: 1.0 },
    s6: { label: "6人用", capacity: 6, cells: 6, placeBonus: 0.85 }
  },
  peopleOptions: [2, 4, 6, 8],
  parkTypes: {
    small: {
      label: "小規模公園",
      width: 12,
      height: 9,
      treeCount: 5,
      pathRows: [2, 6],
      baseCongestion: [0.28, 0.7, 0.5],
      clusterMode: "single"
    },
    medium: {
      label: "中規模公園",
      width: 14,
      height: 10,
      treeCount: 8,
      pathRows: [3, 7],
      baseCongestion: [0.48, 0.78, 0.55],
      clusterMode: "avenue"
    },
    famous: {
      label: "桜の名所",
      width: 17,
      height: 12,
      treeCount: 14,
      pathRows: [3, 6, 9],
      baseCongestion: [0.72, 0.95, 0.76],
      clusterMode: "cluster"
    }
  },
  treeSpeciesWeights: [
    { type: "しだれ桜", factor: 1.2 },
    { type: "ソメイヨシノ", factor: 1.1 },
    { type: "八重桜", factor: 1.05 },
    { type: "若木", factor: 0.9 },
    { type: "古木", factor: 1.15 }
  ],
  arrangementFactors: {
    single: 0.95,
    avenue: 1.15,
    cluster: 1.25,
    biasedHit: 1.2,
    biasedMiss: 0.8
  },
  distanceScoreBands: [
    { max: 1.5, score: 5 },
    { max: 2.5, score: 4 },
    { max: 4, score: 3 },
    { max: 5.5, score: 2 },
    { max: Infinity, score: 1 }
  ],
  weights: { blossom: 0.45, space: 0.35, congestion: 0.2 },
  maxReposition: 1
};

const dom = {
  map: document.getElementById("map"),
  mapHint: document.getElementById("mapHint"),
  statsList: document.getElementById("statsList"),
  sheetOptions: document.getElementById("sheetOptions"),
  parkTypeSelect: document.getElementById("parkTypeSelect"),
  peopleSelect: document.getElementById("peopleSelect"),
  startBtn: document.getElementById("startBtn"),
  resetBtn: document.getElementById("resetBtn"),
  placeBtn: document.getElementById("placeBtn"),
  confirmBtn: document.getElementById("confirmBtn"),
  nextTimeBtn: document.getElementById("nextTimeBtn"),
  retryBtn: document.getElementById("retryBtn"),
  resultContent: document.getElementById("resultContent")
};

const state = {
  started: false,
  parkKey: "small",
  timeIndex: 0,
  people: 4,
  selectedSheetKey: "s4",
  repositionLeft: CONFIG.maxReposition,
  isPlacementMode: false,
  mapData: null,
  seatOrigin: null,
  seatCells: [],
  scores: { blossom: 0, space: 0, congestion: 0, total5: 0, total100: 0 },
  bestTree: null,
  congestionRate: 0
};

function randFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function setupSheetOptions() {
  dom.sheetOptions.innerHTML = "";
  Object.entries(CONFIG.sheetTypes).forEach(([key, sheet]) => {
    const btn = document.createElement("button");
    btn.className = `sheet-option ${key === state.selectedSheetKey ? "active" : ""}`;
    btn.textContent = `${sheet.label}`;
    btn.addEventListener("click", () => {
      state.selectedSheetKey = key;
      setupSheetOptions();
      if (state.seatOrigin) {
        tryPlaceSeat(state.seatOrigin.x, state.seatOrigin.y, true);
      }
      updateUI();
    });
    dom.sheetOptions.appendChild(btn);
  });
}

function createMap(parkKey) {
  const park = CONFIG.parkTypes[parkKey];
  const tiles = [];
  for (let y = 0; y < park.height; y += 1) {
    const row = [];
    for (let x = 0; x < park.width; x += 1) {
      const isPath = park.pathRows.includes(y) || x === 0 || x === park.width - 1;
      row.push({ type: isPath ? "path" : "hanami", tree: null });
    }
    tiles.push(row);
  }

  const trees = placeTrees(tiles, park);
  return { width: park.width, height: park.height, tiles, trees };
}

function placeTrees(tiles, park) {
  const trees = [];
  const candidates = [];
  for (let y = 1; y < park.height - 1; y += 1) {
    for (let x = 1; x < park.width - 1; x += 1) {
      if (tiles[y][x].type === "hanami") {
        candidates.push({ x, y });
      }
    }
  }

  let attempts = 0;
  while (trees.length < park.treeCount && attempts < 1200) {
    attempts += 1;
    const p = randFrom(candidates);
    if (!p || tiles[p.y][p.x].tree) continue;
    const tooClose = trees.some((t) => Math.hypot(t.x - p.x, t.y - p.y) < 2);
    if (tooClose && park.clusterMode !== "cluster") continue;

    const species = randFrom(CONFIG.treeSpeciesWeights);
    const tree = { ...p, species: species.type, speciesFactor: species.factor };
    trees.push(tree);
    tiles[p.y][p.x].tree = tree;
  }
  return trees;
}

function selectInitialSettings() {
  const parkInput = dom.parkTypeSelect.value;
  state.parkKey = parkInput === "random" ? randFrom(Object.keys(CONFIG.parkTypes)) : parkInput;

  const peopleInput = dom.peopleSelect.value;
  state.people = peopleInput === "random" ? randFrom(CONFIG.peopleOptions) : Number(peopleInput);

  state.timeIndex = 0;
  state.repositionLeft = CONFIG.maxReposition;
  state.selectedSheetKey = "s4";
  state.seatOrigin = null;
  state.seatCells = [];
  state.bestTree = null;
  state.scores = { blossom: 0, space: 0, congestion: 0, total5: 0, total100: 0 };
  state.congestionRate = getCongestionRate();
  state.mapData = createMap(state.parkKey);
}

function getSeatShape(sheetKey) {
  const cellCount = CONFIG.sheetTypes[sheetKey].cells;
  if (cellCount === 2) return [{ x: 0, y: 0 }, { x: 1, y: 0 }];
  if (cellCount === 4) return [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }];
  return [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 2, y: 0 },
    { x: 0, y: 1 },
    { x: 1, y: 1 },
    { x: 2, y: 1 }
  ];
}

function canPlaceSeat(originX, originY, sheetKey) {
  const shape = getSeatShape(sheetKey);
  const cells = [];
  const { width, height, tiles } = state.mapData;
  for (const cell of shape) {
    const x = originX + cell.x;
    const y = originY + cell.y;
    if (x < 0 || y < 0 || x >= width || y >= height) {
      return { ok: false, cells: [] };
    }
    const tile = tiles[y][x];
    if (tile.type !== "hanami" || tile.tree) {
      return { ok: false, cells: [] };
    }
    cells.push({ x, y });
  }
  return { ok: true, cells };
}

function tryPlaceSeat(x, y, silent = false) {
  const placed = canPlaceSeat(x, y, state.selectedSheetKey);
  if (!placed.ok) {
    if (!silent) dom.mapHint.textContent = "その場所には置けません。花見エリア内に配置してください。";
    return false;
  }
  state.seatOrigin = { x, y };
  state.seatCells = placed.cells;
  dom.mapHint.textContent = "仮置きしました。決定ボタンで確定できます。";
  recalculateScores();
  renderMap();
  updateUI();
  return true;
}

function getCongestionRate() {
  const park = CONFIG.parkTypes[state.parkKey];
  const base = park.baseCongestion[state.timeIndex];
  const randomNoise = (Math.random() - 0.5) * 0.06;
  return clamp(base + randomNoise, 0.1, 0.98);
}

function getArrangementFactor(x, y) {
  const mode = CONFIG.parkTypes[state.parkKey].clusterMode;
  if (mode === "single") return CONFIG.arrangementFactors.single;
  if (mode === "avenue") return CONFIG.arrangementFactors.avenue;
  if (mode === "cluster") {
    const centerBias = x > state.mapData.width * 0.4 && x < state.mapData.width * 0.75 && y > 1;
    return centerBias ? CONFIG.arrangementFactors.biasedHit : CONFIG.arrangementFactors.biasedMiss;
  }
  return 1;
}

function evaluateBlossomScore() {
  if (state.seatCells.length === 0) return { score: 0, tree: null };
  const center = getSeatCenter(state.seatCells);

  let best = null;
  for (const tree of state.mapData.trees) {
    const distance = Math.hypot(center.x - tree.x, center.y - tree.y);
    const distanceScore = CONFIG.distanceScoreBands.find((band) => distance <= band.max).score;
    const arrangement = getArrangementFactor(tree.x, tree.y);
    const raw = distanceScore * tree.speciesFactor * arrangement;
    const score = clamp(raw, 1, 5);

    if (!best || score > best.score) {
      best = { score, tree, distance, arrangement };
    }
  }
  return best || { score: 1, tree: null };
}

function evaluateSpaceScore() {
  const capacity = CONFIG.sheetTypes[state.selectedSheetKey].capacity;
  const people = state.people;
  if (capacity === people) return 5;
  if (capacity > people) {
    return capacity - people >= 4 ? 2.5 : 3.6;
  }

  const shortage = people - capacity;
  if (shortage <= 2) return 3;
  if (shortage <= 4) return 2;
  return 1;
}

function evaluateCongestionScore() {
  if (state.seatCells.length === 0) return 0;

  const center = getSeatCenter(state.seatCells);
  const minPathDist = distanceToClosestPath(center.x, center.y);
  const nearPathPenalty = minPathDist <= 1.4 ? 0.75 : minPathDist <= 2.6 ? 0.9 : 1;

  const base = 5 - state.congestionRate * 4.2;
  return clamp(base * nearPathPenalty, 1, 5);
}

function distanceToClosestPath(x, y) {
  let minDist = Infinity;
  for (let yy = 0; yy < state.mapData.height; yy += 1) {
    for (let xx = 0; xx < state.mapData.width; xx += 1) {
      if (state.mapData.tiles[yy][xx].type === "path") {
        minDist = Math.min(minDist, Math.hypot(x - xx, y - yy));
      }
    }
  }
  return minDist;
}

function recalculateScores() {
  const blossom = evaluateBlossomScore();
  state.bestTree = blossom.tree;

  const blossomScore = blossom.score || 0;
  const spaceScore = evaluateSpaceScore();
  const congestionScore = evaluateCongestionScore();

  const total5 =
    CONFIG.weights.blossom * blossomScore +
    CONFIG.weights.space * spaceScore +
    CONFIG.weights.congestion * congestionScore;

  state.scores = {
    blossom: round2(blossomScore),
    space: round2(spaceScore),
    congestion: round2(congestionScore),
    total5: round2(total5),
    total100: Math.round(total5 * 20)
  };
}

function renderMap() {
  if (!state.mapData) {
    dom.map.innerHTML = "";
    return;
  }

  const { width, height, tiles } = state.mapData;
  dom.map.style.gridTemplateColumns = `repeat(${width}, minmax(0, 1fr))`;
  dom.map.innerHTML = "";

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const tile = document.createElement("button");
      const tileData = tiles[y][x];
      tile.className = `tile ${tileData.type}`;
      tile.dataset.x = String(x);
      tile.dataset.y = String(y);

      if (tileData.tree) {
        const aura = document.createElement("span");
        aura.className = "tree-aura";
        const tree = document.createElement("span");
        tree.className = "tree-mark";
        tree.textContent = "🌸";
        tree.title = `${tileData.tree.species} (${tileData.tree.speciesFactor})`;
        tile.appendChild(aura);
        tile.appendChild(tree);
      }

      const occupied = state.seatCells.some((cell) => cell.x === x && cell.y === y);
      if (occupied) tile.classList.add("seat-tile");

      tile.addEventListener("click", () => {
        if (!state.started || !state.isPlacementMode) return;
        tryPlaceSeat(x, y);
      });

      dom.map.appendChild(tile);
    }
  }
}

function updateUI() {
  if (!state.started) {
    dom.statsList.innerHTML = `<dt>状態</dt><dd>未開始</dd>`;
    return;
  }

  const park = CONFIG.parkTypes[state.parkKey];
  const sheet = CONFIG.sheetTypes[state.selectedSheetKey];

  const metrics = [
    ["現在の時間帯", CONFIG.timeSlots[state.timeIndex]],
    ["現在の混雑率", `${Math.round(state.congestionRate * 100)}%`],
    ["公園タイプ", park.label],
    ["使用できるシート枚数", "1枚（将来拡張可）"],
    ["参加人数", `${state.people}人`],
    ["選択中シート", sheet.label],
    ["現在の総合満足度", `${state.scores.total5.toFixed(2)} / 5`],
    ["桜満足度", state.scores.blossom.toFixed(2)],
    ["広さ満足度", state.scores.space.toFixed(2)],
    ["混雑満足度", state.scores.congestion.toFixed(2)],
    ["残り配置し直し", `${state.repositionLeft}回`]
  ];

  dom.statsList.innerHTML = metrics
    .map(([label, value]) => `<dt>${label}</dt><dd>${value}</dd>`)
    .join("");
}

function confirmResult() {
  if (state.seatCells.length === 0) {
    dom.mapHint.textContent = "先にシートを仮置きしてください。";
    return;
  }

  state.isPlacementMode = false;
  renderResult();
  dom.mapHint.textContent = "スコア確定！再挑戦で同条件のやり直し、または開始で新規ゲーム。";
}

function renderResult() {
  const s = state.scores;
  const blossomRank = scoreLabel(s.blossom);
  const spaceRank = scoreLabel(s.space);
  const congestionRank = scoreLabel(s.congestion);

  const comment = buildComment();

  dom.resultContent.innerHTML = `
    <p class="result-score">総合スコア: ${s.total100}点</p>
    <p>桜の近さ評価: <strong>${blossomRank}</strong> (${s.blossom.toFixed(2)})</p>
    <p>広さ評価: <strong>${spaceRank}</strong> (${s.space.toFixed(2)})</p>
    <p>混雑評価: <strong>${congestionRank}</strong> (${s.congestion.toFixed(2)})</p>
    <p>コメント: ${comment}</p>
  `;
}

function scoreLabel(score) {
  if (score >= 4.5) return "最高";
  if (score >= 3.6) return "良好";
  if (score >= 2.6) return "まずまず";
  if (score >= 1.6) return "やや不満";
  return "不満";
}

function buildComment() {
  const { blossom, space, congestion } = state.scores;
  if (blossom >= 4.2 && congestion >= 3) {
    return "春を満喫できる当たり席！写真映えも期待できます。";
  }
  if (space < 2.6) {
    return "人数に対してシートが手狭。次回は大きめシートがおすすめです。";
  }
  if (congestion < 2.4) {
    return "景色は良いですが、人通りが多く落ち着きにくい場所でした。";
  }
  return "バランスのよい席取りでした。時間帯を変えるとさらに高得点を狙えます。";
}

function advanceTime() {
  if (!state.started) return;
  state.timeIndex = (state.timeIndex + 1) % CONFIG.timeSlots.length;
  state.congestionRate = getCongestionRate();
  if (state.seatCells.length > 0) recalculateScores();
  dom.mapHint.textContent = `時間帯を${CONFIG.timeSlots[state.timeIndex]}に変更しました。`;
  updateUI();
}

function retryPlacement() {
  if (!state.started) return;
  if (state.repositionLeft <= 0) {
    dom.mapHint.textContent = "配置し直しは使い切りました。";
    return;
  }
  state.repositionLeft -= 1;
  state.seatOrigin = null;
  state.seatCells = [];
  state.scores = { blossom: 0, space: 0, congestion: 0, total5: 0, total100: 0 };
  state.isPlacementMode = true;
  dom.mapHint.textContent = "再配置モードです。マップをクリックして再配置してください。";
  dom.resultContent.textContent = "再配置中...";
  renderMap();
  updateUI();
}

function setPlacementMode() {
  if (!state.started) return;
  state.isPlacementMode = true;
  dom.mapHint.textContent = "配置モード中。マップをクリックしてシートを仮置きしてください。";
}

function startGame() {
  state.started = true;
  selectInitialSettings();
  setupSheetOptions();
  state.isPlacementMode = true;
  dom.resultContent.textContent = "シートを配置して結果を確認しましょう。";
  dom.mapHint.textContent = "配置モード開始。花見エリアをクリックしてシートを置いてください。";
  recalculateScores();
  renderMap();
  updateUI();
}

function resetAll() {
  state.started = false;
  state.mapData = null;
  state.seatOrigin = null;
  state.seatCells = [];
  state.timeIndex = 0;
  state.people = 4;
  state.parkKey = "small";
  state.selectedSheetKey = "s4";
  state.repositionLeft = CONFIG.maxReposition;
  state.scores = { blossom: 0, space: 0, congestion: 0, total5: 0, total100: 0 };
  state.isPlacementMode = false;

  dom.resultContent.textContent = "まだ結果はありません。";
  dom.mapHint.textContent = "開始ボタンを押してゲームを始めてください。";
  setupSheetOptions();
  renderMap();
  updateUI();
}

function getSeatCenter(cells) {
  const sum = cells.reduce((acc, c) => ({ x: acc.x + c.x, y: acc.y + c.y }), { x: 0, y: 0 });
  return { x: sum.x / cells.length, y: sum.y / cells.length };
}

function round2(value) {
  return Math.round(value * 100) / 100;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function bindEvents() {
  dom.startBtn.addEventListener("click", startGame);
  dom.resetBtn.addEventListener("click", resetAll);
  dom.placeBtn.addEventListener("click", setPlacementMode);
  dom.confirmBtn.addEventListener("click", confirmResult);
  dom.nextTimeBtn.addEventListener("click", advanceTime);
  dom.retryBtn.addEventListener("click", retryPlacement);
}

bindEvents();
resetAll();
