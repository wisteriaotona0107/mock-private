const form = document.getElementById('bottleForm');
const fridge = document.getElementById('fridge');
const bottleList = document.getElementById('bottleList');
const bottleCount = document.getElementById('bottleCount');
const clearAll = document.getElementById('clearAll');
const bottleRowTemplate = document.getElementById('bottleRowTemplate');

let bottles = [];

function renderCount() {
  bottleCount.textContent = bottles.length;
}

function renderFridge() {
  const highestShelf = bottles.reduce((max, b) => Math.max(max, b.shelf), 3);
  const slotsPerShelf = bottles.reduce((max, b) => Math.max(max, b.slot), 3);
  const totalCells = highestShelf * slotsPerShelf;
  fridge.style.gridTemplateColumns = `repeat(${slotsPerShelf}, 1fr)`;
  fridge.innerHTML = '';

  for (let i = 1; i <= totalCells; i++) {
    const shelf = Math.ceil(i / slotsPerShelf);
    const slot = i - (shelf - 1) * slotsPerShelf;
    const cell = document.createElement('div');
    cell.className = 'fridge-cell';
    const label = document.createElement('div');
    label.className = 'position-label';
    label.textContent = `${shelf}-${slot}`;
    cell.appendChild(label);

    const bottle = bottles.find((b) => b.shelf === shelf && b.slot === slot);
    if (bottle) {
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

    fridge.appendChild(cell);
  }
}

function renderList() {
  bottleList.innerHTML = '';
  bottles
    .sort((a, b) => a.shelf === b.shelf ? a.slot - b.slot : a.shelf - b.shelf)
    .forEach((bottle, index) => {
      const row = bottleRowTemplate.content.firstElementChild.cloneNode(true);
      row.querySelector('.name').textContent = bottle.name;
      row.querySelector('.price').textContent = bottle.price ? `¥${Number(bottle.price).toLocaleString()}` : '-';
      row.querySelector('.position').textContent = `${bottle.shelf}段目 / ${bottle.slot}番`;
      row.querySelector('.notes').textContent = bottle.notes || '';

      const deleteButton = row.querySelector('button');
      deleteButton.addEventListener('click', () => {
        bottles.splice(index, 1);
        updateUI();
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
    name: data.get('name').trim(),
    price: data.get('price'),
    shelf: Number(data.get('shelf')),
    slot: Number(data.get('slot')),
    notes: data.get('notes').trim(),
  };

  if (!bottle.name || !bottle.shelf || !bottle.slot) {
    return;
  }

  // Prevent duplicate placement so棚の上書きが発生しないようにする
  const exists = bottles.find((b) => b.shelf === bottle.shelf && b.slot === bottle.slot);
  if (exists) {
    alert('同じ場所にすでに一升瓶が登録されています。先に削除してください。');
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
