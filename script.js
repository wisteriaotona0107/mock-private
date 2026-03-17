// 4x5 グリッドに置く経路番号 (1〜20)
const routeList = Array.from({ length: 20 }, (_, index) => index + 1);

// 初期状態では未選択なので null
let currentIndex = null;

// 通過履歴を配列として保持する
let passedRoutes = [];

const gridElement = document.getElementById("grid");
const currentRouteText = document.getElementById("currentRouteText");
const historyText = document.getElementById("historyText");
const resetBtn = document.getElementById("resetBtn");

function renderGrid() {
  gridElement.innerHTML = "";

  routeList.forEach((routeNumber, index) => {
    const cell = document.createElement("button");
    cell.type = "button";
    cell.className = "route-cell";
    cell.textContent = routeNumber;
    cell.setAttribute("aria-label", `経路 ${routeNumber}`);

    if (passedRoutes.includes(routeNumber)) {
      cell.classList.add("passed");
    }

    if (index === currentIndex) {
      cell.classList.add("current");
    }

    // マスのタップで現在位置を移動
    cell.addEventListener("click", () => {
      currentIndex = index;
      passedRoutes.push(routeNumber);
      render();
    });

    gridElement.appendChild(cell);
  });
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

resetBtn.addEventListener("click", () => {
  currentIndex = null;
  passedRoutes = [];
  render();
});

// 初期描画
render();
