const FALLBACK_DATA = {
  areas: [
    { id: 1, name: "ほくりく" },
    { id: 2, name: "とうほく" },
    { id: 3, name: "かんとう" },
    { id: 4, name: "ちゅうぶ" },
    { id: 5, name: "きんき" },
    { id: 6, name: "ちゅうごく" },
    { id: 7, name: "しこく" },
    { id: 8, name: "きゅうしゅう" }
  ],
  breweries: [
    { id: 1, name: "やましろ酒造", areaId: 1 },
    { id: 2, name: "あおば蔵", areaId: 2 },
    { id: 3, name: "しろがね酒蔵", areaId: 2 },
    { id: 4, name: "かげつ酒造", areaId: 3 },
    { id: 5, name: "みずさき酒造", areaId: 3 },
    { id: 6, name: "つばさ酒造", areaId: 4 },
    { id: 7, name: "やまもと蔵", areaId: 4 },
    { id: 8, name: "おおさか酒房", areaId: 5 },
    { id: 9, name: "あかつき蔵", areaId: 6 },
    { id: 10, name: "しらさぎ酒造", areaId: 6 },
    { id: 11, name: "ゆうひ酒造", areaId: 7 },
    { id: 12, name: "あさひ蔵", areaId: 8 }
  ],
  brands: [
    { id: 1, name: "くろかげ", breweryId: 1 },
    { id: 2, name: "しろつゆ", breweryId: 1 },
    { id: 3, name: "はるのつき", breweryId: 1 },
    { id: 4, name: "あおばのかぜ", breweryId: 2 },
    { id: 5, name: "みちしるべ", breweryId: 2 },
    { id: 6, name: "しろがね", breweryId: 3 },
    { id: 7, name: "ゆきほたる", breweryId: 3 },
    { id: 8, name: "かげつ", breweryId: 4 },
    { id: 9, name: "あやかげ", breweryId: 4 },
    { id: 10, name: "みずさき", breweryId: 5 },
    { id: 11, name: "うらなみ", breweryId: 5 },
    { id: 12, name: "つばさ", breweryId: 6 },
    { id: 13, name: "かぜのうた", breweryId: 6 },
    { id: 14, name: "やまもと", breweryId: 7 },
    { id: 15, name: "こだま", breweryId: 7 },
    { id: 16, name: "おおさか", breweryId: 8 },
    { id: 17, name: "なにわのゆめ", breweryId: 8 },
    { id: 18, name: "あかつき", breweryId: 9 },
    { id: 19, name: "ひかりさけ", breweryId: 9 },
    { id: 20, name: "しらさぎ", breweryId: 10 },
    { id: 21, name: "しらさぎうた", breweryId: 10 },
    { id: 22, name: "ゆうひ", breweryId: 11 },
    { id: 23, name: "おれんじ", breweryId: 11 },
    { id: 24, name: "あさひ", breweryId: 12 },
    { id: 25, name: "きらめき", breweryId: 12 },
    { id: 26, name: "ゆうぐれ", breweryId: 9 },
    { id: 27, name: "よぞら", breweryId: 4 },
    { id: 28, name: "こもれび", breweryId: 7 },
    { id: 29, name: "しずく", breweryId: 3 },
    { id: 30, name: "みずひめ", breweryId: 5 },
    { id: 31, name: "ほたるび", breweryId: 6 },
    { id: 32, name: "はるかぜ", breweryId: 2 },
    { id: 33, name: "しずか", breweryId: 10 },
    { id: 34, name: "さざなみ", breweryId: 5 },
    { id: 35, name: "みつぼし", breweryId: 1 }
  ],
  flavorCharts: [
    { brandId: 1, f1: 0.3, f2: 0.6, f3: 0.4, f4: 0.5, f5: 0.7, f6: 0.3 },
    { brandId: 2, f1: 0.7, f2: 0.5, f3: 0.6, f4: 0.4, f5: 0.3, f6: 0.5 },
    { brandId: 3, f1: 0.6, f2: 0.7, f3: 0.3, f4: 0.2, f5: 0.4, f6: 0.6 },
    { brandId: 4, f1: 0.8, f2: 0.4, f3: 0.5, f4: 0.3, f5: 0.2, f6: 0.6 },
    { brandId: 5, f1: 0.5, f2: 0.6, f3: 0.4, f4: 0.6, f5: 0.5, f6: 0.4 },
    { brandId: 6, f1: 0.4, f2: 0.7, f3: 0.4, f4: 0.5, f5: 0.6, f6: 0.3 },
    { brandId: 7, f1: 0.7, f2: 0.3, f3: 0.7, f4: 0.2, f5: 0.3, f6: 0.5 },
    { brandId: 8, f1: 0.4, f2: 0.5, f3: 0.6, f4: 0.6, f5: 0.6, f6: 0.2 },
    { brandId: 9, f1: 0.6, f2: 0.4, f3: 0.5, f4: 0.7, f5: 0.5, f6: 0.3 },
    { brandId: 10, f1: 0.3, f2: 0.6, f3: 0.5, f4: 0.7, f5: 0.6, f6: 0.4 },
    { brandId: 11, f1: 0.5, f2: 0.4, f3: 0.6, f4: 0.5, f5: 0.4, f6: 0.2 },
    { brandId: 12, f1: 0.6, f2: 0.5, f3: 0.4, f4: 0.4, f5: 0.3, f6: 0.5 },
    { brandId: 13, f1: 0.7, f2: 0.5, f3: 0.6, f4: 0.3, f5: 0.4, f6: 0.5 },
    { brandId: 14, f1: 0.4, f2: 0.7, f3: 0.3, f4: 0.5, f5: 0.7, f6: 0.2 },
    { brandId: 15, f1: 0.6, f2: 0.3, f3: 0.7, f4: 0.4, f5: 0.5, f6: 0.4 },
    { brandId: 16, f1: 0.5, f2: 0.6, f3: 0.5, f4: 0.5, f5: 0.4, f6: 0.6 },
    { brandId: 17, f1: 0.8, f2: 0.4, f3: 0.4, f4: 0.3, f5: 0.3, f6: 0.7 },
    { brandId: 18, f1: 0.5, f2: 0.7, f3: 0.3, f4: 0.6, f5: 0.6, f6: 0.4 },
    { brandId: 19, f1: 0.7, f2: 0.6, f3: 0.4, f4: 0.4, f5: 0.5, f6: 0.6 },
    { brandId: 20, f1: 0.3, f2: 0.6, f3: 0.6, f4: 0.6, f5: 0.5, f6: 0.3 },
    { brandId: 21, f1: 0.6, f2: 0.4, f3: 0.5, f4: 0.5, f5: 0.6, f6: 0.4 },
    { brandId: 22, f1: 0.5, f2: 0.6, f3: 0.4, f4: 0.5, f5: 0.4, f6: 0.6 },
    { brandId: 23, f1: 0.7, f2: 0.3, f3: 0.6, f4: 0.4, f5: 0.3, f6: 0.7 },
    { brandId: 24, f1: 0.4, f2: 0.5, f3: 0.5, f4: 0.7, f5: 0.6, f6: 0.3 },
    { brandId: 25, f1: 0.8, f2: 0.5, f3: 0.4, f4: 0.3, f5: 0.4, f6: 0.6 },
    { brandId: 26, f1: 0.4, f2: 0.7, f3: 0.3, f4: 0.6, f5: 0.5, f6: 0.4 },
    { brandId: 27, f1: 0.6, f2: 0.4, f3: 0.7, f4: 0.3, f5: 0.5, f6: 0.3 },
    { brandId: 28, f1: 0.5, f2: 0.6, f3: 0.5, f4: 0.4, f5: 0.6, f6: 0.2 },
    { brandId: 29, f1: 0.6, f2: 0.5, f3: 0.4, f4: 0.5, f5: 0.5, f6: 0.3 },
    { brandId: 31, f1: 0.7, f2: 0.4, f3: 0.6, f4: 0.3, f5: 0.4, f6: 0.6 },
    { brandId: 32, f1: 0.8, f2: 0.5, f3: 0.4, f4: 0.4, f5: 0.3, f6: 0.7 },
    { brandId: 33, f1: 0.3, f2: 0.7, f3: 0.5, f4: 0.6, f5: 0.6, f6: 0.3 },
    { brandId: 34, f1: 0.5, f2: 0.5, f3: 0.6, f4: 0.5, f5: 0.4, f6: 0.4 },
    { brandId: 35, f1: 0.7, f2: 0.6, f3: 0.3, f4: 0.4, f5: 0.5, f6: 0.6 }
  ]
};

let state = {
  brands: [],
  searchResults: [],
  selectedIndex: 0,
  selectedBrand: null
};

const flavorLabels = [
  "はなやか",
  "ほうじゅん",
  "キレ",
  "ふくらみ",
  "コク",
  "あまみ"
];

const searchInput = document.getElementById("searchInput");
const searchList = document.getElementById("searchList");
const brandStatus = document.getElementById("brandStatus");
const similarList = document.getElementById("similarList");

function loadData() {
  return Promise.all([
    fetch("mock/areas.json").then((res) => res.json()),
    fetch("mock/breweries.json").then((res) => res.json()),
    fetch("mock/brands.json").then((res) => res.json()),
    fetch("mock/flavor-charts.json").then((res) => res.json())
  ])
    .then(([areasData, breweriesData, brandsData, flavorData]) => {
      return mergeData(
        areasData.areas,
        breweriesData.breweries,
        brandsData.brands,
        flavorData.flavorCharts
      );
    })
    .catch(() => {
      return mergeData(
        FALLBACK_DATA.areas,
        FALLBACK_DATA.breweries,
        FALLBACK_DATA.brands,
        FALLBACK_DATA.flavorCharts
      );
    });
}

function mergeData(areas, breweries, brands, flavorCharts) {
  const areaMap = new Map(areas.map((area) => [area.id, area]));
  const breweryMap = new Map(breweries.map((brewery) => [brewery.id, brewery]));
  const flavorMap = new Map(
    flavorCharts.map((flavor) => [flavor.brandId, flavor])
  );

  return brands.map((brand) => {
    const brewery = breweryMap.get(brand.breweryId);
    const area = brewery ? areaMap.get(brewery.areaId) : null;
    const flavor = flavorMap.get(brand.id) || null;
    return {
      ...brand,
      breweryName: brewery ? brewery.name : "???",
      areaName: area ? area.name : "???",
      flavor
    };
  });
}

function normalizeText(text) {
  return text
    .toString()
    .normalize("NFKC")
    .replace(/[\s　]/g, "")
    .toLowerCase();
}

function scoreByNgrams(query, target) {
  if (!query || !target) {
    return 0;
  }
  const ngrams = new Map();
  for (let i = 0; i < query.length - 1; i += 1) {
    const gram = query.slice(i, i + 2);
    ngrams.set(gram, (ngrams.get(gram) || 0) + 1);
  }
  let matches = 0;
  for (let i = 0; i < target.length - 1; i += 1) {
    const gram = target.slice(i, i + 2);
    if (ngrams.has(gram)) {
      matches += 1;
    }
  }
  return matches;
}

function searchBrands(query) {
  const normalized = normalizeText(query);
  if (!normalized) {
    return state.brands.slice(0, 10);
  }

  const scored = state.brands
    .map((brand) => {
      const name = normalizeText(brand.name);
      let score = 0;
      if (name.startsWith(normalized)) {
        score += 100;
      } else if (name.includes(normalized)) {
        score += 50;
      }
      score += scoreByNgrams(normalized, name);
      return { brand, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.brand.id - b.brand.id)
    .slice(0, 10)
    .map((item) => item.brand);

  return scored;
}

function computeSimilarity(targetBrand) {
  if (!targetBrand || !targetBrand.flavor) {
    return [];
  }
  const target = [
    targetBrand.flavor.f1,
    targetBrand.flavor.f2,
    targetBrand.flavor.f3,
    targetBrand.flavor.f4,
    targetBrand.flavor.f5,
    targetBrand.flavor.f6
  ];

  const targetNorm = Math.sqrt(target.reduce((sum, v) => sum + v * v, 0));
  if (!targetNorm) {
    return [];
  }

  return state.brands
    .filter((brand) => brand.id !== targetBrand.id && brand.flavor)
    .map((brand) => {
      const vec = [
        brand.flavor.f1,
        brand.flavor.f2,
        brand.flavor.f3,
        brand.flavor.f4,
        brand.flavor.f5,
        brand.flavor.f6
      ];
      const dot = vec.reduce((sum, v, idx) => sum + v * target[idx], 0);
      const norm = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0));
      const similarity = norm ? dot / (norm * targetNorm) : 0;
      return { brand, similarity };
    })
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 10);
}

function renderSearchList(results) {
  searchList.innerHTML = "";

  if (results.length === 0) {
    const li = document.createElement("li");
    li.textContent = "みつからなかった";
    li.classList.add("unknown");
    searchList.appendChild(li);
    return;
  }

  results.forEach((brand, index) => {
    const li = document.createElement("li");
    li.dataset.index = index;
    if (index === state.selectedIndex) {
      li.classList.add("active");
    }
    const title = document.createElement("div");
    title.textContent = `> ${brand.name}（めいがら）`;
    const sub = document.createElement("div");
    sub.className = "subtext";
    sub.textContent = `〜${brand.breweryName} / ${brand.areaName}〜`;
    li.appendChild(title);
    li.appendChild(sub);
    li.addEventListener("click", () => {
      selectBrand(index);
    });
    searchList.appendChild(li);
  });
}

function renderBrandStatus(brand) {
  brandStatus.innerHTML = "";

  if (!brand) {
    brandStatus.innerHTML = "<p>めいがら を えらんでください</p>";
    return;
  }

  const info = document.createElement("div");
  info.className = "status-line";
  info.innerHTML = `<div>めいがら</div><span>${brand.name}</span>`;

  const brewery = document.createElement("div");
  brewery.className = "status-line";
  brewery.innerHTML = `<div>くらもと</div><span>${brand.breweryName}</span>`;

  const area = document.createElement("div");
  area.className = "status-line";
  area.innerHTML = `<div>ちいき</div><span>${brand.areaName}</span>`;

  brandStatus.appendChild(info);
  brandStatus.appendChild(brewery);
  brandStatus.appendChild(area);

  if (!brand.flavor) {
    const unknown = document.createElement("p");
    unknown.textContent = "この おさけの あじは まだ しられていない";
    unknown.className = "unknown";
    brandStatus.appendChild(unknown);
    return;
  }

  flavorLabels.forEach((label, idx) => {
    const row = document.createElement("div");
    row.className = "bar-row";
    const name = document.createElement("div");
    name.textContent = label;
    const bar = document.createElement("div");
    bar.className = "bar";
    const fill = document.createElement("div");
    fill.className = "bar-fill";
    const value = brand.flavor[`f${idx + 1}`];
    fill.style.width = `${Math.round(value * 100)}%`;
    bar.appendChild(fill);
    row.appendChild(name);
    row.appendChild(bar);
    brandStatus.appendChild(row);
    const numeric = document.createElement("div");
    numeric.className = "bar-value";
    numeric.textContent = `${Math.round(value * 100)}/100`;
    brandStatus.appendChild(numeric);
  });
}

function renderSimilarList(similarItems) {
  similarList.innerHTML = "";

  if (!state.selectedBrand) {
    return;
  }

  if (!state.selectedBrand.flavor) {
    const li = document.createElement("li");
    li.textContent = "まだ くらべられない";
    li.classList.add("unknown");
    similarList.appendChild(li);
    return;
  }

  if (similarItems.length === 0) {
    const li = document.createElement("li");
    li.textContent = "にている おさけが みつからない";
    li.classList.add("unknown");
    similarList.appendChild(li);
    return;
  }

  similarItems.forEach((item) => {
    const li = document.createElement("li");
    const label = document.createElement("div");
    label.textContent = item.brand.name;
    const stars = document.createElement("div");
    stars.className = "star";
    stars.textContent = "★".repeat(toStar(item.similarity));
    li.appendChild(label);
    li.appendChild(stars);
    li.addEventListener("click", () => {
      selectBrandById(item.brand.id);
    });
    similarList.appendChild(li);
  });
}

function toStar(similarity) {
  if (similarity <= 0) {
    return 1;
  }
  return Math.max(1, Math.min(5, Math.ceil(similarity * 5)));
}

function selectBrand(index) {
  state.selectedIndex = index;
  state.selectedBrand = state.searchResults[index];
  renderSearchList(state.searchResults);
  renderBrandStatus(state.selectedBrand);
  renderSimilarList(computeSimilarity(state.selectedBrand));
}

function selectBrandById(id) {
  const index = state.searchResults.findIndex((brand) => brand.id === id);
  if (index >= 0) {
    selectBrand(index);
    return;
  }
  const brand = state.brands.find((item) => item.id === id);
  if (brand) {
    searchInput.value = brand.name;
    state.searchResults = searchBrands(brand.name);
    state.selectedIndex = 0;
    state.selectedBrand = state.searchResults[0] || brand;
    renderSearchList(state.searchResults);
    renderBrandStatus(state.selectedBrand);
    renderSimilarList(computeSimilarity(state.selectedBrand));
  }
}

function updateSearch() {
  state.searchResults = searchBrands(searchInput.value);
  state.selectedIndex = 0;
  renderSearchList(state.searchResults);
  if (state.searchResults.length > 0) {
    state.selectedBrand = state.searchResults[0];
    renderBrandStatus(state.selectedBrand);
    renderSimilarList(computeSimilarity(state.selectedBrand));
  } else {
    state.selectedBrand = null;
    renderBrandStatus(null);
    similarList.innerHTML = "";
  }
}

function handleKeydown(event) {
  if (!state.searchResults.length) {
    return;
  }
  if (event.key === "ArrowDown") {
    event.preventDefault();
    state.selectedIndex =
      (state.selectedIndex + 1) % state.searchResults.length;
    renderSearchList(state.searchResults);
  }
  if (event.key === "ArrowUp") {
    event.preventDefault();
    state.selectedIndex =
      (state.selectedIndex - 1 + state.searchResults.length) %
      state.searchResults.length;
    renderSearchList(state.searchResults);
  }
  if (event.key === "Enter") {
    event.preventDefault();
    selectBrand(state.selectedIndex);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadData().then((brands) => {
    state.brands = brands;
    updateSearch();
  });

  searchInput.addEventListener("input", updateSearch);
  searchInput.addEventListener("keydown", handleKeydown);
});
