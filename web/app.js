const { GameEngine } = require('../src/engine.js');
const { THEMES, BLOCK_DEFS } = require('../src/data.js');
const { MATERIALS, BASE_COMBO_PAYOUT } = require('../src/constants.js');

const BLOCK_CONTEXTS = {
  sakuraLantern: { category: 'light', tags: ['lantern', 'spring'], material: 'wood' },
  sunflowerPot: { category: 'flora', tags: ['plant', 'summer'], material: 'food' },
  mapleBonsai: { category: 'flora', tags: ['tree', 'autumn'], material: 'wood' },
  winterLamp: { category: 'light', tags: ['lantern', 'winter'], material: 'ore' },
};

const dom = {};
const appState = {
  engine: null,
  lastPlacement: null,
  gambleBehavior: 'cancel',
};

function decideGamble() {
  return appState.gambleBehavior === 'challenge' ? 'challenge' : 'cancel';
}

function createEngine() {
  return new GameEngine({
    gambleDecider: decideGamble,
    rng: () => Math.random(),
  });
}

function init() {
  cacheDom();
  bindEvents();
  appState.engine = createEngine();
  populateSelectors();
  renderAll();
}

function cacheDom() {
  dom.themeSelect = document.getElementById('theme-select');
  dom.cancelMode = document.getElementById('cancel-mode');
  dom.startRun = document.getElementById('start-run');
  dom.focusSelect = document.getElementById('focus-select');
  dom.blockSelect = document.getElementById('block-select');
  dom.placeBlock = document.getElementById('place-block');
  dom.forceCombo = document.getElementById('force-combo');
  dom.comboValue = document.getElementById('combo-value');
  dom.directionLabel = document.getElementById('direction-label');
  dom.materialsTable = document.getElementById('materials-table');
  dom.buffList = document.getElementById('buff-list');
  dom.eventFeed = document.getElementById('event-feed');
  dom.fxFeed = document.getElementById('fx-feed');
  dom.result = document.getElementById('placement-result');
  dom.blockDetails = document.getElementById('block-details');
  dom.limitList = document.getElementById('limit-list');
  dom.gambleBehavior = document.getElementById('gamble-behavior');
}

function bindEvents() {
  dom.startRun.addEventListener('click', () => {
    startRun();
  });

  dom.focusSelect.addEventListener('change', () => {
    applyDirectionFocus();
    renderAll();
  });

  dom.blockSelect.addEventListener('change', () => {
    renderBlockDetails();
  });

  dom.placeBlock.addEventListener('click', () => {
    placeBlock();
  });

  dom.forceCombo.addEventListener('click', () => {
    forceComboEnd();
  });

  dom.gambleBehavior.addEventListener('change', (event) => {
    appState.gambleBehavior = event.target.value;
  });
}

function populateSelectors() {
  populateThemeSelect();
  populateFocusSelect();
  populateBlockSelect();
  dom.cancelMode.value = appState.engine.runState.modeOnCancel || 'SKIP';
  dom.gambleBehavior.value = appState.gambleBehavior;
  if (appState.engine.runState.directionFocus) {
    dom.focusSelect.value = appState.engine.runState.directionFocus;
  }
  renderBlockDetails();
}

function populateThemeSelect() {
  dom.themeSelect.innerHTML = '';
  const themes = Object.values(THEMES);
  for (const theme of themes) {
    const option = document.createElement('option');
    option.value = theme.id;
    option.textContent = theme.unlocked ? theme.id : `${theme.id}（ロック中）`;
    option.disabled = !theme.unlocked;
    dom.themeSelect.appendChild(option);
  }
  const defaultTheme = themes.find((theme) => theme.unlocked);
  if (defaultTheme) {
    dom.themeSelect.value = defaultTheme.id;
  }
}

function populateFocusSelect() {
  dom.focusSelect.innerHTML = '';
  const empty = document.createElement('option');
  empty.value = '';
  empty.textContent = '未選択';
  dom.focusSelect.appendChild(empty);
  for (const material of MATERIALS) {
    const option = document.createElement('option');
    option.value = material;
    option.textContent = material;
    dom.focusSelect.appendChild(option);
  }
}

function populateBlockSelect() {
  dom.blockSelect.innerHTML = '';
  for (const blockId of Object.keys(BLOCK_DEFS)) {
    const option = document.createElement('option');
    option.value = blockId;
    option.textContent = blockId;
    dom.blockSelect.appendChild(option);
  }
  dom.blockSelect.value = Object.keys(BLOCK_DEFS)[0];
}

function startRun() {
  const themeId = dom.themeSelect.value;
  const modeOnCancel = dom.cancelMode.value;
  appState.engine.startRun({ themeId, modeOnCancel });
  appState.lastPlacement = null;
  applyDirectionFocus();
  setResultMessage('新しい周回を開始しました。');
  renderAll();
}

function applyDirectionFocus() {
  const value = dom.focusSelect.value;
  if (!value) {
    if (typeof appState.engine.clearDirectionFocus === 'function') {
      appState.engine.clearDirectionFocus();
    } else {
      appState.engine.runState.directionFocus = undefined;
    }
    return;
  }
  try {
    appState.engine.setDirectionFocus(value);
  } catch (error) {
    console.error(error);
    setResultMessage('方向性の設定に失敗しました。', true);
  }
}

function placeBlock() {
  const blockId = dom.blockSelect.value;
  const block = BLOCK_DEFS[blockId];
  if (!block) {
    setResultMessage('不明なブロックです。', true);
    return;
  }
  const context = Object.assign({ material: block.drop && block.drop.material }, BLOCK_CONTEXTS[blockId]);
  try {
    const result = appState.engine.onPlace(blockId, context);
    appState.lastPlacement = { blockId, result, context };
    setResultMessage(formatPlacementResult(blockId, result));
  } catch (error) {
    console.error(error);
    setResultMessage(error.message, true);
  }
  renderAll();
}

function forceComboEnd() {
  const settlement = appState.engine.forceEndCombo();
  setResultMessage(`コンボ精算: ${settlement.payout} ${BASE_COMBO_PAYOUT.material} を獲得。`);
  renderAll();
}

function renderAll() {
  renderCombo();
  renderMaterials();
  renderBuffs();
  renderLimits();
  renderEvents();
  renderFx();
}

function renderCombo() {
  const combo = appState.engine.runState.combo;
  dom.comboValue.textContent = combo;
  const focus = appState.engine.runState.directionFocus;
  dom.directionLabel.textContent = focus || '未設定';
}

function renderMaterials() {
  const materials = appState.engine.getMaterials();
  dom.materialsTable.innerHTML = '';
  for (const material of MATERIALS) {
    const row = document.createElement('tr');
    const name = document.createElement('td');
    name.textContent = material;
    const value = document.createElement('td');
    value.textContent = materials[material] || 0;
    row.appendChild(name);
    row.appendChild(value);
    dom.materialsTable.appendChild(row);
  }
}

function renderBuffs() {
  dom.buffList.innerHTML = '';
  const buffs = appState.engine.runState.pendingBuffs;
  if (!buffs.length) {
    const item = document.createElement('li');
    item.textContent = 'バフなし';
    dom.buffList.appendChild(item);
    return;
  }
  for (const buff of buffs) {
    const item = document.createElement('li');
    const target = buff.appliesTo ? ` (${buff.appliesTo})` : '';
    item.textContent = `${buff.id}: ${buff.kind} x${buff.remaining || buff.charges}${target}`;
    dom.buffList.appendChild(item);
  }
}

function renderLimits() {
  dom.limitList.innerHTML = '';
  const counts = appState.engine.runState.placedBlockCounts || {};
  for (const [blockId, block] of Object.entries(BLOCK_DEFS)) {
    if (!block.placementLimit) continue;
    const li = document.createElement('li');
    const current = counts[blockId] || 0;
    li.textContent = `${blockId}: ${current}/${block.placementLimit}`;
    dom.limitList.appendChild(li);
  }
  if (!dom.limitList.children.length) {
    const item = document.createElement('li');
    item.textContent = '配置制限なし';
    dom.limitList.appendChild(item);
  }
}

function renderEvents() {
  const events = appState.engine.eventLog.slice(-50);
  dom.eventFeed.innerHTML = '';
  events.forEach((event, index) => {
    const li = document.createElement('li');
    li.textContent = formatEvent(event);
    if (index === events.length - 1) {
      li.classList.add('highlight');
    }
    dom.eventFeed.appendChild(li);
  });
}

function renderFx() {
  const fxEvents = appState.engine.fxLog.slice(-30);
  dom.fxFeed.innerHTML = '';
  fxEvents.forEach((entry, index) => {
    const li = document.createElement('li');
    li.textContent = `${entry.fx.id || 'fx'} ${JSON.stringify(entry.options)}`;
    if (index === fxEvents.length - 1) {
      li.classList.add('highlight');
    }
    dom.fxFeed.appendChild(li);
  });
}

function renderBlockDetails() {
  const blockId = dom.blockSelect.value;
  const block = BLOCK_DEFS[blockId];
  if (!block) {
    dom.blockDetails.innerHTML = '<p>ブロック情報が見つかりません。</p>';
    return;
  }
  const context = BLOCK_CONTEXTS[blockId] || {};
  const drop = block.drop
    ? `${block.drop.material} ${block.drop.amountMin}-${block.drop.amountMax} (発生率 ${(block.drop.chance * 100).toFixed(0)}%)`
    : 'なし';
  const limit = block.placementLimit ? `${block.placementLimit} 個まで` : '制限なし';
  const tags = context.tags ? context.tags.join(', ') : 'なし';
  dom.blockDetails.innerHTML = `
    <h3>${blockId}</h3>
    <dl>
      <dt>タイプ</dt><dd>${block.type}</dd>
      <dt>カテゴリ</dt><dd>${context.category || '不明'}</dd>
      <dt>タグ</dt><dd>${tags}</dd>
      <dt>ドロップ</dt><dd>${drop}</dd>
      <dt>小演出</dt><dd>${formatEventChance(block.smallEvent)}</dd>
      <dt>大演出</dt><dd>${formatEventChance(block.largeEvent)}</dd>
      <dt>設置上限</dt><dd>${limit}</dd>
    </dl>
  `;
}

function formatEventChance(event) {
  if (!event) return 'なし';
  const chance = event.chance ? `${(event.chance * 100).toFixed(1)}%` : '—';
  const gated = event.gatedByCombo ? ` / ゲート:${event.gatedByCombo}` : '';
  const reward = event.reward ? ` / バフ:${event.reward.id}` : '';
  return `${chance}${gated}${reward}`;
}

function formatPlacementResult(blockId, result) {
  const gainText = `+${result.gain}`;
  const continued = result.comboResult.continued;
  const ended = result.comboResult.endedCombo;
  if (continued) {
    return `${blockId} を配置 → ${gainText} / コンボ継続 ${result.combo} Hit`;
  }
  if (ended) {
    return `${blockId} を配置 → ${gainText} / ${ended} Hitコンボを精算後、${result.combo} Hitで再スタート`;
  }
  return `${blockId} を配置 → ${gainText} / コンボ開始 (${result.combo} Hit)`;
}

function formatEvent(event) {
  switch (event.type) {
    case 'runStarted':
      return `周回開始: テーマ=${event.theme}, キャンセル=${event.modeOnCancel}`;
    case 'directionFocusSet':
      return `方向性を ${event.material} に設定`;
    case 'directionFocusCleared':
      return '方向性をクリア';
    case 'comboStarted':
      return `コンボ開始 (${event.combo} Hit)`;
    case 'comboContinued':
      return `コンボ継続 → ${event.combo} Hit (+${event.increment}${event.persisted ? ' / バフ継続' : ''})`;
    case 'comboRestarted':
      return `コンボ再始動: 直前 ${event.previousCombo} Hit, 再開 ${event.newCombo} Hit`;
    case 'comboSettled':
      return `コンボ精算: ${event.combo} Hit → ${event.payout} ${BASE_COMBO_PAYOUT.material}`;
    case 'materialGain': {
      const source = event.context && event.context.source ? event.context.source : '不明';
      return `素材獲得: +${event.amount} ${event.material} (${source})`;
    }
    case 'buffApplied':
      return `バフ付与: ${event.buff.id} (${event.buff.kind}) x${event.buff.remaining || event.buff.charges}`;
    case 'buffExpired':
      return `バフ終了: ${event.buffId}`;
    case 'craftInstant':
      return `クラフト即時: ${event.buffId}`;
    case 'highStakesOffered':
      return `完全博打オファー: ${event.combo} Hit`;
    case 'highStakesDeclined':
      return '完全博打キャンセル';
    case 'highStakesOutcome':
      return `完全博打結果: ${event.result}`;
    case 'fx':
      return `FX再生: ${event.fx.id || 'unknown'}`;
    default:
      return JSON.stringify(event);
  }
}

function setResultMessage(message, isError = false) {
  dom.result.textContent = message;
  dom.result.classList.toggle('error', Boolean(isError));
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
