import './app.js';
import { applyFilters, getQueryParam } from './search.js';
import { renderFlavorMap } from './chart.js';

const state = {
  all: [],
  filtered: []
};

function createTag(text) {
  const tag = document.createElement('span');
  tag.className = 'tag';
  tag.textContent = text;
  return tag;
}

function renderList(items) {
  const list = document.getElementById('menu-list');
  if (!list) return;
  list.textContent = '';

  if (!items.length) {
    const empty = document.createElement('article');
    empty.className = 'card';
    empty.textContent = '条件に合う日本酒が見つかりませんでした。';
    list.appendChild(empty);
    return;
  }

  items.forEach((item) => {
    const card = document.createElement('article');
    card.className = 'card sake-card';

    const img = document.createElement('img');
    img.src = item.img;
    img.alt = `${item.name}の写真`;
    img.loading = 'lazy';

    const title = document.createElement('h3');
    title.textContent = item.name;

    const desc = document.createElement('p');
    desc.textContent = item.desc;

    const tags = document.createElement('div');
    tags.className = 'tags';
    [item.type, item.rice, `${item.price}円`].forEach((tagName) => {
      tags.appendChild(createTag(tagName));
    });

    const meta = document.createElement('p');
    meta.className = 'meta';
    meta.textContent = `${item.region} / 精米歩合 ${item.polish} / Alc ${item.alc}`;

    const link = document.createElement('a');
    link.className = 'btn primary';
    link.href = `sake.html?id=${item.id}`;
    link.textContent = '詳細を見る';

    card.append(img, title, desc, tags, meta, link);
    list.appendChild(card);
  });
}

function getFormData() {
  const form = document.getElementById('filter-form');
  if (!form) return null;
  const data = new FormData(form);
  return {
    keyword: String(data.get('keyword') || ''),
    type: String(data.get('type') || ''),
    sweetness: String(data.get('sweetness') || ''),
    body: String(data.get('body') || ''),
    rice: String(data.get('rice') || ''),
    region: String(data.get('region') || ''),
    priceRange: String(data.get('priceRange') || '')
  };
}

function applyRecommendation(items) {
  const category = getQueryParam('recommend');
  if (!category) return items;
  return items.filter((item) => item.recommend.includes(category));
}

function bindEvents() {
  const form = document.getElementById('filter-form');
  const resetButton = document.getElementById('reset-btn');

  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    const filter = getFormData();
    if (!filter) return;
    state.filtered = applyFilters(state.all, filter);
    renderList(state.filtered);
    renderFlavorMap(document.getElementById('flavor-map'), state.filtered);
  });

  resetButton?.addEventListener('click', () => {
    form?.reset();
    state.filtered = state.all;
    renderList(state.filtered);
    renderFlavorMap(document.getElementById('flavor-map'), state.filtered);
  });
}

async function init() {
  const res = await fetch('data/sake.json');
  const items = await res.json();
  state.all = applyRecommendation(items);
  state.filtered = state.all;
  renderList(state.filtered);
  renderFlavorMap(document.getElementById('flavor-map'), state.filtered);
  bindEvents();
}

init();
