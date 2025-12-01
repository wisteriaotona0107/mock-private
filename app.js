const menuData = [
  {
    "id": 1,
    "name": "獺祭 純米大吟醸 45",
    "desc": "華やかな吟醸香とキレの良さ。",
    "rice": "山田錦",
    "polish": 45,
    "abv": 16,
    "img": "./img/img001.png",
    "price": 6000
  },
  {
    "id": 2,
    "name": "十四代 吟撰",
    "desc": "蜜のような甘みと透明感のある余韻。",
    "rice": "特A山田錦",
    "polish": 40,
    "abv": 15,
    "img": "./img/img002.png",
    "price": 7200
  },
  {
    "id": 3,
    "name": "新政 No.6 R-type",
    "desc": "ジューシーで軽快、モダンな甘酸のバランス。",
    "rice": "秋田酒こまち",
    "polish": 55,
    "abv": 15,
    "img": "./img/img003.png",
    "price": 4800
  },
  {
    "id": 4,
    "name": "田酒 特別純米",
    "desc": "旨味とキレの中庸、食中に最適。",
    "rice": "華吹雪",
    "polish": 55,
    "abv": 16,
    "img": "./img/img004.png",
    "price": 4200
  },
  {
    "id": 5,
    "name": "而今 純米吟醸 火入れ",
    "desc": "瑞々しい完熟フルーツのような香味。",
    "rice": "山田錦",
    "polish": 50,
    "abv": 16,
    "img": "./img/img005.png",
    "price": 6800
  },
  {
    "id": 6,
    "name": "黒龍 吟醸いっちょらい",
    "desc": "繊細で柔らかな味わい、端正な仕上がり。",
    "rice": null,
    "polish": 50,
    "abv": 15,
    "img": "./img/img006.png",
    "price": 3500
  },
  {
    "id": 7,
    "name": "飛露喜 特別純米",
    "desc": "ボディがありキレも良い。食事に寄り添うタイプ。",
    "rice": null,
    "polish": 55,
    "abv": 16,
    "img": "./img/img007.png",
    "price": 4500
  },
  {
    "id": 8,
    "name": "醸し人九平次 純米大吟醸",
    "desc": "メロンや洋梨の香り、透明感のある酸。",
    "rice": "山田錦",
    "polish": 45,
    "abv": 16,
    "img": "./img/img008.png",
    "price": 8000
  },
  {
    "id": 9,
    "name": "赤武 純米",
    "desc": "爽やかな酸と穏やかな甘みが魅力。",
    "rice": "吟ぎんが",
    "polish": 60,
    "abv": 15,
    "img": "./img/img009.png",
    "price": 3200
  },
  {
    "id": 10,
    "name": "雪の茅舎 純米吟醸",
    "desc": "香り控えめ、優しい旨味とキレ。",
    "rice": null,
    "polish": 55,
    "abv": 16,
    "img": "./img/img010.png",
    "price": 3800
  },
  {
    "id": 11,
    "name": "獺祭 純米大吟醸 磨き二割三分",
    "desc": "濃密でありながら透明感のあるトップクラスの香味。",
    "rice": "山田錦",
    "polish": 23,
    "abv": 16,
    "img": "./img/img011.png",
    "price": 15000
  },
  {
    "id": 12,
    "name": "空のスロット",
    "desc": "内容を追加してお使いください。",
    "rice": null,
    "polish": null,
    "abv": null,
    "img": "",
    "price": null
  }
];

const frontLayout = [
  { category: "季節限定（春・秋）", badge: "限定", badgeTheme: "gold", note: "春は桜、秋はひやおろしをご用意", pairing: "旬の前菜と一緒に", temperature: "花冷え" },
  { category: "定番 純米吟醸", badge: "", badgeTheme: "", note: "香りと旨味のバランス重視", pairing: "刺身・カルパッチョ", temperature: "冷や" },
  { category: "定番 純米大吟醸", badge: "", badgeTheme: "", note: "香り・口当たり重視", pairing: "白身魚・天ぷら", temperature: "涼冷え" },
  { category: "辛口・食中酒", badge: "辛口", badgeTheme: "green", note: "食事に寄り添うキレ", pairing: "焼き物・揚げ物", temperature: "常温" },
  { category: "甘口・女性向け", badge: "柔らか", badgeTheme: "gold", note: "優しい甘み", pairing: "チーズ・デザート", temperature: "花冷え" },
  { category: "ハウス日本酒", badge: "おすすめ", badgeTheme: "green", note: "日常使いの一杯", pairing: "小鉢・旬菜", temperature: "常温" }
];

const backLayout = [
  { category: "酒肴", badge: "小鉢", badgeTheme: "gold", note: "枝豆・出汁巻など", pairing: "軽い一杯と", temperature: "" },
  { category: "焼き物・温菜", badge: "温かい", badgeTheme: "green", note: "旬魚の焼き物", pairing: "吟醸酒に", temperature: "" },
  { category: "揚げ物", badge: "熱々", badgeTheme: "gold", note: "から揚げ・天ぷら", pairing: "辛口と相性◎", temperature: "" },
  { category: "食事", badge: "〆", badgeTheme: "green", note: "ご飯・味噌汁", pairing: "定番酒で", temperature: "" },
  { category: "デザート/限定", badge: "甘味", badgeTheme: "gold", note: "季節の甘味・限定酒", pairing: "食後酒に", temperature: "" },
  { category: "店舗情報", badge: "info", badgeTheme: "green", note: "営業時間・アクセス", pairing: "", temperature: "" }
];

const cardsContainerFront = document.querySelector('[data-side="front"]');
const cardsContainerBack = document.querySelector('[data-side="back"]');

function formatPrice(price) {
  return price ? `¥${price.toLocaleString()} / 720ml` : "価格未定";
}

function buildMetrics(item) {
  const metrics = [];
  if (item.rice) metrics.push(`米：${item.rice}`);
  if (item.polish) metrics.push(`精米歩合：${item.polish}%`);
  if (item.abv) metrics.push(`ABV：${item.abv}%`);
  return metrics.length ? metrics.join(" / ") : "詳細：お尋ねください";
}

function createCard(item, layout, isHighlight = false, includeQr = false) {
  const row = document.createElement('div');
  row.className = 'card-row';

  const card = document.createElement('article');
  card.className = `card ${isHighlight ? 'card--highlight' : ''}`.trim();
  card.setAttribute('data-category', layout.category);

  if (layout.badge) {
    const badge = document.createElement('div');
    badge.className = `badge ${layout.badgeTheme === 'green' ? 'badge--green' : ''}`.trim();
    badge.textContent = layout.badge;
    card.appendChild(badge);
  }

  const imageBox = document.createElement('div');
  imageBox.className = 'card__image';
  if (item.img) {
    const img = document.createElement('img');
    img.src = item.img;
    img.alt = `${item.name} のボトル画像`;
    img.loading = 'lazy';
    img.onerror = () => {
      imageBox.innerHTML = '';
      const placeholder = document.createElement('span');
      placeholder.textContent = 'Image N/A';
      placeholder.style.fontSize = '9pt';
      placeholder.style.color = '#6b6b6b';
      imageBox.appendChild(placeholder);
    };
    imageBox.appendChild(img);
  } else {
    const placeholder = document.createElement('span');
    placeholder.textContent = 'No Image';
    placeholder.style.fontSize = '9pt';
    placeholder.style.color = '#6b6b6b';
    imageBox.appendChild(placeholder);
  }

  const content = document.createElement('div');
  content.className = 'card__content';

  const heading = document.createElement('div');
  heading.className = 'card__heading';

  const title = document.createElement('h2');
  title.className = 'card__title';
  title.textContent = item.name;
  heading.appendChild(title);

  const tag = document.createElement('span');
  tag.className = 'tag';
  tag.textContent = layout.category;
  heading.appendChild(tag);

  const desc = document.createElement('p');
  desc.className = 'card__desc';
  desc.textContent = item.desc || layout.note;

  const metrics = document.createElement('p');
  metrics.className = 'card__metrics';
  metrics.textContent = buildMetrics(item);

  const tagsRow = document.createElement('div');
  tagsRow.className = 'card__tags';
  const pairing = document.createElement('span');
  pairing.textContent = layout.pairing || '';
  const temp = document.createElement('span');
  temp.textContent = layout.temperature ? `提供温度：${layout.temperature}` : '';
  if (pairing.textContent) tagsRow.appendChild(pairing);
  if (temp.textContent) tagsRow.appendChild(temp);

  const footer = document.createElement('div');
  footer.className = 'card__footer';
  const note = document.createElement('span');
  note.textContent = layout.note;
  note.style.fontSize = '8pt';
  note.style.color = '#4b4b4b';
  const price = document.createElement('p');
  price.className = 'price';
  price.textContent = formatPrice(item.price);

  footer.append(note, price);

  content.append(heading, desc, metrics, tagsRow, footer);

  if (includeQr) {
    const qrBox = document.createElement('div');
    qrBox.className = 'qr-box';
    const text = document.createElement('div');
    text.innerHTML = '<strong>店舗情報</strong><br>営業時間：17:00-23:00<br>住所：東京都中央区サンプル1-2-3<br>SNS/地図はQRから';
    text.style.fontSize = '9pt';
    const qr = document.createElement('div');
    qr.className = 'qr-placeholder';
    qr.textContent = 'QR';
    qrBox.append(text, qr);
    content.append(qrBox);
  }

  card.append(imageBox, content);
  row.appendChild(card);
  return row;
}

function populateCards() {
  frontLayout.forEach((layout, idx) => {
    const data = menuData[idx] || {};
    const card = createCard(data, layout, idx === frontLayout.length - 1);
    cardsContainerFront.appendChild(card);
  });

  backLayout.forEach((layout, idx) => {
    const data = menuData[idx + 6] || {};
    const isLast = idx === backLayout.length - 1;
    const card = createCard(data, layout, isLast, isLast);
    cardsContainerBack.appendChild(card);
  });
}

populateCards();
