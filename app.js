const storageKey = 'lunchRestLogs';
const entryForm = document.querySelector('#entryForm');
const entryList = document.querySelector('#entryList');
const emptyState = document.querySelector('#emptyState');
const filterCategory = document.querySelector('#filterCategory');
const searchKeyword = document.querySelector('#searchKeyword');
const sortToggle = document.querySelector('#sortToggle');
const clearAllButton = document.querySelector('#clearAll');
const demoButton = document.querySelector('#demoButton');

const statToday = document.querySelector('#statToday');
const statLast = document.querySelector('#statLast');
const statAvgDuration = document.querySelector('#statAvgDuration');
const statEnergy = document.querySelector('#statEnergy');
const statFavorite = document.querySelector('#statFavorite');

let entries = [];
let sortDesc = true;

function loadEntries() {
  const saved = localStorage.getItem(storageKey);
  entries = saved ? JSON.parse(saved) : [];
}

function saveEntries() {
  localStorage.setItem(storageKey, JSON.stringify(entries));
}

function renderFilters() {
  const uniqueCategories = Array.from(new Set(entries.map((e) => e.category)));
  filterCategory.innerHTML = '<option value="">すべて</option>' +
    uniqueCategories.map((c) => `<option value="${c}">${c}</option>`).join('');
}

function renderStats() {
  const today = new Date();
  const todayEntries = entries.filter((entry) => {
    const time = new Date(entry.time);
    return time.toDateString() === today.toDateString();
  });
  statToday.textContent = todayEntries.length.toString();

  if (entries.length === 0) {
    statLast.textContent = '最新の記録: -';
    statAvgDuration.textContent = '0 分';
    statEnergy.textContent = '-';
    statFavorite.textContent = '-';
    return;
  }

  const lastEntry = entries[entries.length - 1];
  statLast.textContent = `最新の記録: ${formatDate(lastEntry.time)}`;

  const last7Days = entries.filter((entry) => {
    const diff = Date.now() - new Date(entry.time).getTime();
    return diff <= 7 * 24 * 60 * 60 * 1000;
  });

  const avgDuration = last7Days.reduce((sum, entry) => sum + entry.duration, 0) / (last7Days.length || 1);
  statAvgDuration.textContent = `${Math.round(avgDuration)} 分`;

  const veryGoodCount = last7Days.filter((entry) => entry.energy === 'とても良い').length;
  const ratio = last7Days.length ? Math.round((veryGoodCount / last7Days.length) * 100) : 0;
  statEnergy.textContent = last7Days.length ? `${ratio}%` : '-';

  const methodCounts = last7Days.reduce((acc, entry) => {
    acc[entry.method] = (acc[entry.method] || 0) + 1;
    return acc;
  }, {});
  const favorite = Object.entries(methodCounts).sort((a, b) => b[1] - a[1])[0];
  statFavorite.textContent = favorite ? `${favorite[0]} (${favorite[1]}回)` : '-';
}

function renderEntries() {
  const keyword = searchKeyword.value.trim().toLowerCase();
  const category = filterCategory.value;

  const filtered = entries.filter((entry) => {
    const matchesCategory = category === '' || entry.category === category;
    const matchesKeyword = keyword === '' || entry.method.toLowerCase().includes(keyword) || (entry.note || '').toLowerCase().includes(keyword);
    return matchesCategory && matchesKeyword;
  });

  const sorted = filtered.sort((a, b) => sortDesc ? new Date(b.time) - new Date(a.time) : new Date(a.time) - new Date(b.time));
  entryList.innerHTML = '';

  if (sorted.length === 0) {
    emptyState.style.display = 'block';
    entryList.style.display = 'none';
    return;
  }

  emptyState.style.display = 'none';
  entryList.style.display = 'grid';

  sorted.forEach((entry) => {
    const card = document.createElement('article');
    card.className = 'entry-card';
    card.innerHTML = `
      <div class="entry-meta">
        <span class="tag">${entry.category}</span>
        <span>${formatDate(entry.time)}</span>
        <span>${entry.duration}分</span>
      </div>
      <h3>${entry.method}</h3>
      <p class="note">${entry.note || 'メモなし'}</p>
      <div class="entry-actions">
        <span class="muted">体感: ${entry.energy}</span>
        <button class="btn btn-ghost" data-id="${entry.id}">削除</button>
      </div>
    `;
    entryList.appendChild(card);
  });

  entryList.querySelectorAll('button[data-id]').forEach((button) => {
    button.addEventListener('click', () => deleteEntry(button.dataset.id));
  });
}

function deleteEntry(id) {
  entries = entries.filter((entry) => entry.id !== id);
  saveEntries();
  renderFilters();
  renderStats();
  renderEntries();
}

function formatDate(value) {
  const date = new Date(value);
  return `${date.toLocaleDateString('ja-JP')} ${date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}`;
}

function addEntry(event) {
  event.preventDefault();
  const time = document.querySelector('#entryTime').value;
  const category = document.querySelector('#entryCategory').value;
  const method = document.querySelector('#entryMethod').value.trim();
  const duration = Number(document.querySelector('#entryDuration').value);
  const energy = document.querySelector('#entryEnergy').value;
  const note = document.querySelector('#entryNote').value.trim();

  if (!time || !category || !method || !duration) return;

  const entry = {
    id: crypto.randomUUID(),
    time,
    category,
    method,
    duration,
    energy,
    note,
  };

  entries.push(entry);
  saveEntries();
  renderFilters();
  renderStats();
  renderEntries();
  entryForm.reset();
  document.querySelector('#entryTime').value = new Date().toISOString().slice(0, 16);
}

function addDemoEntries() {
  const base = new Date();
  const demo = [
    { offset: -1, category: 'ランチ仮眠', method: '会議室で15分の仮眠', duration: 15, energy: 'とても良い', note: '眠気がすっきり。光を遮断すると効果的。' },
    { offset: -2, category: '散歩', method: 'ビル周りを10分散歩', duration: 10, energy: '良い', note: 'リモートでのこわばりが解消。' },
    { offset: -3, category: '瞑想', method: 'ヘッドフォンで呼吸瞑想', duration: 8, energy: '普通', note: '昼食後すぐだと少し眠い。' },
  ];

  demo.forEach((item) => {
    const time = new Date(base.getTime() + item.offset * 60 * 60 * 1000).toISOString().slice(0, 16);
    entries.push({ id: crypto.randomUUID(), time, ...item });
  });
  saveEntries();
  renderFilters();
  renderStats();
  renderEntries();
}

function clearAll() {
  if (!confirm('全ての記録を削除しますか？')) return;
  entries = [];
  saveEntries();
  renderFilters();
  renderStats();
  renderEntries();
}

function initFormDefaults() {
  const now = new Date().toISOString().slice(0, 16);
  document.querySelector('#entryTime').value = now;
}

entryForm.addEventListener('submit', addEntry);
filterCategory.addEventListener('change', renderEntries);
searchKeyword.addEventListener('input', renderEntries);
sortToggle.addEventListener('click', () => {
  sortDesc = !sortDesc;
  sortToggle.textContent = sortDesc ? '新しい順' : '古い順';
  renderEntries();
});
clearAllButton.addEventListener('click', clearAll);
demoButton.addEventListener('click', addDemoEntries);

loadEntries();
initFormDefaults();
renderFilters();
renderStats();
renderEntries();
