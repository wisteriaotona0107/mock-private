<?php
session_start();
if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}
$token = $_SESSION['csrf_token'];
?>
<!doctype html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>JSON + 画像 管理UI</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #f6f7fb;
      --card: #fff;
      --primary: #2563eb;
      --danger: #dc2626;
      --border: #e5e7eb;
    }
    * { box-sizing: border-box; }
    body { font-family: 'Noto Sans JP', sans-serif; margin: 0; background: var(--bg); color: #1f2937; }
    header { background: #0f172a; color: #fff; padding: 16px 24px; }
    header h1 { margin: 0; font-size: 1.4rem; }
    main { max-width: 1080px; margin: 24px auto; padding: 0 16px 32px; }
    .card { background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 18px; box-shadow: 0 8px 22px rgba(0,0,0,.04); margin-bottom: 16px; }
    .flex { display: flex; gap: 12px; flex-wrap: wrap; }
    label { display: block; font-weight: 600; margin-bottom: 4px; }
    input, select, textarea { width: 100%; padding: 10px; border-radius: 8px; border: 1px solid var(--border); font-size: 14px; }
    button { padding: 10px 16px; border: none; border-radius: 8px; cursor: pointer; font-weight: 700; }
    .primary { background: var(--primary); color: #fff; }
    .ghost { background: #e5e7eb; color: #111827; }
    .danger { background: var(--danger); color: #fff; }
    table { width: 100%; border-collapse: collapse; font-size: 14px; }
    th, td { padding: 10px; border-bottom: 1px solid var(--border); text-align: left; vertical-align: middle; }
    th { background: #f8fafc; }
    .actions button { margin-right: 6px; }
    .preview { width: 96px; height: 96px; object-fit: cover; border-radius: 10px; border: 1px solid var(--border); background: #f8fafc; }
    .note { font-size: 12px; color: #6b7280; }
    .grid-2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 12px; }
    .status { padding: 8px 10px; border-radius: 8px; font-size: 13px; margin-top: 8px; }
    .status.ok { background: #ecfdf3; color: #166534; border: 1px solid #bbf7d0; }
    .status.error { background: #fef2f2; color: #991b1b; border: 1px solid #fecdd3; }
    .pill { display: inline-block; padding: 4px 8px; border-radius: 999px; background: #e0f2fe; color: #0ea5e9; margin-right: 6px; font-size: 12px; }
  </style>
</head>
<body>
<header>
  <h1>JSON + 画像 管理UI (Xserver 対応)</h1>
</header>
<main>
  <section class="card">
    <div class="flex" style="align-items:center; justify-content: space-between;">
      <div>
        <label for="dataset">編集対象データセット</label>
        <select id="dataset">
          <option value="sake">日本酒 (sake.json)</option>
          <option value="menu">メニュー (menu.json)</option>
        </select>
        <p class="note">ファイルは <code>/public_html/data/</code> に保存。画像は <code>/public_html/images/</code>。</p>
      </div>
      <button class="ghost" id="reload">再読込</button>
    </div>
    <div id="status" class="status" style="display:none;"></div>
  </section>

  <section class="card">
    <h2 style="margin-top:0;">一覧・並び替え</h2>
    <div class="note">行の上下移動で <code>display_order</code> を変更します。保存ボタンで JSON へ反映します。</div>
    <div class="table-wrap" style="overflow-x:auto; margin-top:12px;">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>名称</th>
            <th>補足</th>
            <th>画像</th>
            <th>display_order</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody id="list"></tbody>
      </table>
    </div>
  </section>

  <section class="card">
    <h2 style="margin-top:0;">新規追加 / 編集</h2>
    <form id="item-form">
      <input type="hidden" id="edit-index" value="">
      <div class="grid-2" id="fields"></div>
      <div class="grid-2" style="margin-top:12px; align-items:center;">
        <div>
          <label for="image">画像アップロード</label>
          <input type="file" id="image" accept="image/*">
          <p class="note">jpg/png/gif。ファイル名は自動採番 (sake001.jpg など)</p>
        </div>
        <div style="text-align:center;">
          <img id="preview" class="preview" alt="preview">
          <div class="note" id="image-path-note"></div>
        </div>
      </div>
      <div class="flex" style="justify-content: flex-end; margin-top:12px;">
        <button type="button" class="ghost" id="reset">リセット</button>
        <button type="submit" class="primary">保存 (JSON 更新)</button>
      </div>
    </form>
  </section>
</main>
<script>
  const datasetConfig = {
    sake: {
      fields: [
        { key: 'id', label: 'ID (例: sake001)', type: 'text', required: true },
        { key: 'name', label: '名称', type: 'text', required: true },
        { key: 'region', label: '産地', type: 'text', required: true },
        { key: 'abv', label: '度数(%)', type: 'number', step: '0.1', required: true },
        { key: 'description', label: '説明', type: 'textarea', required: true },
        { key: 'image', label: '画像パス', type: 'text', required: false },
        { key: 'display_order', label: 'display_order', type: 'number', required: true }
      ],
    },
    menu: {
      fields: [
        { key: 'id', label: 'ID (例: dish001)', type: 'text', required: true },
        { key: 'name', label: '料理名', type: 'text', required: true },
        { key: 'price', label: '価格 (税込)', type: 'number', step: '1', required: true },
        { key: 'tags', label: 'タグ (カンマ区切り)', type: 'text', required: false },
        { key: 'image', label: '画像パス', type: 'text', required: false },
        { key: 'display_order', label: 'display_order', type: 'number', required: true }
      ],
    }
  };

  let state = { dataset: 'sake', token: '<?php echo htmlspecialchars($token, ENT_QUOTES, 'UTF-8'); ?>', data: [] };

  const datasetSelect = document.getElementById('dataset');
  const listEl = document.getElementById('list');
  const statusEl = document.getElementById('status');
  const formEl = document.getElementById('item-form');
  const fieldsEl = document.getElementById('fields');
  const imageInput = document.getElementById('image');
  const preview = document.getElementById('preview');
  const imagePathNote = document.getElementById('image-path-note');
  const editIndexEl = document.getElementById('edit-index');

  function showStatus(message, ok = true) {
    statusEl.textContent = message;
    statusEl.className = 'status ' + (ok ? 'ok' : 'error');
    statusEl.style.display = 'block';
    setTimeout(() => { statusEl.style.display = 'none'; }, 4000);
  }

  function buildFields(dataset) {
    fieldsEl.innerHTML = '';
    datasetConfig[dataset].fields.forEach(field => {
      const wrapper = document.createElement('div');
      const label = document.createElement('label');
      label.setAttribute('for', field.key);
      label.textContent = field.label;
      wrapper.appendChild(label);

      let input;
      if (field.type === 'textarea') {
        input = document.createElement('textarea');
        input.rows = 3;
      } else {
        input = document.createElement('input');
        input.type = field.type;
        if (field.step) input.step = field.step;
      }
      input.id = field.key;
      input.required = !!field.required;
      wrapper.appendChild(input);
      fieldsEl.appendChild(wrapper);
    });
  }

  function renderList() {
    state.data.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
    listEl.innerHTML = '';
    state.data.forEach((item, index) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${index + 1}</td>
        <td>${item.name || ''}</td>
        <td>${item.region || item.price || ''}</td>
        <td>${item.image ? `<span class="pill">${item.image}</span>` : '-'}</td>
        <td>${item.display_order || index + 1}</td>
        <td class="actions">
          <button type="button" class="ghost" data-action="up" data-index="${index}">▲</button>
          <button type="button" class="ghost" data-action="down" data-index="${index}">▼</button>
          <button type="button" class="primary" data-action="edit" data-index="${index}">編集</button>
          <button type="button" class="danger" data-action="delete" data-index="${index}">削除</button>
        </td>`;
      listEl.appendChild(tr);
    });
  }

  function populateForm(item = null) {
    datasetConfig[state.dataset].fields.forEach(field => {
      const el = document.getElementById(field.key);
      if (!el) return;
      const value = item ? item[field.key] : '';
      if (field.key === 'tags' && Array.isArray(value)) {
        el.value = value.join(',');
      } else {
        el.value = value ?? '';
      }
    });
    if (item && item.image) {
      preview.src = '../' + item.image;
      imagePathNote.textContent = item.image;
    } else {
      preview.removeAttribute('src');
      imagePathNote.textContent = '';
    }
    editIndexEl.value = item ? state.data.indexOf(item) : '';
  }

  async function fetchData(dataset) {
    const res = await fetch(`../api/load.php?dataset=${encodeURIComponent(dataset)}`, {
      credentials: 'same-origin',
    });
    const json = await res.json();
    if (json.error) throw new Error(json.error);
    state = { ...state, dataset: json.dataset, data: json.data || [], token: json.token };
  }

  function normalizeItem(formData) {
    const item = {};
    datasetConfig[state.dataset].fields.forEach(field => {
      let value = formData.get(field.key);
      if (field.type === 'number') {
        value = value ? Number(value) : 0;
      }
      if (field.key === 'tags') {
        value = value ? value.split(',').map(v => v.trim()).filter(Boolean) : [];
      }
      item[field.key] = value;
    });
    if (!item.display_order || Number.isNaN(item.display_order)) {
      item.display_order = state.data.length + 1;
    }
    return item;
  }

  function reorder() {
    state.data.forEach((item, idx) => item.display_order = idx + 1);
  }

  async function uploadImage() {
    if (!imageInput.files.length) return null;
    const form = new FormData();
    form.append('image', imageInput.files[0]);
    form.append('dataset', state.dataset);
    form.append('token', state.token);
    const res = await fetch('../api/upload.php', { method: 'POST', body: form, credentials: 'same-origin' });
    const json = await res.json();
    if (!json.ok) throw new Error(json.error || 'upload failed');
    return json.path;
  }

  async function saveToServer() {
    const payload = new URLSearchParams();
    payload.append('dataset', state.dataset);
    payload.append('token', state.token);
    payload.append('data', JSON.stringify(state.data));
    const res = await fetch('../api/save.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: payload.toString(),
      credentials: 'same-origin',
    });
    const json = await res.json();
    if (!json.ok) throw new Error(json.error || 'save failed');
    showStatus('JSONを保存しました');
  }

  listEl.addEventListener('click', (e) => {
    if (e.target.dataset.action) {
      const idx = Number(e.target.dataset.index);
      const action = e.target.dataset.action;
      if (action === 'edit') {
        populateForm(state.data[idx]);
      } else if (action === 'delete') {
        state.data.splice(idx, 1);
        reorder();
        renderList();
      } else if (action === 'up' && idx > 0) {
        [state.data[idx - 1], state.data[idx]] = [state.data[idx], state.data[idx - 1]];
        reorder();
        renderList();
      } else if (action === 'down' && idx < state.data.length - 1) {
        [state.data[idx + 1], state.data[idx]] = [state.data[idx], state.data[idx + 1]];
        reorder();
        renderList();
      }
    }
  });

  imageInput.addEventListener('change', () => {
    if (!imageInput.files.length) return;
    const file = imageInput.files[0];
    const reader = new FileReader();
    reader.onload = e => { preview.src = e.target.result; };
    reader.readAsDataURL(file);
    imagePathNote.textContent = '未アップロード (保存時に送信)';
  });

  formEl.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const uploadedPath = await uploadImage();
      const formData = new FormData(formEl);
      const item = normalizeItem(formData);
      if (uploadedPath) {
        item.image = uploadedPath;
      }
      const editIndex = editIndexEl.value !== '' ? Number(editIndexEl.value) : null;
      if (editIndex !== null && !Number.isNaN(editIndex)) {
        state.data[editIndex] = item;
      } else {
        state.data.push(item);
      }
      reorder();
      await saveToServer();
      renderList();
      populateForm();
      formEl.reset();
      imagePathNote.textContent = '';
      preview.removeAttribute('src');
    } catch (err) {
      console.error(err);
      showStatus(err.message, false);
    }
  });

  document.getElementById('reset').addEventListener('click', () => {
    formEl.reset();
    imagePathNote.textContent = '';
    preview.removeAttribute('src');
    populateForm();
  });

  document.getElementById('reload').addEventListener('click', async () => {
    try {
      await fetchData(state.dataset);
      renderList();
      populateForm();
      showStatus('最新のJSONを読み込みました');
    } catch (err) {
      showStatus(err.message, false);
    }
  });

  datasetSelect.addEventListener('change', async () => {
    state.dataset = datasetSelect.value;
    buildFields(state.dataset);
    populateForm();
    try {
      await fetchData(state.dataset);
      renderList();
      populateForm();
    } catch (err) {
      showStatus(err.message, false);
    }
  });

  async function init() {
    buildFields(state.dataset);
    try {
      await fetchData(state.dataset);
      renderList();
    } catch (err) {
      showStatus(err.message, false);
    }
  }

  init();
</script>
</body>
</html>
