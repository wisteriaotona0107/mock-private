// モックデータ: 日本酒
const sakeList = [
  {
    id: 1,
    name: "澤の鶴 純米 からくち",
    brewery: "澤の鶴酒造",
    region: "兵庫",
    rice: "山田錦",
    seimaiBuai: 70,
    abv: 15,
    taste: "辛口寄り",
    aroma: "穏やか",
    temperatureRecommend: ["冷酒", "常温"],
    pairingTags: ["揚げ物", "辛口", "すっきり"],
    note: "キレのある辛口。冷酒でシャープに、常温で旨味が感じやすい。",
  },
  {
    id: 2,
    name: "黒龍 いっちょらい",
    brewery: "黒龍酒造",
    region: "福井",
    rice: "山田錦",
    seimaiBuai: 55,
    abv: 15,
    taste: "軽快・すっきり",
    aroma: "華やか",
    temperatureRecommend: ["冷酒"],
    pairingTags: ["刺身", "爽やか", "軽やか"],
    note: "軽やかな吟醸香と透明感ある旨味。お刺身や淡い味付けに。",
  },
  {
    id: 3,
    name: "十四代 本丸",
    brewery: "高木酒造",
    region: "山形",
    rice: "美山錦",
    seimaiBuai: 55,
    abv: 15,
    taste: "甘口寄り",
    aroma: "華やか",
    temperatureRecommend: ["冷酒", "常温"],
    pairingTags: ["甘味", "果実感", "香り高い"],
    note: "上品な甘みと余韻。フルーティーな香りが特徴でデザートにも。",
  },
  {
    id: 4,
    name: "日高見 超辛口純米",
    brewery: "平孝酒造",
    region: "宮城",
    rice: "ササニシキ",
    seimaiBuai: 60,
    abv: 16,
    taste: "辛口寄り",
    aroma: "穏やか",
    temperatureRecommend: ["冷酒", "常温", "燗酒"],
    pairingTags: ["魚介", "辛口", "燗酒"],
    note: "芯の通った辛口。燗でも冷でもバランスが良く、魚介全般と好相性。",
  },
  {
    id: 5,
    name: "獺祭 純米大吟醸45",
    brewery: "旭酒造",
    region: "山口",
    rice: "山田錦",
    seimaiBuai: 45,
    abv: 16,
    taste: "軽快・すっきり",
    aroma: "華やか",
    temperatureRecommend: ["冷酒"],
    pairingTags: ["刺身", "爽やか", "華やか"],
    note: "フルーティーな香りと滑らかな口当たり。冷酒で香りを楽しんで。",
  },
  {
    id: 6,
    name: "加茂錦 荷札酒 黄水仙",
    brewery: "加茂錦酒造",
    region: "新潟",
    rice: "五百万石",
    seimaiBuai: 50,
    abv: 15,
    taste: "旨口",
    aroma: "穏やか",
    temperatureRecommend: ["冷酒", "常温"],
    pairingTags: ["野菜", "旨口", "コク"],
    note: "柔らかい旨味と酸のバランス。野菜のお浸しや炊き合わせに。",
  },
  {
    id: 7,
    name: "神亀 ひやおろし",
    brewery: "神亀酒造",
    region: "埼玉",
    rice: "山田錦",
    seimaiBuai: 60,
    abv: 15,
    taste: "濃醇",
    aroma: "穏やか",
    temperatureRecommend: ["常温", "燗酒"],
    pairingTags: ["煮物", "濃醇", "燗酒"],
    note: "熟成感のある濃醇な旨味。ぬる燗でコクが増し、煮物やチーズと好相性。",
  },
  {
    id: 8,
    name: "白隠正宗 純米吟醸",
    brewery: "高嶋酒造",
    region: "静岡",
    rice: "誉富士",
    seimaiBuai: 60,
    abv: 15,
    taste: "旨口",
    aroma: "穏やか",
    temperatureRecommend: ["冷酒", "常温"],
    pairingTags: ["燻製", "旨口", "柑橘"],
    note: "柑橘のような香りと旨味の膨らみ。燻製や柑橘を使った料理と合わせて。",
  },
];

// モックデータ: 料理
const foodList = [
  {
    id: 1,
    name: "鶏の唐揚げ",
    category: "揚げ物",
    tags: ["揚げ物", "しっかりめ"],
    note: "レモンを添えた定番の唐揚げ。",
    pairingSakeTags: ["揚げ物", "辛口", "コク"],
  },
  {
    id: 2,
    name: "だし巻き卵",
    category: "卵料理",
    tags: ["優しい", "出汁"],
    note: "甘さ控えめの関西風。",
    pairingSakeTags: ["穏やか", "旨口", "常温"],
  },
  {
    id: 3,
    name: "刺身盛り合わせ",
    category: "刺身",
    tags: ["魚介", "軽め"],
    note: "白身中心のさっぱりとした盛り合わせ。",
    pairingSakeTags: ["刺身", "爽やか", "冷酒"],
  },
  {
    id: 4,
    name: "牛すじ煮込み",
    category: "煮物",
    tags: ["濃い味", "しっかり"],
    note: "八丁味噌ベースでコク深く。",
    pairingSakeTags: ["煮物", "燗酒", "濃醇"],
  },
  {
    id: 5,
    name: "バニラアイス最中",
    category: "甘味",
    tags: ["甘味", "デザート"],
    note: "香ばしい最中とバニラアイスの組み合わせ。",
    pairingSakeTags: ["甘味", "果実感"],
  },
  {
    id: 6,
    name: "燻製チーズ",
    category: "チーズ",
    tags: ["燻製", "コク"],
    note: "軽い燻香のクリーミーなチーズ。",
    pairingSakeTags: ["燻製", "旨口", "濃醇"],
  },
  {
    id: 7,
    name: "焼き野菜の盛り合わせ",
    category: "野菜",
    tags: ["野菜", "軽め"],
    note: "季節野菜をオリーブオイルでグリル。",
    pairingSakeTags: ["野菜", "旨口", "柑橘"],
  },
  {
    id: 8,
    name: "豚の生姜焼き",
    category: "肉料理",
    tags: ["肉料理", "しっかり"],
    note: "甘辛いタレと生姜の香りが食欲をそそる。",
    pairingSakeTags: ["辛口", "コク", "常温"],
  },
];

const views = {
  top: document.getElementById("view-top"),
  list: document.getElementById("view-list"),
  food2sake: document.getElementById("view-food2sake"),
  sake2food: document.getElementById("view-sake2food"),
};

const sakeListEl = document.getElementById("sake-list");
const tasteSelect = document.getElementById("taste-select");
const tempCheckboxes = Array.from(document.querySelectorAll("input[name='temperature']"));
const modal = document.getElementById("modal");
const modalBody = document.getElementById("modal-body");
const modalClose = document.getElementById("modal-close");
const foodCategorySelect = document.getElementById("food-category");
const foodListEl = document.getElementById("food-list");
const pairingResultEl = document.getElementById("pairing-result");
const sakeSelectEl = document.getElementById("sake-select");
const foodPairingResultEl = document.getElementById("food-pairing-result");

const showView = (name) => {
  Object.entries(views).forEach(([key, el]) => {
    el.classList.toggle("active", key === name);
  });
};

const createTagRow = (tags) => {
  const row = document.createElement("div");
  row.className = "tag-row";
  tags.forEach((tag) => {
    const span = document.createElement("span");
    span.className = "tag";
    span.textContent = tag;
    row.appendChild(span);
  });
  return row;
};

const renderSakeList = (list) => {
  sakeListEl.innerHTML = "";
  list.forEach((sake) => {
    const card = document.createElement("div");
    card.className = "card sake-card";
    card.dataset.id = sake.id;

    const title = document.createElement("h4");
    title.textContent = sake.name;
    card.appendChild(title);

    const meta = document.createElement("div");
    meta.className = "meta";
    meta.textContent = `${sake.brewery} / ${sake.region} / 精米歩合: ${sake.seimaiBuai}% / ABV: ${sake.abv}%`;
    card.appendChild(meta);

    card.appendChild(createTagRow(sake.temperatureRecommend));

    const note = document.createElement("p");
    note.className = "note";
    note.textContent = sake.note;
    card.appendChild(note);

    card.addEventListener("click", () => openModal(sake));
    sakeListEl.appendChild(card);
  });
};

const applyFilters = () => {
  const selectedTemps = tempCheckboxes.filter((cb) => cb.checked).map((cb) => cb.value);
  const taste = tasteSelect.value;

  const filtered = sakeList.filter((sake) => {
    const tempMatch = selectedTemps.length === 0 || selectedTemps.some((t) => sake.temperatureRecommend.includes(t));
    const tasteMatch = taste === "all" || sake.taste.includes(taste);
    return tempMatch && tasteMatch;
  });

  renderSakeList(filtered);
};

const openModal = (sake) => {
  modalBody.innerHTML = `
    <h3>${sake.name}</h3>
    <p class="meta">${sake.brewery} / ${sake.region}</p>
    <p>米: ${sake.rice} ｜ 精米歩合: ${sake.seimaiBuai}% ｜ ABV: ${sake.abv}%</p>
    <div class="tag-row">${sake.temperatureRecommend.map((t) => `<span class="tag">${t}</span>`).join("")}</div>
    <div class="tag-row">${sake.pairingTags.map((t) => `<span class="tag">#${t}</span>`).join("")}</div>
    <p>${sake.note}</p>
  `;
  modal.classList.remove("hidden");
};

const closeModal = () => {
  modal.classList.add("hidden");
};

const initFoodCategories = () => {
  const categories = [...new Set(foodList.map((f) => f.category))];
  foodCategorySelect.innerHTML = categories
    .map((c) => `<option value="${c}">${c}</option>`)
    .join("");
};

const renderFoodList = (category) => {
  foodListEl.innerHTML = "";
  const items = foodList.filter((f) => f.category === category);
  items.forEach((food) => {
    const li = document.createElement("li");
    li.textContent = food.name;
    li.addEventListener("click", () => handleFoodSelect(food));
    foodListEl.appendChild(li);
  });
};

const scorePairing = (baseTags, targetTags) => {
  const set = new Set(baseTags);
  return targetTags.reduce((score, tag) => (set.has(tag) ? score + 1 : score), 0);
};

const handleFoodSelect = (food) => {
  const scored = sakeList
    .map((sake) => ({ sake, score: scorePairing(food.pairingSakeTags, sake.pairingTags) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  pairingResultEl.innerHTML = scored.length
    ? scored
        .map(
          ({ sake, score }) => `
            <div class="item">
              <div class="highlight">${sake.name}</div>
              <div class="meta">${sake.brewery} / 推奨温度: ${sake.temperatureRecommend.join("・")}</div>
              <div class="tag-row">${sake.pairingTags.map((t) => `<span class="tag">${t}</span>`).join("")}</div>
              <p class="note">タグ一致数: ${score}｜${sake.note}</p>
            </div>
          `
        )
        .join("")
    : `<p class="note">該当する日本酒が見つかりませんでした。</p>`;
};

const initSakeSelect = () => {
  sakeSelectEl.innerHTML = sakeList
    .map((sake) => `<option value="${sake.id}">${sake.name}</option>`)
    .join("");
};

const renderFoodPairing = (sakeId) => {
  const target = sakeList.find((s) => s.id === Number(sakeId));
  if (!target) return;

  const scored = foodList
    .map((food) => ({ food, score: scorePairing(target.pairingTags, food.pairingSakeTags) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  foodPairingResultEl.innerHTML = scored.length
    ? scored
        .map(
          ({ food, score }) => `
            <div class="item">
              <div class="highlight">${food.name}</div>
              <div class="meta">${food.category}｜タグ一致数: ${score}</div>
              <div class="tag-row">${food.tags.map((t) => `<span class="tag">${t}</span>`).join("")}</div>
              <p class="note">${food.note}</p>
            </div>
          `
        )
        .join("")
    : `<p class="note">おすすめが見つかりませんでした。</p>`;
};

// イベント登録
Array.from(document.querySelectorAll(".nav-btn")).forEach((btn) => {
  btn.addEventListener("click", () => showView(btn.dataset.target));
});

tasteSelect.addEventListener("change", applyFilters);
tempCheckboxes.forEach((cb) => cb.addEventListener("change", applyFilters));
modalClose.addEventListener("click", closeModal);
modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});

foodCategorySelect.addEventListener("change", (e) => renderFoodList(e.target.value));
sakeSelectEl.addEventListener("change", (e) => renderFoodPairing(e.target.value));

// 初期表示
renderSakeList(sakeList);
initFoodCategories();
renderFoodList(foodCategorySelect.value);
initSakeSelect();
renderFoodPairing(sakeSelectEl.value);
