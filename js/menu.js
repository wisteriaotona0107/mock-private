import { loadSakeData } from './app.js';
import { applyFilters, setupSearchController } from './search.js';

function makeOption(value) {
  const option = document.createElement('option');
  option.value = value;
  option.textContent = value;
  return option;
}

function populateSelect(select, values) {
  values.forEach((value) => select.appendChild(makeOption(value)));
}

function buildMenuCard(sake) {
  const card = document.createElement('article');
  card.className = 'card';

  const img = document.createElement('img');
  img.src = sake.image;
  img.alt = `${sake.name}の画像`;

  const body = document.createElement('div');
  body.className = 'card-body';

  const badge = document.createElement('span');
  badge.className = 'badge';
  badge.textContent = sake.type;

  const title = document.createElement('h3');
  title.textContent = sake.name;

  const desc = document.createElement('p');
  desc.textContent = sake.desc;

  const meta = document.createElement('p');
  meta.className = 'meta';
  meta.textContent = `${sake.region} / ${sake.rice} / ${sake.alc}`;

  const price = document.createElement('p');
  price.className = 'price';
  price.textContent = `${sake.price}円`;

  const link = document.createElement('a');
  link.className = 'btn';
  link.href = `sake.html?id=${encodeURIComponent(sake.id)}`;
  link.textContent = '詳細を見る';

  body.append(badge, title, desc, meta, price, link);
  card.append(img, body);

  return card;
}

function renderMenu(items, grid, resultCount) {
  grid.textContent = '';
  items.forEach((item) => grid.appendChild(buildMenuCard(item)));
  resultCount.textContent = `${items.length}件表示中`;
}

async function initMenuPage() {
  const menuGrid = document.getElementById('menu-grid');
  if (!menuGrid) return;

  const searchInput = document.getElementById('search-input');
  const typeSelect = document.getElementById('type-select');
  const riceSelect = document.getElementById('rice-select');
  const regionSelect = document.getElementById('region-select');
  const sweetSelect = document.getElementById('sweet-select');
  const bodySelect = document.getElementById('body-select');
  const priceSelect = document.getElementById('price-select');
  const resultCount = document.getElementById('result-count');

  const data = await loadSakeData();

  populateSelect(typeSelect, [...new Set(data.map((d) => d.type))]);
  populateSelect(riceSelect, [...new Set(data.map((d) => d.rice))]);
  populateSelect(regionSelect, [...new Set(data.map((d) => d.region))]);

  const controls = {
    searchInput,
    typeSelect,
    riceSelect,
    regionSelect,
    sweetSelect,
    bodySelect,
    priceSelect
  };

  const update = () => {
    const filtered = applyFilters(data, controls);
    renderMenu(filtered, menuGrid, resultCount);
  };

  setupSearchController(controls, update);
  update();
}

initMenuPage().catch(console.error);
