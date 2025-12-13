const form = document.getElementById('bottleForm');
const fridgeContainer = document.getElementById('fridge');
const bottleList = document.getElementById('bottleList');
const bottleCount = document.getElementById('bottleCount');
const clearAll = document.getElementById('clearAll');
const bottleRowTemplate = document.getElementById('bottleRowTemplate');

const DEFAULT_GRID_SIZE = 3;

let bottles = [];

function renderCount() {
  bottleCount.textContent = bottles.length;
}

function groupBottlesByFridge() {
  const grouped = new Map();
  bottles.forEach((bottle) => {
    if (!grouped.has(bottle.fridge)) {
      grouped.set(bottle.fridge, []);
    }
    grouped.get(bottle.fridge).push(bottle);
  });
  return grouped;
}

function renderFridge() {
  fridgeContainer.innerHTML = '';

  if (!bottles.length) {
    const empty = document.createElement('p');
    empty.className = 'helper fridge-empty';
    empty.textContent = 'まだ登録がありません。冷蔵庫名と棚の位置、奥行きを入力して追加してください。';
    fridgeContainer.appendChild(empty);
    return;
  }

  const grouped = groupBottlesByFridge();

  grouped.forEach((items, fridgeName) => {
    const shelfCount = Math.max(DEFAULT_GRID_SIZE, ...items.map((b) => b.shelf));
    const slotCount = Math.max(DEFAULT_GRID_SIZE, ...items.map((b) => b.slot));
    const depthCount = Math.max(DEFAULT_GRID_SIZE, ...items.map((b) => b.depth));

    const group = document.createElement('section');
    group.className = 'fridge-group';

    const header = document.createElement('div');
    header.className = 'fridge-group-header';

    const title = document.createElement('h3');
    title.className = 'fridge-name';
    title.textContent = fridgeName;

    const countBadge = document.createElement('div');
    countBadge.className = 'count-badge mini';
    const countNumber = document.createElement('span');
    countNumber.className = 'count-number';
    countNumber.textContent = items.length;
    const countLabel = document.createElement('span');
    countLabel.textContent = '本';
    countBadge.append(countNumber, countLabel);

    header.append(title, countBadge);
    group.appendChild(header);

    const depthStack = document.createElement('div');
    depthStack.className = 'depth-stack';

    for (let depth = 1; depth <= depthCount; depth++) {
      const depthLayer = document.createElement('div');
      depthLayer.className = 'depth-layer';

      const depthLabel = document.createElement('div');
      depthLabel.className = 'depth-label';
      const depthName = depth === 1 ? '手前' : depth === depthCount ? '奥側' : '中段';
      depthLabel.textContent = `奥行${depth}（${depthName}）`;

      const grid = document.createElement('div');
      grid.className = 'fridge-grid';
      grid.style.setProperty('--slot-count', slotCount);

      for (let shelf = 1; shelf <= shelfCount; shelf++) {
        for (let slot = 1; slot <= slotCount; slot++) {
          const cell = document.createElement('div');
          cell.className = 'fridge-cell';

          const label = document.createElement('div');
          label.className = 'position-label';
          label.textContent = `${shelf}-${slot}`;
          cell.appendChild(label);

          const bottle = items.find(
            (b) => b.shelf === shelf && b.slot === slot && b.depth === depth,
          );

          if (bottle) {
            cell.classList.add('filled');
            const name = document.createElement('div');
            name.className = 'name';
            name.textContent = bottle.name;
            cell.appendChild(name);

            if (bottle.price) {
              const price = document.createElement('div');
              price.className = 'price';
              price.textContent = `¥${Number(bottle.price).toLocaleString()}`;
              cell.appendChild(price);
            }
          }

          grid.appendChild(cell);
        }
      }

      depthLayer.append(depthLabel, grid);
      depthStack.appendChild(depthLayer);
    }

    group.appendChild(depthStack);
    fridgeContainer.appendChild(group);
  });
}

function renderList() {
  bottleList.innerHTML = '';
  const sorted = [...bottles].sort((a, b) => {
    if (a.fridge !== b.fridge) return a.fridge.localeCompare(b.fridge, 'ja');
    if (a.shelf !== b.shelf) return a.shelf - b.shelf;
    if (a.slot !== b.slot) return a.slot - b.slot;
    return a.depth - b.depth;
  });

  sorted.forEach((bottle) => {
    const row = bottleRowTemplate.content.firstElementChild.cloneNode(true);
    row.querySelector('.fridge').textContent = bottle.fridge;
    row.querySelector('.name').textContent = bottle.name;
    row.querySelector('.price').textContent = bottle.price
      ? `¥${Number(bottle.price).toLocaleString()}`
      : '-';
    row.querySelector('.position').textContent = `${bottle.shelf}段 / ${bottle.slot}番 / 奥${bottle.depth}`;
    row.querySelector('.notes').textContent = bottle.notes || '';

    const deleteButton = row.querySelector('button');
    deleteButton.addEventListener('click', () => {
      const index = bottles.findIndex(
        (b) =>
          b.fridge === bottle.fridge &&
          b.shelf === bottle.shelf &&
          b.slot === bottle.slot &&
          b.depth === bottle.depth,
      );
      if (index >= 0) {
        bottles.splice(index, 1);
        updateUI();
      }
    });

    bottleList.appendChild(row);
  });
}

function updateUI() {
  renderCount();
  renderFridge();
  renderList();
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const bottle = {
    fridge: data.get('fridge').trim(),
    name: data.get('name').trim(),
    price: data.get('price'),
    shelf: Number(data.get('shelf')),
    slot: Number(data.get('slot')),
    depth: Number(data.get('depth')),
    notes: data.get('notes').trim(),
  };

  if (!bottle.fridge || !bottle.name || !bottle.shelf || !bottle.slot || !bottle.depth) {
    return;
  }

  if (bottle.shelf > DEFAULT_GRID_SIZE || bottle.slot > DEFAULT_GRID_SIZE || bottle.depth > DEFAULT_GRID_SIZE) {
    alert('棚は3段、左右3列、奥行き3本の想定です。1〜3の範囲で入力してください。');
    return;
  }

  const exists = bottles.find(
    (b) =>
      b.fridge === bottle.fridge &&
      b.shelf === bottle.shelf &&
      b.slot === bottle.slot &&
      b.depth === bottle.depth,
  );
  if (exists) {
    alert('同じ冷蔵庫の同じ棚・位置・奥行きにすでに一升瓶が登録されています。先に削除してください。');
    return;
  }

  bottles.push(bottle);
  form.reset();
  updateUI();
});

clearAll.addEventListener('click', () => {
  if (!bottles.length) return;
  const ok = confirm('登録済みの一升瓶をすべて削除しますか？');
  if (ok) {
    bottles = [];
    updateUI();
  }
});

updateUI();
