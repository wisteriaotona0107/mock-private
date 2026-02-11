const STORAGE_KEYS = {
  dataset: 'sakeMap.dataset.v1',
  favorites: 'sakeMap.favorites.v1',
  filters: 'sakeMap.filters.v1',
};

const SAMPLE_DATA = [
  {
    brandId: 201,
    brandName: '蒼霞 純米吟醸',
    breweryName: '蒼霞酒造',
    areaName: '山形県',
    flavor: { f1: 0.82, f2: 0.42, f3: 0.41, f4: 0.66, f5: 0.28, f6: 0.54 },
    tags: ['フルーティ', '吟醸香', '濃醇'],
  },
  {
    brandId: 202,
    brandName: '白嶺 本醸造',
    breweryName: '白嶺蔵',
    areaName: '秋田県',
    flavor: { f1: 0.21, f2: 0.43, f3: 0.79, f4: 0.34, f5: 0.51, f6: 0.23 },
    tags: ['辛口', '淡麗', 'キレ'],
  },
  {
    brandId: 203,
    brandName: '宵凪 山廃純米',
    breweryName: '宵凪酒造',
    areaName: '兵庫県',
    flavor: { f1: 0.36, f2: 0.51, f3: 0.63, f4: 0.87, f5: 0.59, f6: 0.77 },
    tags: ['濃醇', '旨味', '燗向き'],
  },
  {
    brandId: 204,
    brandName: '春灯り 純米',
    breweryName: '春灯り酒造',
    areaName: '福岡県',
    flavor: { f1: 0.74, f2: 0.33, f3: 0.48, f4: 0.44, f5: 0.19, f6: 0.31 },
    tags: ['フルーティ', '甘口', '軽快'],
  },
];

const state = {
  dataset: [],
  points: [],
  visiblePoints: [],
  favorites: new Set(),
  selectedTags: new Set(),
  favoriteOnly: false,
  selectedBrandId: null,
  pointBirth: new Map(),
  pulse: { brandId: null, start: 0 },
};

const canvas = document.getElementById('mapCanvas');
const ctx = canvas.getContext('2d');
const dataCount = document.getElementById('dataCount');
const tagFilters = document.getElementById('tagFilters');
const favFilterBtn = document.getElementById('favFilterBtn');
const detailCard = document.getElementById('detailCard');
const cardBrand = document.getElementById('cardBrand');
const cardMeta = document.getElementById('cardMeta');
const cardTags = document.getElementById('cardTags');
const bars = document.getElementById('bars');
const favoriteBtn = document.getElementById('favoriteBtn');
const sheet = document.getElementById('sheet');
const sheetBackdrop = document.getElementById('sheetBackdrop');
const openSheetBtn = document.getElementById('openSheetBtn');
const closeSheetBtn = document.getElementById('closeSheetBtn');
const loadSampleBtn = document.getElementById('loadSampleBtn');
const loadJsonBtn = document.getElementById('loadJsonBtn');
const jsonInput = document.getElementById('jsonInput');
const fileInput = document.getElementById('fileInput');
const toast = document.getElementById('toast');

let rafId = null;

function clamp01(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

function mapFlavorToXY(flavor = {}) {
  const f1 = clamp01(flavor.f1 ?? 0);
  const f3 = clamp01(flavor.f3 ?? 0);
  const f4 = clamp01(flavor.f4 ?? 0);
  const f6 = clamp01(flavor.f6 ?? 0);
  const x = clamp01(f1 * 0.7 + f3 * 0.3);
  const y = clamp01(f4 * 0.6 + f6 * 0.4);
  return { x, y };
}

function normalizeInput(input) {
  const arr = Array.isArray(input) ? input : [input];
  if (!arr.length) throw new Error('空のデータです');
  const normalized = arr.map((item) => {
    if (!item || typeof item !== 'object') throw new Error('データ形式が不正です');
    const required = ['brandId', 'brandName', 'breweryName', 'areaName', 'flavor'];
    required.forEach((k) => {
      if (item[k] === undefined || item[k] === null || item[k] === '') {
        throw new Error(`必須項目不足: ${k}`);
      }
    });
    const flavor = {};
    ['f1', 'f2', 'f3', 'f4', 'f5', 'f6'].forEach((key) => {
      flavor[key] = clamp01(item.flavor?.[key] ?? 0);
    });
    const tags = Array.isArray(item.tags) ? item.tags.filter((t) => typeof t === 'string') : [];
    return {
      brandId: item.brandId,
      brandName: String(item.brandName),
      breweryName: String(item.breweryName),
      areaName: String(item.areaName),
      flavor,
      tags,
    };
  });
  return normalized;
}

function saveState() {
  localStorage.setItem(STORAGE_KEYS.dataset, JSON.stringify(state.dataset));
  localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify([...state.favorites]));
  localStorage.setItem(
    STORAGE_KEYS.filters,
    JSON.stringify({
      selectedTags: [...state.selectedTags],
      favoriteOnly: state.favoriteOnly,
    }),
  );
}

function loadState() {
  try {
    const datasetRaw = localStorage.getItem(STORAGE_KEYS.dataset);
    const favRaw = localStorage.getItem(STORAGE_KEYS.favorites);
    const filterRaw = localStorage.getItem(STORAGE_KEYS.filters);

    if (datasetRaw) state.dataset = normalizeInput(JSON.parse(datasetRaw));
    if (favRaw) state.favorites = new Set(JSON.parse(favRaw));
    if (filterRaw) {
      const parsed = JSON.parse(filterRaw);
      state.selectedTags = new Set(parsed.selectedTags || []);
      state.favoriteOnly = Boolean(parsed.favoriteOnly);
    }
  } catch (err) {
    console.warn(err);
    showToast('保存データの復元に失敗しました');
  }

  if (!state.dataset.length) {
    state.dataset = normalizeInput(SAMPLE_DATA);
  }
}

function computePoints() {
  state.points = state.dataset.map((item) => {
    const p = mapFlavorToXY(item.flavor);
    return { ...item, ...p };
  });
}

function filteredPoints() {
  return state.points.filter((p) => {
    const tagMatch = !state.selectedTags.size || [...state.selectedTags].every((t) => p.tags.includes(t));
    const favMatch = !state.favoriteOnly || state.favorites.has(p.brandId);
    return tagMatch && favMatch;
  });
}

function buildTagFilters() {
  const tags = [...new Set(state.points.flatMap((p) => p.tags))].sort((a, b) => a.localeCompare(b, 'ja'));
  tagFilters.innerHTML = '';
  tags.forEach((tag) => {
    const btn = document.createElement('button');
    btn.className = `chip ${state.selectedTags.has(tag) ? 'active' : ''}`;
    btn.type = 'button';
    btn.textContent = tag;
    btn.addEventListener('click', () => {
      if (state.selectedTags.has(tag)) state.selectedTags.delete(tag);
      else state.selectedTags.add(tag);
      updateScene();
      saveState();
    });
    tagFilters.appendChild(btn);
  });
  favFilterBtn.classList.toggle('active', state.favoriteOnly);
}

function updateScene() {
  computePoints();
  buildTagFilters();
  state.visiblePoints = filteredPoints();
  dataCount.textContent = `${state.visiblePoints.length}/${state.points.length}銘柄`;

  const visibleIds = new Set(state.visiblePoints.map((p) => String(p.brandId)));
  if (state.selectedBrandId && !visibleIds.has(String(state.selectedBrandId))) {
    closeDetail();
  }

  const now = performance.now();
  state.visiblePoints.forEach((p) => {
    if (!state.pointBirth.has(p.brandId)) state.pointBirth.set(p.brandId, now);
  });

  requestDraw();
}

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.round(rect.width * dpr);
  canvas.height = Math.round(rect.height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  requestDraw();
}

function drawGrid(size) {
  ctx.clearRect(0, 0, size, size);
  ctx.save();
  ctx.strokeStyle = 'rgba(124,139,182,0.24)';
  ctx.lineWidth = 1;
  for (let i = 1; i < 4; i += 1) {
    const p = (size / 4) * i;
    ctx.beginPath();
    ctx.moveTo(p, 0);
    ctx.lineTo(p, size);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, p);
    ctx.lineTo(size, p);
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(95,111,170,0.35)';
  ctx.beginPath();
  ctx.moveTo(size / 2, 0);
  ctx.lineTo(size / 2, size);
  ctx.moveTo(0, size / 2);
  ctx.lineTo(size, size / 2);
  ctx.stroke();
  ctx.restore();
}

function drawPoints(now) {
  const size = canvas.getBoundingClientRect().width;
  drawGrid(size);

  for (const point of state.points) {
    const isVisible = state.visiblePoints.some((p) => p.brandId === point.brandId);
    if (!isVisible) continue;
    const x = point.x * size;
    const y = (1 - point.y) * size;
    const birth = state.pointBirth.get(point.brandId) || now;
    const progress = Math.min(1, (now - birth) / 200);
    const ease = 1 - Math.pow(1 - progress, 3);

    let radius = 4 + 2 * ease;
    let alpha = 0.32 + 0.68 * ease;

    if (state.pulse.brandId === point.brandId) {
      const pulseProgress = Math.min(1, (now - state.pulse.start) / 120);
      const pulseWave = Math.sin(pulseProgress * Math.PI);
      radius += pulseWave * 4;
      alpha = Math.min(1, alpha + pulseWave * 0.2);
      if (pulseProgress >= 1) state.pulse.brandId = null;
    }

    ctx.beginPath();
    ctx.fillStyle = state.favorites.has(point.brandId)
      ? `rgba(238, 160, 88, ${alpha})`
      : `rgba(85, 103, 255, ${alpha})`;
    ctx.shadowColor = 'rgba(63,75,125,0.18)';
    ctx.shadowBlur = 6;
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

function requestDraw() {
  if (rafId) cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame((t) => {
    drawPoints(t);
  });
}

function hitTest(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const x = clientX - rect.left;
  const y = clientY - rect.top;
  const size = rect.width;
  const threshold = 14;

  let best = null;
  let dist = Infinity;
  state.visiblePoints.forEach((p) => {
    const px = p.x * size;
    const py = (1 - p.y) * size;
    const d = Math.hypot(x - px, y - py);
    if (d < threshold && d < dist) {
      dist = d;
      best = p;
    }
  });
  return best;
}

function showDetail(point) {
  state.selectedBrandId = point.brandId;
  cardBrand.textContent = point.brandName;
  cardMeta.textContent = `${point.breweryName} / ${point.areaName}`;
  favoriteBtn.textContent = state.favorites.has(point.brandId) ? '★' : '☆';
  cardTags.innerHTML = '';
  point.tags.forEach((tag) => {
    const chip = document.createElement('span');
    chip.className = 'chip';
    chip.textContent = tag;
    cardTags.appendChild(chip);
  });

  bars.innerHTML = '';
  ['f1', 'f2', 'f3', 'f4', 'f5', 'f6'].forEach((key, index) => {
    const row = document.createElement('div');
    row.className = 'bar-row';
    row.innerHTML = `<span>${key}</span><div class="bar-track"><div class="bar-fill"></div></div>`;
    bars.appendChild(row);
    requestAnimationFrame(() => {
      setTimeout(() => {
        row.querySelector('.bar-fill').style.width = `${clamp01(point.flavor[key]) * 100}%`;
      }, index * 35);
    });
  });

  detailCard.classList.add('open');
}

function closeDetail() {
  detailCard.classList.remove('open');
  state.selectedBrandId = null;
}

function toggleFavorite() {
  if (!state.selectedBrandId) return;
  if (state.favorites.has(state.selectedBrandId)) {
    state.favorites.delete(state.selectedBrandId);
  } else {
    state.favorites.add(state.selectedBrandId);
  }
  const selected = state.points.find((p) => p.brandId === state.selectedBrandId);
  if (selected) showDetail(selected);
  updateScene();
  saveState();
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 1300);
}

function applyData(input, sourceLabel = 'データ') {
  const normalized = normalizeInput(input);
  state.dataset = normalized;
  state.pointBirth.clear();
  closeDetail();
  updateScene();
  saveState();
  showToast(`${sourceLabel}を読み込みました`);
}

function openSheet() {
  sheet.classList.add('open');
  sheet.setAttribute('aria-hidden', 'false');
}

function closeSheet() {
  sheet.classList.remove('open');
  sheet.setAttribute('aria-hidden', 'true');
}

function initEvents() {
  window.addEventListener('resize', resizeCanvas);

  canvas.addEventListener('click', (event) => {
    const hit = hitTest(event.clientX, event.clientY);
    if (!hit) return;
    state.pulse = { brandId: hit.brandId, start: performance.now() };
    requestDraw();
    showDetail(hit);
  });

  favFilterBtn.addEventListener('click', () => {
    state.favoriteOnly = !state.favoriteOnly;
    updateScene();
    saveState();
  });

  favoriteBtn.addEventListener('click', toggleFavorite);

  openSheetBtn.addEventListener('click', openSheet);
  closeSheetBtn.addEventListener('click', closeSheet);
  sheetBackdrop.addEventListener('click', closeSheet);

  loadSampleBtn.addEventListener('click', () => {
    applyData(SAMPLE_DATA, 'サンプル');
    closeSheet();
  });

  loadJsonBtn.addEventListener('click', () => {
    try {
      const parsed = JSON.parse(jsonInput.value);
      applyData(parsed, 'JSON');
      closeSheet();
    } catch (err) {
      showToast(`読み込み失敗: ${err.message}`);
    }
  });

  fileInput.addEventListener('change', async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      applyData(parsed, 'ファイル');
      closeSheet();
      jsonInput.value = text;
    } catch (err) {
      showToast(`ファイル読込失敗: ${err.message}`);
    } finally {
      fileInput.value = '';
    }
  });

  let dragStartY = null;
  detailCard.addEventListener('touchstart', (e) => {
    dragStartY = e.touches[0].clientY;
  }, { passive: true });
  detailCard.addEventListener('touchmove', (e) => {
    if (dragStartY == null) return;
    if (e.touches[0].clientY - dragStartY > 48) {
      closeDetail();
      dragStartY = null;
    }
  }, { passive: true });
  detailCard.addEventListener('touchend', () => {
    dragStartY = null;
  });
}

function init() {
  loadState();
  initEvents();
  resizeCanvas();
  updateScene();
}

init();
