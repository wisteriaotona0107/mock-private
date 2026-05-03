const GRID_SIZE = 8;
const STORAGE_KEY = "rice-sim-state-v1";

const phaseOrder = ["empty", "seed", "planted", "growing", "heading", "ripening", "harvest"];
const phaseColor = {
  empty: "#dce9df",
  seed: "#b8d8b8",
  planted: "#8ecf8d",
  growing: "#57b96a",
  heading: "#8bc34a",
  ripening: "#d7b857",
  harvest: "#a98e3f"
};

const state = {
  grid: [],
  water: 0.5,
  score: 0,
  time: 0,
  dragging: false,
  harvestSwipe: false,
  eventMultiplier: 1,
  weatherLabel: "Stable weather",
  logs: []
};

const fieldEl = document.getElementById("field");
const waterSlider = document.getElementById("waterSlider");
const waterValue = document.getElementById("waterValue");
const scoreValue = document.getElementById("scoreValue");
const dayValue = document.getElementById("dayValue");
const weatherText = document.getElementById("weatherText");
const logOutput = document.getElementById("logOutput");

function makeTile(index) {
  return { index, phase: "empty", progress: 0, plantedAt: null, quality: 1 };
}

function addLog(type, detail = {}) {
  const entry = {
    ts: new Date().toISOString(),
    day: Number(state.time.toFixed(2)),
    type,
    ...detail
  };
  state.logs.push(entry);
  if (state.logs.length > 300) state.logs.shift();
  renderLogs();
}

function renderLogs() {
  const header = "timestamp,day,type,tile,from,to,water,score\n";
  const rows = state.logs.map((l) =>
    [l.ts, l.day, l.type, l.tile ?? "", l.from ?? "", l.to ?? "", l.water ?? state.water, l.score ?? state.score].join(",")
  );
  logOutput.value = header + rows.join("\n");
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  addLog("save_state");
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    state.grid = Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => makeTile(i));
    return;
  }
  try {
    const parsed = JSON.parse(raw);
    Object.assign(state, parsed);
    if (!Array.isArray(state.grid) || state.grid.length !== GRID_SIZE * GRID_SIZE) throw new Error("Bad grid");
  } catch {
    state.grid = Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => makeTile(i));
  }
}

function densityAt(idx) {
  const x = idx % GRID_SIZE;
  const y = Math.floor(idx / GRID_SIZE);
  let plantedNeighbors = 0;
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue;
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= GRID_SIZE || ny >= GRID_SIZE) continue;
      const nTile = state.grid[ny * GRID_SIZE + nx];
      if (nTile.phase !== "empty" && nTile.phase !== "harvest") plantedNeighbors++;
    }
  }
  return plantedNeighbors;
}

function plant(tileIndex) {
  const tile = state.grid[tileIndex];
  if (!tile || tile.phase !== "empty") return;
  tile.phase = "seed";
  tile.progress = 0;
  tile.plantedAt = state.time;
  const density = densityAt(tileIndex);
  tile.quality = Math.max(0.6, 1.2 - density * 0.08);
  addLog("plant", { tile: tileIndex, to: tile.phase, water: state.water });
  renderField();
}

function harvest(tileIndex) {
  const tile = state.grid[tileIndex];
  if (!tile || tile.phase !== "ripening") return;
  const waterQuality = 1 - Math.abs(0.65 - state.water);
  const points = Math.max(1, Math.round(80 * tile.quality * waterQuality));
  state.score += points;
  tile.phase = "harvest";
  tile.progress = 0;
  addLog("harvest", { tile: tileIndex, from: "ripening", to: "harvest", score: state.score });
  renderHUD();
  renderField();
}

function updateWeather() {
  const roll = Math.random();
  if (roll < 0.15) {
    state.weatherLabel = "Rain burst (+growth)";
    state.eventMultiplier = 1.35;
  } else if (roll < 0.28) {
    state.weatherLabel = "Heat stress (-growth)";
    state.eventMultiplier = 0.75;
  } else {
    state.weatherLabel = "Stable weather";
    state.eventMultiplier = 1;
  }
  weatherText.textContent = `Weather: ${state.weatherLabel}`;
}

function tick(dt) {
  state.time += dt;
  if (Math.floor(state.time * 10) % 100 === 0) updateWeather();

  state.grid.forEach((tile, idx) => {
    if (["empty", "harvest", "ripening"].includes(tile.phase)) return;
    const densityPenalty = Math.max(0.55, 1 - densityAt(idx) * 0.06);
    const waterFactor = 1 - Math.abs(0.62 - state.water) * 1.2;
    const rate = 0.08 * densityPenalty * Math.max(0.3, waterFactor) * state.eventMultiplier;
    tile.progress += dt * rate;

    if (tile.progress >= 1) {
      const currentIdx = phaseOrder.indexOf(tile.phase);
      const nextPhase = phaseOrder[Math.min(currentIdx + 1, phaseOrder.length - 1)];
      const from = tile.phase;
      tile.phase = nextPhase;
      tile.progress = 0;
      addLog("phase_change", { tile: idx, from, to: nextPhase, water: state.water });
    }
  });

  renderHUD();
  renderField();
}

function tileHtml(tile) {
  const growClass = tile.phase === "growing" || tile.phase === "heading" ? "growing-anim" : "";
  return `<button class="tile ${growClass}" role="gridcell" data-i="${tile.index}" aria-label="tile ${tile.index} ${tile.phase}" style="background:${phaseColor[tile.phase]}"></button>`;
}

function renderField() {
  fieldEl.innerHTML = state.grid.map(tileHtml).join("");
}

function renderHUD() {
  waterValue.textContent = state.water.toFixed(2);
  scoreValue.textContent = String(state.score);
  dayValue.textContent = state.time.toFixed(1);
  weatherText.textContent = `Weather: ${state.weatherLabel}`;
}

function exportFile(filename, text, mime) {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function handleTileInteraction(target, harvesting = false) {
  if (!target?.dataset?.i) return;
  const i = Number(target.dataset.i);
  harvesting ? harvest(i) : plant(i);
}

function bindInteractions() {
  fieldEl.addEventListener("pointerdown", (e) => {
    state.dragging = true;
    state.harvestSwipe = state.grid.some((t) => t.phase === "ripening") && e.shiftKey;
    handleTileInteraction(e.target, state.harvestSwipe);
  });

  fieldEl.addEventListener("pointermove", (e) => {
    if (!state.dragging) return;
    const el = document.elementFromPoint(e.clientX, e.clientY);
    handleTileInteraction(el, state.harvestSwipe);
  });

  ["pointerup", "pointerleave", "pointercancel"].forEach((evt) =>
    fieldEl.addEventListener(evt, () => {
      state.dragging = false;
      state.harvestSwipe = false;
    })
  );

  // Mobile-friendly two-finger swipe toggles harvest mode
  fieldEl.addEventListener("touchstart", (e) => {
    if (e.touches.length > 1) state.harvestSwipe = true;
  });

  waterSlider.addEventListener("input", () => {
    state.water = Number(waterSlider.value);
    addLog("water_change", { water: state.water });
    renderHUD();
  });

  document.getElementById("saveBtn").addEventListener("click", saveState);
  document.getElementById("exportJsonBtn").addEventListener("click", () => {
    exportFile("rice-sim-result.json", JSON.stringify(state, null, 2), "application/json");
  });
  document.getElementById("exportCsvBtn").addEventListener("click", () => {
    exportFile("rice-sim-log.csv", logOutput.value, "text/csv");
  });
  document.getElementById("resetBtn").addEventListener("click", () => {
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
  });
}

function init() {
  loadState();
  renderHUD();
  renderField();
  renderLogs();
  bindInteractions();
  addLog("session_start");
  setInterval(() => {
    tick(0.1);
  }, 300);
  setInterval(saveState, 5000);
}

init();
