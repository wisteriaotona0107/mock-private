async function fetchJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  return res.json();
}

function createSakeCard(item) {
  return `
    <article class="card">
      <span class="tag">${item.type}</span>
      <img src="${item.image}" alt="${item.name}" />
      <h3>${item.name}</h3>
      <p class="meta">${item.brewery} / ${item.prefecture}・${item.polishing}%</p>
      <p>${item.tasting}</p>
      <p class="meta">提供温度: ${item.serving} / グラス: ${item.glass}</p>
    </article>
  `;
}

function createMenuItem(item) {
  return `
    <div class="list-item">
      <div class="eyebrow">${item.category}</div>
      <h3>${item.name}</h3>
      <p>${item.description}</p>
      <p class="meta">${item.price} / ペアリング: ${item.pairing}</p>
    </div>
  `;
}

function createNewsCard(item) {
  return `
    <article class="news-card">
      <p class="meta">${item.date}</p>
      <h3>${item.title}</h3>
      <p>${item.body}</p>
      <p class="meta">タグ: ${item.tags.join(', ')}</p>
    </article>
  `;
}

function createGalleryItem(item) {
  return `<img src="${item.src}" alt="${item.alt}" loading="lazy" />`;
}

async function init() {
  try {
    const [sakes, menu, news, gallery] = await Promise.all([
      fetchJSON('data/sake.json'),
      fetchJSON('data/menu.json'),
      fetchJSON('data/news.json'),
      fetchJSON('data/gallery.json')
    ]);

    const sakeCards = document.getElementById('sakeCards');
    const prefFilter = document.getElementById('prefFilter');
    const typeFilter = document.getElementById('typeFilter');

    const uniquePrefs = [...new Set(sakes.map((s) => s.prefecture))];
    uniquePrefs.forEach((pref) => {
      const option = document.createElement('option');
      option.value = pref;
      option.textContent = pref;
      prefFilter.appendChild(option);
    });

    function renderSake() {
      const pref = prefFilter.value;
      const type = typeFilter.value;
      const filtered = sakes.filter((s) => {
        return (!pref || s.prefecture === pref) && (!type || s.type === type);
      });
      sakeCards.innerHTML = filtered.map(createSakeCard).join('');
    }

    prefFilter.addEventListener('change', renderSake);
    typeFilter.addEventListener('change', renderSake);
    renderSake();

    const menuList = document.getElementById('menuList');
    function renderMenu(items) {
      menuList.innerHTML = items.map(createMenuItem).join('');
    }
    renderMenu(menu.items);
    document.getElementById('shuffleMenu').addEventListener('click', () => {
      const shuffled = [...menu.items].sort(() => 0.5 - Math.random()).slice(0, 4);
      renderMenu(shuffled);
    });

    document.getElementById('newsList').innerHTML = news.items
      .slice(0, 3)
      .map(createNewsCard)
      .join('');

    document.getElementById('galleryGrid').innerHTML = gallery.items
      .slice(0, 6)
      .map(createGalleryItem)
      .join('');
  } catch (e) {
    console.error(e);
  }
}

document.addEventListener('DOMContentLoaded', init);
