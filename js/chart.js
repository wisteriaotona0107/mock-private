import { getQueryParam } from './search.js';

export function renderFlavorMap(canvas, items) {
  if (!canvas || !items.length) return;
  const ctx = canvas.getContext('2d');
  const { width, height } = canvas;

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = '#cfd7eb';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(width / 2, 0);
  ctx.lineTo(width / 2, height);
  ctx.moveTo(0, height / 2);
  ctx.lineTo(width, height / 2);
  ctx.stroke();

  ctx.fillStyle = '#5c6577';
  ctx.font = '12px Inter';
  ctx.fillText('甘口', 8, height - 8);
  ctx.fillText('辛口', width - 30, height - 8);
  ctx.fillText('濃厚', 8, 14);
  ctx.fillText('軽い', 8, height / 2 + 14);

  items.forEach((item) => {
    const x = (item.sweetDry / 100) * width;
    const y = height - (item.body / 100) * height;
    ctx.fillStyle = '#6557ffcc';
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fill();
  });
}

export function renderTasteBars(target, sake) {
  const groups = [
    ['甘味', 100 - sake.sweetDry],
    ['酸味', sake.acidity * 20],
    ['香り', sake.aroma * 20],
    ['コク', sake.umami * 20]
  ];

  const wrapper = document.createElement('div');
  groups.forEach(([label, value]) => {
    const row = document.createElement('div');
    row.className = 'taste-row';
    const text = document.createElement('span');
    text.textContent = label;

    const bar = document.createElement('div');
    bar.className = 'taste-bar';
    const fill = document.createElement('div');
    fill.className = 'taste-fill';
    fill.style.width = `${value}%`;
    bar.appendChild(fill);

    row.append(text, bar);
    wrapper.appendChild(row);
  });
  target.appendChild(wrapper);
}

async function renderSakeDetail() {
  const root = document.getElementById('sake-detail');
  if (!root) return;

  const id = Number(getQueryParam('id'));
  const res = await fetch('data/sake.json');
  const items = await res.json();
  const sake = items.find((item) => item.id === id);

  if (!sake) {
    const card = document.createElement('section');
    card.className = 'card';
    card.textContent = '日本酒が見つかりませんでした。';
    root.appendChild(card);
    return;
  }

  const section = document.createElement('section');
  section.className = 'card';

  const title = document.createElement('h1');
  title.textContent = sake.name;
  const image = document.createElement('img');
  image.src = sake.img;
  image.alt = `${sake.name}の写真`;

  const desc = document.createElement('p');
  desc.textContent = sake.desc;

  const meta = document.createElement('p');
  meta.className = 'meta';
  meta.textContent = `${sake.rice} / 精米歩合 ${sake.polish} / Alc ${sake.alc} / ${sake.price}円`;

  const taste = document.createElement('div');
  taste.className = 'card';
  const tasteTitle = document.createElement('h2');
  tasteTitle.textContent = '味わいチャート';

  const pairing = document.createElement('div');
  pairing.className = 'card';
  const pairingTitle = document.createElement('h2');
  pairingTitle.textContent = 'おすすめペアリング';
  const ul = document.createElement('ul');
  sake.pairing.forEach((dish) => {
    const li = document.createElement('li');
    li.textContent = dish;
    ul.appendChild(li);
  });

  section.append(title, image, desc, meta);
  taste.appendChild(tasteTitle);
  renderTasteBars(taste, sake);
  pairing.append(pairingTitle, ul);

  root.append(section, taste, pairing);
}

renderSakeDetail();
