// 4x5 グリッドに置く経路番号 (1〜20)
const routeList = Array.from({ length: 20 }, (_, index) => index + 1);

// 現在位置の配列インデックス
let currentIndex = 0;

// 通過済みの経路番号を保持する配列
let passedRoutes = [];

const gridElement = document.getElementById("grid");
const currentRouteText = document.getElementById("currentRouteText");
const historyText = document.getElementById("historyText");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const resetBtn = document.getElementById("resetBtn");

function syncPassedRoutes() {
  // currentIndex より前を「通過済み」として扱う
  passedRoutes = routeList.slice(0, currentIndex);
}

function renderGrid() {
  gridElement.innerHTML = "";

  routeList.forEach((routeNumber, index) => {
    const cell = document.createElement("div");
    cell.className = "route-cell";
    cell.textContent = routeNumber;

    if (index < currentIndex) {
      cell.classList.add("passed");
    }

    if (index === currentIndex) {
      cell.classList.add("current");
    }

    gridElement.appendChild(cell);
  });
}

function renderTextInfo() {
  const currentRouteNumber = routeList[currentIndex];
  currentRouteText.textContent = `現在の経路番号: ${currentRouteNumber}`;

  if (passedRoutes.length === 0) {
    historyText.textContent = "まだ通過履歴はありません";
    return;
  }

  const historyLines = passedRoutes.map(
    (routeNumber, index) => `route[${index}] = ${routeNumber}`
  );
  historyText.textContent = historyLines.join("\n");
}

function updateButtons() {
  prevBtn.disabled = currentIndex === 0;
  nextBtn.disabled = currentIndex === routeList.length - 1;
}

function render() {
  syncPassedRoutes();
  renderGrid();
  renderTextInfo();
  updateButtons();
}

nextBtn.addEventListener("click", () => {
  if (currentIndex < routeList.length - 1) {
    currentIndex += 1;
    render();
  }
});

prevBtn.addEventListener("click", () => {
  if (currentIndex > 0) {
    currentIndex -= 1;
    render();
  }
});

resetBtn.addEventListener("click", () => {
  currentIndex = 0;
  passedRoutes = [];
  render();
});

// 初期描画
render();
