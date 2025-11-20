let sakeData = [];
let menuData = [];

async function loadData() {
  const [sakeRes, menuRes] = await Promise.all([
    fetch('data/sake.json'),
    fetch('data/menu.json')
  ]);
  sakeData = await sakeRes.json();
  menuData = (await menuRes.json()).items;
  renderSake();
  renderMenu();
}

function renderSake() {
  const list = document.getElementById('sakeList');
  list.innerHTML = sakeData
    .map(
      (item) => `
      <li class="list-item" data-id="${item.id}">
        <strong>${item.name}</strong> / ${item.prefecture} / ${item.type}
        <div class="meta">蔵元: ${item.brewery} / ${item.polishing}% / ${item.serving}</div>
        <div style="display:flex;gap:0.5rem;margin-top:0.4rem;">
          <button data-action="edit" class="ghost" type="button">編集</button>
          <button data-action="delete" class="ghost" type="button">削除</button>
        </div>
      </li>
    `
    )
    .join('');
}

function renderMenu() {
  const list = document.getElementById('menuList');
  list.innerHTML = menuData
    .map(
      (item) => `
      <li class="list-item" data-id="${item.id}">
        <strong>${item.category}</strong> / ${item.name} (${item.price})
        <div class="meta">ペアリング: ${item.pairing}</div>
        <div style="display:flex;gap:0.5rem;margin-top:0.4rem;">
          <button data-action="up" class="ghost" type="button">▲</button>
          <button data-action="down" class="ghost" type="button">▼</button>
          <button data-action="edit" class="ghost" type="button">編集</button>
          <button data-action="delete" class="ghost" type="button">削除</button>
        </div>
      </li>
    `
    )
    .join('');
}

function upsertSake(formData) {
  const id = formData.get('id');
  const payload = Object.fromEntries(formData.entries());
  payload.polishing = payload.polishing ? Number(payload.polishing) : '';
  if (id) {
    const idx = sakeData.findIndex((i) => String(i.id) === id);
    sakeData[idx] = { ...sakeData[idx], ...payload };
  } else {
    payload.id = Date.now();
    sakeData.push(payload);
  }
  document.getElementById('sakeForm').reset();
  renderSake();
}

function upsertMenu(formData) {
  const id = formData.get('id');
  const payload = Object.fromEntries(formData.entries());
  if (id) {
    const idx = menuData.findIndex((i) => String(i.id) === id);
    menuData[idx] = { ...menuData[idx], ...payload };
  } else {
    payload.id = Date.now();
    menuData.push(payload);
  }
  document.getElementById('menuForm').reset();
  renderMenu();
}

function handleSakeAction(e) {
  const action = e.target.dataset.action;
  if (!action) return;
  const id = e.target.closest('li').dataset.id;
  const item = sakeData.find((i) => String(i.id) === id);
  if (action === 'edit') {
    const form = document.getElementById('sakeForm');
    Object.keys(item).forEach((key) => {
      if (form.elements[key]) form.elements[key].value = item[key];
    });
  }
  if (action === 'delete') {
    sakeData = sakeData.filter((i) => String(i.id) !== id);
    renderSake();
  }
}

function handleMenuAction(e) {
  const action = e.target.dataset.action;
  if (!action) return;
  const el = e.target.closest('li');
  const id = el.dataset.id;
  const idx = menuData.findIndex((i) => String(i.id) === id);
  if (action === 'edit') {
    const form = document.getElementById('menuForm');
    Object.keys(menuData[idx]).forEach((key) => {
      if (form.elements[key]) form.elements[key].value = menuData[idx][key];
    });
  }
  if (action === 'delete') {
    menuData.splice(idx, 1);
    renderMenu();
  }
  if (action === 'up' && idx > 0) {
    [menuData[idx - 1], menuData[idx]] = [menuData[idx], menuData[idx - 1]];
    renderMenu();
  }
  if (action === 'down' && idx < menuData.length - 1) {
    [menuData[idx + 1], menuData[idx]] = [menuData[idx], menuData[idx + 1]];
    renderMenu();
  }
}

function exportJSON() {
  const sakeBlob = new Blob([JSON.stringify(sakeData, null, 2)], { type: 'application/json' });
  const menuBlob = new Blob([JSON.stringify({ items: menuData }, null, 2)], { type: 'application/json' });
  const sakeUrl = URL.createObjectURL(sakeBlob);
  const menuUrl = URL.createObjectURL(menuBlob);
  downloadFile(sakeUrl, 'sake.json');
  downloadFile(menuUrl, 'menu.json');
}

function downloadFile(url, name) {
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}

function generatePath() {
  const folder = document.getElementById('folder').value.replace(/\/$/,'');
  const ext = document.getElementById('ext').value || '.jpg';
  const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
  const path = `${folder}/img_${timestamp}${ext}`;
  document.getElementById('pathPreview').textContent = path;
}

document.addEventListener('DOMContentLoaded', () => {
  loadData();
  document.getElementById('sakeForm').addEventListener('submit', (e) => {
    e.preventDefault();
    upsertSake(new FormData(e.target));
  });
  document.getElementById('menuForm').addEventListener('submit', (e) => {
    e.preventDefault();
    upsertMenu(new FormData(e.target));
  });
  document.getElementById('sakeList').addEventListener('click', handleSakeAction);
  document.getElementById('menuList').addEventListener('click', handleMenuAction);
  document.getElementById('exportSake').addEventListener('click', () => downloadFile(new Blob([JSON.stringify(sakeData, null, 2)], { type: 'application/json' }), 'sake.json'));
  document.getElementById('exportMenu').addEventListener('click', () => downloadFile(new Blob([JSON.stringify({ items: menuData }, null, 2)], { type: 'application/json' }), 'menu.json'));
  document.getElementById('generatePath').addEventListener('click', generatePath);
});
