// 経路情報
let routeList = [];
let currentIndex = null;
let passedRoutes = [];

const gridElement = document.getElementById("grid");
const currentRouteText = document.getElementById("currentRouteText");
const historyText = document.getElementById("historyText");
const resetBtn = document.getElementById("resetBtn");
const rowsInput = document.getElementById("rowsInput");
const colsInput = document.getElementById("colsInput");
const routeCountInput = document.getElementById("routeCountInput");
const applyBtn = document.getElementById("applyBtn");

function createRouteList() {
  const rows = Math.max(1, Number(rowsInput.value) || 1);
  const cols = Math.max(1, Number(colsInput.value) || 1);
  const requestedCount = Math.max(1, Number(routeCountInput.value) || 1);

  const maxCells = rows * cols;
  const actualCount = Math.min(requestedCount, maxCells);

  // 入力値を正規化して UI に反映
  rowsInput.value = rows;
  colsInput.value = cols;
  routeCountInput.value = actualCount;

  routeList = Array.from({ length: actualCount }, (_, index) => index + 1);

  // CSS変数で列数を渡して可変グリッドにする
  gridElement.style.setProperty("--grid-columns", String(cols));
  gridElement.dataset.rows = String(rows);
  gridElement.dataset.cols = String(cols);
}

function renderGrid() {
  gridElement.innerHTML = "";
  const rows = Number(gridElement.dataset.rows);
  const cols = Number(gridElement.dataset.cols);
  const totalCells = rows * cols;

  for (let cellIndex = 0; cellIndex < totalCells; cellIndex += 1) {
    const cell = document.createElement("button");
    cell.type = "button";
    cell.className = "route-cell";

    // routeList に収まるマスだけ使用可能
    if (cellIndex < routeList.length) {
      const routeNumber = routeList[cellIndex];
      cell.textContent = routeNumber;
      cell.setAttribute("aria-label", `経路 ${routeNumber}`);

      if (passedRoutes.includes(routeNumber)) {
        cell.classList.add("passed");
      }

      if (cellIndex === currentIndex) {
        cell.classList.add("current");
      }

      cell.addEventListener("click", () => {
        currentIndex = cellIndex;
        passedRoutes.push(routeNumber);
        render();
      });
    } else {
      cell.textContent = "×";
      cell.classList.add("disabled");
      cell.disabled = true;
      cell.setAttribute("aria-label", "使用不可マス");
    }

    gridElement.appendChild(cell);
  }
}

function renderTextInfo() {
  if (currentIndex === null) {
    currentRouteText.textContent = "未選択（初期地点をタップしてください）";
    historyText.textContent = "まだ通過履歴はありません";
    return;
  }

  const currentRouteNumber = routeList[currentIndex];
  currentRouteText.textContent = `現在の経路番号: ${currentRouteNumber}`;

  const historyLines = passedRoutes.map(
    (routeNumber, index) => `route[${index}] = ${routeNumber}`
  );
  historyText.textContent = historyLines.join("\n");
}

function render() {
  renderGrid();
  renderTextInfo();
}

function applyGridConfig() {
  createRouteList();
  currentIndex = null;
  passedRoutes = [];
  render();
}

applyBtn.addEventListener("click", applyGridConfig);

resetBtn.addEventListener("click", () => {
  currentIndex = null;
  passedRoutes = [];
  render();
});

// 初期描画
applyGridConfig();
