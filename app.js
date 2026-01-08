const FLAVOR_LABELS = ["華やか", "芳醇", "重厚", "穏やか", "ドライ", "軽快"];

const fallbackData = {
  areas: [
    { id: 1, name: "北海道" },
    { id: 2, name: "青森" },
    { id: 3, name: "岩手" },
    { id: 4, name: "宮城" },
    { id: 5, name: "秋田" },
    { id: 6, name: "山形" },
    { id: 7, name: "福島" },
    { id: 8, name: "新潟" },
    { id: 9, name: "長野" },
    { id: 10, name: "兵庫" }
  ],
  breweries: [
    { id: 1, name: "雪乃蔵", areaId: 1 },
    { id: 2, name: "北灯酒造", areaId: 1 },
    { id: 3, name: "津軽泉酒造", areaId: 2 },
    { id: 4, name: "南部月花", areaId: 3 },
    { id: 5, name: "杜乃里醸造", areaId: 4 },
    { id: 6, name: "秋響酒造", areaId: 5 },
    { id: 7, name: "羽雲蔵", areaId: 6 },
    { id: 8, name: "磐梯水源酒造", areaId: 7 },
    { id: 9, name: "越乃瀧蔵", areaId: 8 },
    { id: 10, name: "信濃青嶺", areaId: 9 },
    { id: 11, name: "播磨白鶴", areaId: 10 }
  ],
  brands: [
    { id: 1, name: "山霞", breweryId: 1 },
    { id: 2, name: "月灯", breweryId: 1 },
    { id: 3, name: "白鶴香", breweryId: 11 },
    { id: 4, name: "北の雫", breweryId: 2 },
    { id: 5, name: "星海", breweryId: 2 },
    { id: 6, name: "津軽舞", breweryId: 3 },
    { id: 7, name: "薄紅", breweryId: 3 },
    { id: 8, name: "南部雪華", breweryId: 4 },
    { id: 9, name: "銀影", breweryId: 4 },
    { id: 10, name: "杜の語り", breweryId: 5 },
    { id: 11, name: "朝風", breweryId: 5 },
    { id: 12, name: "秋響", breweryId: 6 },
    { id: 13, name: "千穂", breweryId: 6 },
    { id: 14, name: "羽雲", breweryId: 7 },
    { id: 15, name: "霞凪", breweryId: 7 },
    { id: 16, name: "磐梯峰", breweryId: 8 },
    { id: 17, name: "水鏡", breweryId: 8 },
    { id: 18, name: "越乃嶺", breweryId: 9 },
    { id: 19, name: "霜夜", breweryId: 9 },
    { id: 20, name: "信濃青", breweryId: 10 },
    { id: 21, name: "白峰", breweryId: 10 },
    { id: 22, name: "播磨の風", breweryId: 11 },
    { id: 23, name: "月光", breweryId: 1 },
    { id: 24, name: "霧氷", breweryId: 2 },
    { id: 25, name: "青凪", breweryId: 5 },
    { id: 26, name: "灯里", breweryId: 6 },
    { id: 27, name: "淡雪", breweryId: 7 },
    { id: 28, name: "海翠", breweryId: 9 },
    { id: 29, name: "岳水", breweryId: 10 },
    { id: 30, name: "宵響", breweryId: 11 }
  ],
  flavorCharts: [
    { brandId: 1, f1: 0.78, f2: 0.64, f3: 0.32, f4: 0.58, f5: 0.22, f6: 0.71 },
    { brandId: 2, f1: 0.62, f2: 0.51, f3: 0.44, f4: 0.68, f5: 0.35, f6: 0.55 },
    { brandId: 3, f1: 0.41, f2: 0.77, f3: 0.69, f4: 0.38, f5: 0.46, f6: 0.33 },
    { brandId: 4, f1: 0.71, f2: 0.42, f3: 0.29, f4: 0.62, f5: 0.27, f6: 0.74 },
    { brandId: 5, f1: 0.55, f2: 0.48, f3: 0.51, f4: 0.44, f5: 0.59, f6: 0.41 },
    { brandId: 6, f1: 0.36, f2: 0.62, f3: 0.58, f4: 0.33, f5: 0.64, f6: 0.29 },
    { brandId: 7, f1: 0.66, f2: 0.57, f3: 0.31, f4: 0.72, f5: 0.24, f6: 0.63 },
    { brandId: 8, f1: 0.52, f2: 0.69, f3: 0.73, f4: 0.41, f5: 0.48, f6: 0.36 },
    { brandId: 9, f1: 0.47, f2: 0.58, f3: 0.67, f4: 0.39, f5: 0.53, f6: 0.34 },
    { brandId: 10, f1: 0.73, f2: 0.66, f3: 0.42, f4: 0.61, f5: 0.31, f6: 0.68 },
    { brandId: 11, f1: 0.59, f2: 0.46, f3: 0.37, f4: 0.74, f5: 0.29, f6: 0.57 },
    { brandId: 12, f1: 0.38, f2: 0.71, f3: 0.81, f4: 0.28, f5: 0.61, f6: 0.22 },
    { brandId: 13, f1: 0.44, f2: 0.53, f3: 0.61, f4: 0.36, f5: 0.52, f6: 0.31 },
    { brandId: 14, f1: 0.69, f2: 0.47, f3: 0.28, f4: 0.77, f5: 0.25, f6: 0.66 },
    { brandId: 15, f1: 0.61, f2: 0.52, f3: 0.45, f4: 0.55, f5: 0.36, f6: 0.49 },
    { brandId: 16, f1: 0.33, f2: 0.67, f3: 0.74, f4: 0.31, f5: 0.62, f6: 0.27 },
    { brandId: 17, f1: 0.58, f2: 0.49, f3: 0.39, f4: 0.63, f5: 0.33, f6: 0.52 },
    { brandId: 18, f1: 0.76, f2: 0.55, f3: 0.34, f4: 0.69, f5: 0.21, f6: 0.72 },
    { brandId: 19, f1: 0.49, f2: 0.62, f3: 0.57, f4: 0.46, f5: 0.47, f6: 0.38 },
    { brandId: 20, f1: 0.67, f2: 0.44, f3: 0.36, f4: 0.71, f5: 0.28, f6: 0.64 },
    { brandId: 21, f1: 0.54, f2: 0.59, f3: 0.48, f4: 0.52, f5: 0.41, f6: 0.45 },
    { brandId: 22, f1: 0.42, f2: 0.73, f3: 0.66, f4: 0.35, f5: 0.55, f6: 0.30 }
  ]
};

let appState = {
  brands: [],
  brandIndex: [],
  breweriesById: new Map(),
  areasById: new Map(),
  flavorsByBrandId: new Map(),
  activeBrandId: null,
  activeResultIndex: -1
};

const resultsEl = document.getElementById("results");
const detailEl = document.getElementById("detail");
const searchInput = document.getElementById("searchInput");

async function loadData() {
  const dataProvider = {
    async getJson(path, fallbackKey) {
      try {
        const response = await fetch(path);
        if (!response.ok) throw new Error("Network response was not ok");
        return await response.json();
      } catch (error) {
        console.warn(`fetch失敗: ${path}`, error);
        return { [fallbackKey]: fallbackData[fallbackKey] };
      }
    }
  };

  const [brandsRes, breweriesRes, areasRes, flavorsRes] = await Promise.all([
    dataProvider.getJson("brands.json", "brands"),
    dataProvider.getJson("breweries.json", "breweries"),
    dataProvider.getJson("areas.json", "areas"),
    dataProvider.getJson("flavor-charts.json", "flavorCharts")
  ]);

  return {
    brands: brandsRes.brands || [],
    breweries: breweriesRes.breweries || [],
    areas: areasRes.areas || [],
    flavorCharts: flavorsRes.flavorCharts || []
  };
}

function buildIndex(data) {
  appState.brands = data.brands;
  appState.breweriesById = new Map(data.breweries.map((brewery) => [brewery.id, brewery]));
  appState.areasById = new Map(data.areas.map((area) => [area.id, area]));
  appState.flavorsByBrandId = new Map(
    data.flavorCharts.map((chart) => [chart.brandId, chart])
  );

  appState.brandIndex = data.brands.map((brand) => {
    const brewery = appState.breweriesById.get(brand.breweryId);
    const area = brewery ? appState.areasById.get(brewery.areaId) : null;
    const searchText = normalizeText(`${brand.name} ${brewery?.name ?? ""} ${area?.name ?? ""}`);

    return {
      ...brand,
      breweryName: brewery?.name ?? "不明",
      areaName: area?.name ?? "不明",
      searchText
    };
  });
}

function normalizeText(text) {
  const noSpaces = text.replace(/\s+/g, "");
  const normalized = noSpaces.normalize("NFKC").toLowerCase();
  return toKatakana(normalized);
}

function toKatakana(text) {
  return Array.from(text)
    .map((char) => {
      const code = char.charCodeAt(0);
      if (code >= 0x3041 && code <= 0x3096) {
        return String.fromCharCode(code + 0x60);
      }
      return char;
    })
    .join("");
}

function bigrams(text) {
  const grams = [];
  for (let i = 0; i < text.length - 1; i += 1) {
    grams.push(text.slice(i, i + 2));
  }
  return grams;
}

function scoreBrand(brand, query) {
  if (!query) return 0;
  let score = 0;
  if (brand.searchText.startsWith(query)) {
    score += 1000;
  } else if (brand.searchText.includes(query)) {
    score += 500;
  }

  const grams = bigrams(query);
  let gramHits = 0;
  grams.forEach((gram) => {
    if (brand.searchText.includes(gram)) gramHits += 1;
  });
  score += gramHits * 10;

  return score;
}

function searchBrands(query) {
  const normalizedQuery = normalizeText(query);
  const withScores = appState.brandIndex
    .map((brand) => ({
      ...brand,
      score: scoreBrand(brand, normalizedQuery)
    }))
    .filter((brand) => normalizedQuery.length === 0 || brand.score > 0);

  withScores.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name, "ja"));
  return withScores.slice(0, 10);
}

function renderSearchResults(results) {
  resultsEl.innerHTML = "";
  appState.activeResultIndex = -1;

  if (results.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty-state";
    empty.textContent = "該当する銘柄が見つかりません。";
    resultsEl.appendChild(empty);
    return;
  }

  results.forEach((brand, index) => {
    const item = document.createElement("li");
    item.className = "result-item";
    item.tabIndex = 0;
    item.dataset.brandId = String(brand.id);
    item.dataset.index = String(index);

    const title = document.createElement("div");
    title.className = "result-title";
    title.textContent = brand.name;

    const meta = document.createElement("div");
    meta.className = "result-meta";
    meta.textContent = `${brand.breweryName} / ${brand.areaName}`;

    item.appendChild(title);
    item.appendChild(meta);

    item.addEventListener("click", () => selectBrand(brand.id));
    item.addEventListener("keydown", (event) => {
      if (event.key === "Enter") selectBrand(brand.id);
    });

    resultsEl.appendChild(item);
  });
}

function renderBrandDetail(brandId) {
  const brand = appState.brandIndex.find((item) => item.id === brandId);
  if (!brand) return;

  appState.activeBrandId = brandId;
  detailEl.innerHTML = "";

  const header = document.createElement("div");
  header.className = "detail-header";
  header.innerHTML = `<h3>${brand.name}</h3>`;

  const meta = document.createElement("div");
  meta.className = "detail-meta";
  meta.textContent = `${brand.breweryName} / ${brand.areaName}`;

  const flavorData = appState.flavorsByBrandId.get(brandId);

  detailEl.appendChild(header);
  detailEl.appendChild(meta);

  if (flavorData) {
    const chartWrapper = document.createElement("div");
    chartWrapper.className = "radar-wrapper";
    chartWrapper.appendChild(createRadarChart(flavorData));
    detailEl.appendChild(chartWrapper);
  } else {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "味データなし";
    detailEl.appendChild(empty);
  }

  const similarTitle = document.createElement("h4");
  similarTitle.textContent = "味が近い銘柄 Top10";
  detailEl.appendChild(similarTitle);

  const similarList = document.createElement("ul");
  similarList.className = "similar-list";
  const similarBrands = computeSimilarBrands(brandId);

  if (similarBrands.length === 0) {
    const emptySimilar = document.createElement("li");
    emptySimilar.className = "empty-state";
    emptySimilar.textContent = "味データがないため類似銘柄は表示できません。";
    similarList.appendChild(emptySimilar);
  } else {
    similarBrands.forEach((item) => {
      const li = document.createElement("li");
      li.className = "similar-item";
      li.tabIndex = 0;
      li.innerHTML = `<span>${item.name}</span><strong>${item.score.toFixed(3)}</strong>`;
      li.addEventListener("click", () => selectBrand(item.id));
      li.addEventListener("keydown", (event) => {
        if (event.key === "Enter") selectBrand(item.id);
      });
      similarList.appendChild(li);
    });
  }

  detailEl.appendChild(similarList);
}

function createRadarChart(flavorData) {
  const size = 240;
  const center = size / 2;
  const radius = 90;
  const angles = FLAVOR_LABELS.map((_, index) => (Math.PI * 2 * index) / FLAVOR_LABELS.length);

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", size);
  svg.setAttribute("height", size);
  svg.setAttribute("viewBox", `0 0 ${size} ${size}`);

  const grid = document.createElementNS("http://www.w3.org/2000/svg", "g");
  grid.setAttribute("stroke", "#dfe3ee");
  grid.setAttribute("fill", "none");

  [0.33, 0.66, 1].forEach((ratio) => {
    const points = angles
      .map((angle) => {
        const x = center + Math.cos(angle - Math.PI / 2) * radius * ratio;
        const y = center + Math.sin(angle - Math.PI / 2) * radius * ratio;
        return `${x},${y}`;
      })
      .join(" ");

    const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    polygon.setAttribute("points", points);
    grid.appendChild(polygon);
  });

  angles.forEach((angle) => {
    const x = center + Math.cos(angle - Math.PI / 2) * radius;
    const y = center + Math.sin(angle - Math.PI / 2) * radius;
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", center);
    line.setAttribute("y1", center);
    line.setAttribute("x2", x);
    line.setAttribute("y2", y);
    grid.appendChild(line);
  });

  const values = [flavorData.f1, flavorData.f2, flavorData.f3, flavorData.f4, flavorData.f5, flavorData.f6];
  const polygonPoints = values
    .map((value, index) => {
      const angle = angles[index];
      const x = center + Math.cos(angle - Math.PI / 2) * radius * value;
      const y = center + Math.sin(angle - Math.PI / 2) * radius * value;
      return `${x},${y}`;
    })
    .join(" ");

  const shape = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
  shape.setAttribute("points", polygonPoints);
  shape.setAttribute("fill", "rgba(58, 110, 165, 0.35)");
  shape.setAttribute("stroke", "#3a6ea5");
  shape.setAttribute("stroke-width", "2");

  const labelGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
  labelGroup.setAttribute("fill", "#333");
  labelGroup.setAttribute("font-size", "11");

  angles.forEach((angle, index) => {
    const labelRadius = radius + 18;
    const x = center + Math.cos(angle - Math.PI / 2) * labelRadius;
    const y = center + Math.sin(angle - Math.PI / 2) * labelRadius;
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", x);
    text.setAttribute("y", y);
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("dominant-baseline", "middle");
    text.textContent = FLAVOR_LABELS[index];
    labelGroup.appendChild(text);
  });

  svg.appendChild(grid);
  svg.appendChild(shape);
  svg.appendChild(labelGroup);

  return svg;
}

function computeSimilarBrands(brandId) {
  const target = appState.flavorsByBrandId.get(brandId);
  if (!target) return [];

  const targetVector = [target.f1, target.f2, target.f3, target.f4, target.f5, target.f6];
  const targetNorm = Math.hypot(...targetVector);

  return appState.brands
    .filter((brand) => brand.id !== brandId)
    .map((brand) => {
      const flavor = appState.flavorsByBrandId.get(brand.id);
      if (!flavor) return null;
      const vector = [flavor.f1, flavor.f2, flavor.f3, flavor.f4, flavor.f5, flavor.f6];
      const dot = targetVector.reduce((sum, value, index) => sum + value * vector[index], 0);
      const norm = Math.hypot(...vector);
      const score = norm && targetNorm ? dot / (norm * targetNorm) : 0;
      const indexed = appState.brandIndex.find((item) => item.id === brand.id);
      return {
        id: brand.id,
        name: indexed?.name ?? brand.name,
        score
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
}

function selectBrand(brandId) {
  renderBrandDetail(brandId);
}

function handleSearch() {
  const query = searchInput.value.trim();
  const results = searchBrands(query);
  renderSearchResults(results);
}

function handleKeyNavigation(event) {
  const items = Array.from(resultsEl.querySelectorAll(".result-item"));
  if (items.length === 0) return;

  if (event.key === "ArrowDown") {
    event.preventDefault();
    appState.activeResultIndex = Math.min(appState.activeResultIndex + 1, items.length - 1);
    items[appState.activeResultIndex].focus();
  }

  if (event.key === "ArrowUp") {
    event.preventDefault();
    appState.activeResultIndex = Math.max(appState.activeResultIndex - 1, 0);
    items[appState.activeResultIndex].focus();
  }
}

async function init() {
  const data = await loadData();
  buildIndex(data);
  renderSearchResults(searchBrands(""));
}

searchInput.addEventListener("input", handleSearch);
searchInput.addEventListener("keydown", handleKeyNavigation);

init();
