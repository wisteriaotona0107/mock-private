const dataUrl = 'data/sake.json';

export async function loadSakeData() {
  const response = await fetch(dataUrl);
  if (!response.ok) {
    throw new Error('日本酒データの取得に失敗しました');
  }
  return response.json();
}

function createCard(sake) {
  const article = document.createElement('article');
  article.className = 'card';

  const image = document.createElement('img');
  image.src = sake.image;
  image.alt = `${sake.name}の画像`;

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
  meta.textContent = `${sake.rice} / ${sake.polish} / ${sake.alc}`;

  const price = document.createElement('p');
  price.className = 'price';
  price.textContent = `${sake.price}円`;

  const link = document.createElement('a');
  link.className = 'btn';
  link.href = `sake.html?id=${encodeURIComponent(sake.id)}`;
  link.textContent = '詳細を見る';

  body.append(badge, title, desc, meta, price, link);
  article.append(image, body);
  return article;
}

async function renderHome() {
  const rankingGrid = document.getElementById('ranking-grid');
  const recommend = document.getElementById('today-recommend');
  if (!rankingGrid || !recommend) return;

  const data = await loadSakeData();
  const top = data.filter((s) => s.recommended.includes('人気ランキング')).slice(0, 3);
  const today = data.find((s) => s.recommended.includes('本日のおすすめ')) || data[0];

  recommend.textContent = `${today.name} - ${today.desc}`;
  top.forEach((sake) => rankingGrid.appendChild(createCard(sake)));
}

function statRow(label, value) {
  const row = document.createElement('p');
  row.className = 'meta';
  row.textContent = `${label}: ${value}`;
  return row;
}

async function renderDetail() {
  const root = document.getElementById('detail-root');
  if (!root) return;

  const params = new URLSearchParams(window.location.search);
  const id = Number(params.get('id'));
  const data = await loadSakeData();
  const target = data.find((s) => s.id === id) || data[0];

  root.textContent = '';
  const title = document.createElement('h1');
  title.className = 'section-title';
  title.textContent = target.name;

  const layout = document.createElement('section');
  layout.className = 'detail-layout';

  const hero = document.createElement('img');
  hero.className = 'detail-hero';
  hero.src = target.image;
  hero.alt = `${target.name}のボトル写真`;

  const panel = document.createElement('article');
  panel.className = 'detail-panel';

  const desc = document.createElement('p');
  desc.textContent = target.longDesc;

  const chart = document.createElement('div');
  chart.className = 'chart-box';
  chart.setAttribute('aria-label', '甘辛と軽重の味チャート');

  const axes = document.createElement('div');
  axes.className = 'axes';
  const dot = document.createElement('div');
  dot.className = 'dot';
  dot.style.left = `${target.sweetDry}%`;
  dot.style.top = `${100 - target.body}%`;
  const dotLabel = document.createElement('span');
  dotLabel.className = 'dot-label';
  dotLabel.textContent = target.name;
  dot.appendChild(dotLabel);
  chart.append(axes, dot);

  panel.append(
    desc,
    statRow('酒米', target.rice),
    statRow('地域', target.region),
    statRow('香り', target.aroma),
    statRow('ペアリング', target.pairing.join(' / ')),
    statRow('価格', `${target.price}円`),
    chart
  );

  layout.append(hero, panel);
  root.append(title, layout);
}

renderHome().catch(console.error);
renderDetail().catch(console.error);
