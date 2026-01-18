const state = {
  screen: "title",
  nowMinutes: 18 * 60,
  endMinutes: 24 * 60,
  running: false,
  customers: [],
  orders: [],
  sales: [],
  logs: [],
  stats: {
    revenue: 0,
    cost: 0,
    profit: 0,
    totalDepartures: 0,
    satisfactionSum: 0,
    satisfactionCount: 0,
  },
  clock: {
    lastTick: 0,
    intervalId: null,
  },
  ui: {
    error: null,
    modalOrderId: null,
    settingsCollapsed: true,
    scrollPositions: {
      customers: 0,
      orders: 0,
      logs: 0,
    },
  },
};

const config = {
  seatCount: 12,
  arrivalIntervalMinutes: 8,
  orderDelayMinutes: 5,
  drinkDurationMinutes: 18,
  toleranceMinutes: 6,
  penaltyPerMinute: 2,
  minutesPerSecond: 1,
  closingHour: 24,
  stockMultiplier: 1,
};

const master = {
  names: [
    "秋山", "桜井", "平田", "石田", "高橋", "斉藤", "三浦", "安藤", "中村", "伊藤",
    "佐々木", "福田", "山本", "清水", "森", "山田", "田中", "松本", "岡田", "橋本",
    "谷口", "上田", "林", "小林", "藤田",
  ],
  menu: [
    { id: "beer", name: "生ビール", price: 680, cost: 240, serveSeconds: 5, stock: 20 },
    { id: "highball", name: "ハイボール", price: 620, cost: 210, serveSeconds: 4, stock: 18 },
    { id: "lemon", name: "レモンサワー", price: 600, cost: 200, serveSeconds: 4, stock: 16 },
    { id: "sake", name: "日本酒", price: 720, cost: 260, serveSeconds: 6, stock: 12 },
    { id: "shochu", name: "焼酎", price: 650, cost: 220, serveSeconds: 5, stock: 14 },
    { id: "wine", name: "グラスワイン", price: 780, cost: 300, serveSeconds: 6, stock: 10 },
    { id: "cocktail", name: "カクテル", price: 800, cost: 320, serveSeconds: 7, stock: 8 },
    { id: "nonalcohol", name: "ノンアル", price: 520, cost: 160, serveSeconds: 3, stock: 20 },
  ],
};

const actions = {
  startGame() {
    if (state.running) {
      showError("営業中は再度開店できません。");
      return;
    }
    state.screen = "game";
    state.running = true;
    state.nowMinutes = 18 * 60;
    state.endMinutes = config.closingHour * 60;
    state.customers = [];
    state.orders = [];
    state.sales = [];
    state.logs = [];
    state.stats = {
      revenue: 0,
      cost: 0,
      profit: 0,
      totalDepartures: 0,
      satisfactionSum: 0,
      satisfactionCount: 0,
    };
    master.menu.forEach((item) => {
      item.stock = Math.max(0, Math.round(item.stock * config.stockMultiplier));
    });
    logEvent("開店しました。");
    startClock();
    render();
  },

  openModal(orderId) {
    state.ui.modalOrderId = orderId;
    renderModal();
  },

  closeModal() {
    state.ui.modalOrderId = null;
    renderModal();
  },

  toggleSettings() {
    state.ui.settingsCollapsed = !state.ui.settingsCollapsed;
    renderSettings();
  },

  updateSetting(key, value) {
    config[key] = value;
    if (key === "closingHour") {
      state.endMinutes = config.closingHour * 60;
    }
    logEvent(`設定変更: ${key}=${value}`);
    render();
  },

  provideOrder(orderId) {
    const order = state.orders.find((item) => item.id === orderId);
    if (!order || order.status !== "waiting") return;
    const menuItem = master.menu.find((item) => item.id === order.menuId);
    if (!menuItem || menuItem.stock <= 0) {
      order.status = "stockout";
      adjustSatisfaction(order.customerId, -10);
      order.alternatives = getAlternativeMenu(order.menuId);
      showError("在庫不足です。代替メニューを選択してください。");
      render();
      return;
    }
    menuItem.stock -= 1;
    order.status = "serving";
    order.servingUntil = state.nowMinutes + Math.ceil(menuItem.serveSeconds / 60);
    logEvent(`提供開始: ${order.customerName}に${menuItem.name}`);
    render();
  },

  serveAlternative(orderId, altMenuId) {
    const order = state.orders.find((item) => item.id === orderId);
    const menuItem = master.menu.find((item) => item.id === altMenuId);
    if (!order || !menuItem) return;
    if (menuItem.stock <= 0) {
      showError("代替メニューも在庫切れです。");
      return;
    }
    order.menuId = menuItem.id;
    order.menuName = menuItem.name;
    order.status = "serving";
    menuItem.stock -= 1;
    order.servingUntil = state.nowMinutes + Math.ceil(menuItem.serveSeconds / 60);
    logEvent(`代替提供: ${order.customerName}に${menuItem.name}`);
    render();
  },

  rejectOrder(orderId) {
    const order = state.orders.find((item) => item.id === orderId);
    if (!order) return;
    order.status = "rejected";
    adjustSatisfaction(order.customerId, -30);
    logEvent(`提供拒否: ${order.customerName}`);
    const customer = state.customers.find((c) => c.id === order.customerId);
    if (customer) {
      customer.status = "leaving";
      customer.leaveAt = state.nowMinutes + 2;
    }
    render();
  },

  finalizePayment(orderId) {
    const order = state.orders.find((item) => item.id === orderId);
    if (!order || order.status !== "readyToPay") return;
    order.status = "paid";
    order.paidAt = state.nowMinutes;
    logEvent(`会計完了: ${order.customerName}`);
    const customer = state.customers.find((c) => c.id === order.customerId);
    if (customer) {
      customer.status = "leaving";
      customer.leaveAt = state.nowMinutes + 1;
    }
    render();
  },

  restock(menuId, amount) {
    const item = master.menu.find((m) => m.id === menuId);
    if (!item) return;
    item.stock += amount;
    logEvent(`${item.name}を${amount}補充しました。`);
    render();
  },

  retryResult() {
    state.screen = "title";
    state.running = false;
    render();
  },
};

function startClock() {
  clearInterval(state.clock.intervalId);
  state.clock.intervalId = setInterval(tick, 1000);
}

function stopClock() {
  clearInterval(state.clock.intervalId);
  state.clock.intervalId = null;
}

function tick() {
  if (!state.running) return;
  state.nowMinutes += config.minutesPerSecond;

  if (state.nowMinutes >= state.endMinutes) {
    state.nowMinutes = state.endMinutes;
  }

  handleArrivals();
  handleOrders();
  handleServing();
  handlePayments();
  handleDepartures();

  if (state.nowMinutes >= state.endMinutes) {
    const activeCustomers = state.customers.filter((c) => c.status !== "left");
    if (activeCustomers.length === 0) {
      state.running = false;
      stopClock();
      goToResult();
    }
  }

  render();
}

function handleArrivals() {
  if (state.nowMinutes >= state.endMinutes) return;
  if (state.nowMinutes % config.arrivalIntervalMinutes !== 0) return;
  if (state.customers.filter((c) => c.status !== "left").length >= 50) return;

  const seat = findAvailableSeat();
  if (!seat) {
    logEvent("満席のため来店できませんでした。");
    return;
  }

  const customer = createCustomer(seat);
  state.customers.push(customer);
  logEvent(`${customer.name}が来店（席${customer.seat}）。`);
}

function handleOrders() {
  state.customers.forEach((customer) => {
    if (customer.status === "seated" && state.nowMinutes - customer.seatedAt >= config.orderDelayMinutes) {
      const menuItem = pickMenu();
      const order = {
        id: `order-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        customerId: customer.id,
        customerName: customer.name,
        seat: customer.seat,
        menuId: menuItem.id,
        menuName: menuItem.name,
        orderedAt: state.nowMinutes,
        status: "waiting",
        servingUntil: null,
        readyAt: null,
        paidAt: null,
        alternatives: [],
      };
      state.orders.push(order);
      customer.status = "ordered";
      logEvent(`${customer.name}の注文: ${menuItem.name}`);
    }
  });
}

function handleServing() {
  state.orders.forEach((order) => {
    if (order.status === "waiting") {
      const wait = state.nowMinutes - order.orderedAt;
      if (wait > config.toleranceMinutes) {
        const penalty = (wait - config.toleranceMinutes) * config.penaltyPerMinute;
        adjustSatisfaction(order.customerId, -penalty);
      }
    }
    if (order.status === "serving" && order.servingUntil <= state.nowMinutes) {
      order.status = "served";
      order.readyAt = state.nowMinutes;
      const menuItem = master.menu.find((item) => item.id === order.menuId);
      if (menuItem) {
        state.stats.revenue += menuItem.price;
        state.stats.cost += menuItem.cost;
        state.stats.profit = state.stats.revenue - state.stats.cost;
        const hourLabel = getHourLabel(state.nowMinutes);
        state.sales.push({ hourLabel, amount: menuItem.price });
      }
      logEvent(`提供完了: ${order.customerName}`);
      const customer = state.customers.find((c) => c.id === order.customerId);
      if (customer) {
        customer.status = "drinking";
        customer.drinkUntil = state.nowMinutes + config.drinkDurationMinutes;
      }
    }
  });
}

function handlePayments() {
  state.orders.forEach((order) => {
    if (order.status === "served") {
      const customer = state.customers.find((c) => c.id === order.customerId);
      if (customer && customer.status === "drinking" && customer.drinkUntil <= state.nowMinutes) {
        order.status = "readyToPay";
        logEvent(`会計待ち: ${order.customerName}`);
      }
    }
  });
}

function handleDepartures() {
  state.customers.forEach((customer) => {
    if (customer.status === "leaving" && customer.leaveAt <= state.nowMinutes) {
      customer.status = "left";
      state.stats.totalDepartures += 1;
      state.stats.satisfactionSum += customer.satisfaction;
      state.stats.satisfactionCount += 1;
      logEvent(`${customer.name}が退店しました。`);
    }
  });
}

function goToResult() {
  state.screen = "result";
  try {
    computeResult();
  } catch (error) {
    showError("集計に失敗しました。");
  }
  render();
}

function computeResult() {
  const operatingHours = (state.endMinutes - 18 * 60) / 60;
  state.stats.turnover = state.stats.totalDepartures / config.seatCount / operatingHours;
  state.stats.averageSatisfaction = state.stats.satisfactionCount
    ? state.stats.satisfactionSum / state.stats.satisfactionCount
    : 0;
}

function render() {
  const app = document.getElementById("app");
  const previousScroll = {
    customers: state.ui.scrollPositions.customers,
    orders: state.ui.scrollPositions.orders,
    logs: state.ui.scrollPositions.logs,
  };
  if (state.screen === "title") {
    app.innerHTML = renderTitle();
  } else if (state.screen === "game") {
    app.innerHTML = renderGame();
  } else if (state.screen === "result") {
    app.innerHTML = renderResult();
  }
  bindEvents();
  renderModal();
  if (state.screen === "game") {
    restoreScrollPositions(previousScroll);
  }
}

function renderTitle() {
  return `
    <div class="screen title-screen">
      <h1>酒場シミュレーター</h1>
      <p>1日限定の営業で、注文対応・在庫管理・満足度をコントロールしましょう。</p>
      <button id="start-button" class="primary" type="button">開店</button>
      <p class="badge">テストデータ内蔵 / SPAモック</p>
    </div>
  `;
}

function renderGame() {
  const currentTime = formatTime(state.nowMinutes);
  const remainingMinutes = Math.max(0, state.endMinutes - state.nowMinutes);
  const seatedCount = state.customers.filter((c) => c.status !== "left").length;
  const averageSatisfaction = state.stats.satisfactionCount
    ? Math.round(state.stats.satisfactionSum / state.stats.satisfactionCount)
    : 80;

  const customerList = state.customers
    .filter((c) => c.status !== "left")
    .map((c) => `
      <div class="card">
        <strong>席${c.seat} ${c.name}</strong>
        <div class="badge ${c.status === "leaving" ? "alert" : ""}">状態: ${statusLabel(c.status)}</div>
        <div>満足度: ${Math.round(c.satisfaction)}</div>
      </div>
    `)
    .join("") || `<div class="placeholder">来店待ちです。</div>`;

  const orders = state.orders
    .filter((o) => o.status !== "paid")
    .map((o) => {
      const elapsed = state.nowMinutes - o.orderedAt;
      const status = orderStatusLabel(o.status);
      const classes = ["card", "order-card", o.status === "serving" ? "serving" : "", o.status === "readyToPay" ? "done" : ""]
        .filter(Boolean)
        .join(" ");
      return `
        <div class="${classes}">
          <div><strong>${o.customerName}</strong> / 席${o.seat}</div>
          <div>注文: ${o.menuName}</div>
          <div>経過: ${elapsed}分</div>
          <div class="badge">状態: ${status}</div>
          <div style="margin-top:8px; display:flex; gap:6px; flex-wrap:wrap;">
            <button class="secondary" data-action="modal" data-id="${o.id}">詳細</button>
            <button class="primary" data-action="provide" data-id="${o.id}" ${o.status !== "waiting" ? "disabled" : ""}>提供</button>
            <button class="secondary" data-action="pay" data-id="${o.id}" ${o.status !== "readyToPay" ? "disabled" : ""}>会計</button>
          </div>
          ${o.status === "stockout" ? renderAlternatives(o) : ""}
        </div>
      `;
    })
    .join("") || `<div class="placeholder">注文はありません。</div>`;

  const menuRows = master.menu
    .map((m) => `
      <tr>
        <td>${m.name}</td>
        <td>${m.price}</td>
        <td>${m.cost}</td>
        <td>${m.serveSeconds}s</td>
        <td>${m.stock}</td>
        <td>
          <button class="secondary" data-action="restock" data-id="${m.id}" data-amount="1">+1</button>
          <button class="secondary" data-action="restock" data-id="${m.id}" data-amount="10">+10</button>
        </td>
      </tr>
    `)
    .join("");

  const logs = state.logs
    .slice(-50)
    .map((log) => `<li>${log}</li>`)
    .join("");

  return `
    <div class="screen">
      ${renderSettingsPanel()}
      <div class="header">
        <div class="header-item">現在時刻: <strong>${currentTime}</strong></div>
        <div class="header-item">残り時間: ${remainingMinutes}分</div>
        <div class="header-item">座席占有: ${seatedCount}/${config.seatCount}</div>
        <div class="header-item">売上: ${state.stats.revenue} / 利益: ${state.stats.profit}</div>
        <div class="header-item">平均満足度: ${averageSatisfaction}</div>
      </div>

      <div class="layout">
        <div>
          <h3>客一覧</h3>
          <div class="list" id="customer-list">${customerList}</div>
        </div>
        <div>
          <h3>注文キュー</h3>
          <div class="list" id="order-list">${orders}</div>
        </div>
        <div>
          <h3>メニュー一覧</h3>
          <table class="menu-table">
            <thead>
              <tr>
                <th>商品</th>
                <th>価格</th>
                <th>原価</th>
                <th>提供</th>
                <th>在庫</th>
                <th>補充</th>
              </tr>
            </thead>
            <tbody>
              ${menuRows}
            </tbody>
          </table>
        </div>
      </div>

      <div class="card" style="margin-top:16px;">
        <h3>イベントログ</h3>
        <ul class="log" id="event-log">${logs}</ul>
      </div>
    </div>
  `;
}

function renderResult() {
  const salesByHour = buildSalesByHour();
  const maxSales = Math.max(...salesByHour.map((item) => item.amount), 1);
  const summaryLogs = state.logs.slice(-10).map((log) => `<li>${log}</li>`).join("");

  return `
    <div class="screen">
      <h2>営業結果</h2>
      <div class="result-grid">
        <div class="card"><strong>総売上</strong><div>${state.stats.revenue}</div></div>
        <div class="card"><strong>総原価</strong><div>${state.stats.cost}</div></div>
        <div class="card"><strong>総利益</strong><div>${state.stats.profit}</div></div>
        <div class="card"><strong>回転率</strong><div>${state.stats.turnover?.toFixed(2) ?? 0}</div></div>
        <div class="card"><strong>平均満足度</strong><div>${Math.round(state.stats.averageSatisfaction ?? 0)}</div></div>
      </div>

      <div class="card">
        <h3>時間帯別売上</h3>
        <div class="bar-chart">
          ${salesByHour
            .map(
              (row) => `
              <div class="bar-row">
                <span>${row.label}</span>
                <div class="bar"><span style="width:${(row.amount / maxSales) * 100}%"></span></div>
                <span>${row.amount}</span>
              </div>
            `,
            )
            .join("")}
        </div>
      </div>

      <div class="card" style="margin-top:16px;">
        <h3>イベント概要</h3>
        <ul class="log">${summaryLogs}</ul>
      </div>

      <div style="margin-top:16px;">
        <button id="restart" class="primary" type="button">再プレイ</button>
      </div>
    </div>
  `;
}

function renderSettingsPanel() {
  return `
    <div class="settings-panel ${state.ui.settingsCollapsed ? "collapsed" : ""}">
      <div class="settings-toggle" id="settings-toggle">
        <strong>設定パネル</strong>
        <span>${state.ui.settingsCollapsed ? "▼" : "▲"}</span>
      </div>
      <div class="settings-body">
        <label>来店頻度(分)
          <input type="number" min="1" value="${config.arrivalIntervalMinutes}" data-setting="arrivalIntervalMinutes" />
        </label>
        <label>座席数
          <input type="number" min="1" value="${config.seatCount}" data-setting="seatCount" />
        </label>
        <label>許容待ち時間
          <input type="number" min="1" value="${config.toleranceMinutes}" data-setting="toleranceMinutes" />
        </label>
        <label>1秒=分
          <input type="number" min="1" value="${config.minutesPerSecond}" data-setting="minutesPerSecond" />
        </label>
        <label>閉店時刻
          <input type="number" min="19" max="26" value="${config.closingHour}" data-setting="closingHour" />
        </label>
        <label>初期在庫倍率
          <input type="number" min="0" step="0.1" value="${config.stockMultiplier}" data-setting="stockMultiplier" />
        </label>
      </div>
    </div>
  `;
}

function renderModal() {
  const modal = document.getElementById("modal");
  const body = document.getElementById("modal-body");
  const title = document.getElementById("modal-title");
  const provideBtn = document.getElementById("modal-provide");
  if (!modal || !body || !title || !provideBtn) return;
  if (!state.ui.modalOrderId) {
    modal.classList.add("hidden");
    modal.setAttribute("aria-hidden", "true");
    return;
  }
  const order = state.orders.find((o) => o.id === state.ui.modalOrderId);
  if (!order) {
    state.ui.modalOrderId = null;
    modal.classList.add("hidden");
    return;
  }
  title.textContent = `注文詳細 - ${order.customerName}`;
  const waitTime = state.nowMinutes - order.orderedAt;
  const menuItem = master.menu.find((m) => m.id === order.menuId);
  body.innerHTML = `
    <div>席番号: ${order.seat}</div>
    <div>注文: ${order.menuName}</div>
    <div>提供所要時間: ${menuItem?.serveSeconds ?? "-"}秒</div>
    <div>待ち時間: ${waitTime}分</div>
    <div>遅延: ${waitTime > config.toleranceMinutes ? "あり" : "なし"}</div>
    ${order.status === "stockout" ? `<div class="badge alert">在庫不足</div>` : ""}
    ${order.status === "stockout" ? renderAlternatives(order) : ""}
  `;
  provideBtn.disabled = order.status !== "waiting";
  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");
}

function renderAlternatives(order) {
  if (!order.alternatives || order.alternatives.length === 0) {
    return `<div class="badge alert">代替メニューなし</div>`;
  }
  return `
    <div style="margin-top:8px;">
      <div class="badge alert">代替提案</div>
      <div style="display:flex; flex-wrap:wrap; gap:6px; margin-top:6px;">
        ${order.alternatives
          .map(
            (alt) => `<button class="secondary" data-action="alternative" data-id="${order.id}" data-alt="${alt.id}">${alt.name}</button>`,
          )
          .join("")}
        <button class="secondary" data-action="reject" data-id="${order.id}">提供を断る</button>
      </div>
    </div>
  `;
}

function renderSettings() {
  const panel = document.querySelector(".settings-panel");
  if (!panel) return;
  panel.outerHTML = renderSettingsPanel();
  bindSettings();
}

function bindEvents() {
  const startButton = document.getElementById("start-button");
  if (startButton) {
    startButton.addEventListener("click", actions.startGame);
  }
  const restartButton = document.getElementById("restart");
  if (restartButton) {
    restartButton.addEventListener("click", actions.retryResult);
  }
  bindSettings();

  document.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", (event) => {
      const action = event.currentTarget.dataset.action;
      const id = event.currentTarget.dataset.id;
      if (action === "provide") actions.provideOrder(id);
      if (action === "pay") actions.finalizePayment(id);
      if (action === "modal") actions.openModal(id);
      if (action === "alternative") actions.serveAlternative(id, event.currentTarget.dataset.alt);
      if (action === "reject") actions.rejectOrder(id);
      if (action === "restock") actions.restock(id, Number(event.currentTarget.dataset.amount));
    });
  });

  const modalClose = document.getElementById("modal-close");
  const modalCancel = document.getElementById("modal-cancel");
  const modalProvide = document.getElementById("modal-provide");
  if (modalClose) modalClose.onclick = actions.closeModal;
  if (modalCancel) modalCancel.onclick = actions.closeModal;
  if (modalProvide) {
    modalProvide.onclick = () => {
      actions.provideOrder(state.ui.modalOrderId);
      actions.closeModal();
    };
  }

  const dismiss = document.getElementById("error-dismiss");
  if (dismiss) dismiss.onclick = clearError;

  const customerList = document.getElementById("customer-list");
  const orderList = document.getElementById("order-list");
  const eventLog = document.getElementById("event-log");
  if (customerList) {
    customerList.addEventListener("scroll", () => {
      state.ui.scrollPositions.customers = customerList.scrollTop;
    });
  }
  if (orderList) {
    orderList.addEventListener("scroll", () => {
      state.ui.scrollPositions.orders = orderList.scrollTop;
    });
  }
  if (eventLog) {
    eventLog.addEventListener("scroll", () => {
      state.ui.scrollPositions.logs = eventLog.scrollTop;
    });
  }
}

function bindSettings() {
  const toggle = document.getElementById("settings-toggle");
  if (toggle) toggle.onclick = actions.toggleSettings;

  document.querySelectorAll("[data-setting]").forEach((input) => {
    input.addEventListener("change", (event) => {
      const key = event.currentTarget.dataset.setting;
      const value = Number(event.currentTarget.value);
      actions.updateSetting(key, value);
    });
  });
}

function findAvailableSeat() {
  const occupied = new Set(state.customers.filter((c) => c.status !== "left").map((c) => c.seat));
  for (let i = 1; i <= config.seatCount; i += 1) {
    if (!occupied.has(i)) return i;
  }
  return null;
}

function createCustomer(seat) {
  const name = master.names[Math.floor(Math.random() * master.names.length)];
  return {
    id: `cust-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name,
    seat,
    status: "seated",
    seatedAt: state.nowMinutes,
    drinkUntil: null,
    leaveAt: null,
    satisfaction: 80,
  };
}

function pickMenu() {
  const available = master.menu.filter((m) => m.stock > 0);
  if (available.length === 0) {
    return master.menu[Math.floor(Math.random() * master.menu.length)];
  }
  return available[Math.floor(Math.random() * available.length)];
}

function getAlternativeMenu(currentId) {
  return master.menu.filter((m) => m.id !== currentId).slice(0, 3);
}

function adjustSatisfaction(customerId, delta) {
  const customer = state.customers.find((c) => c.id === customerId);
  if (!customer) return;
  customer.satisfaction = Math.max(0, Math.min(100, customer.satisfaction + delta));
}

function statusLabel(status) {
  const map = {
    seated: "着席",
    ordered: "注文済",
    drinking: "滞在中",
    leaving: "退店準備",
    left: "退店済",
  };
  return map[status] ?? status;
}

function orderStatusLabel(status) {
  const map = {
    waiting: "待ち",
    serving: "提供中",
    served: "提供完了",
    readyToPay: "会計待ち",
    paid: "会計済",
    stockout: "在庫不足",
    rejected: "提供拒否",
  };
  return map[status] ?? status;
}

function formatTime(minutes) {
  const h = Math.floor(minutes / 60);
  const m = Math.floor(minutes % 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function getHourLabel(minutes) {
  const h = Math.floor(minutes / 60);
  return `${h}-${h + 1}`;
}

function buildSalesByHour() {
  const salesMap = {};
  for (let h = 18; h < config.closingHour; h += 1) {
    salesMap[`${h}-${h + 1}`] = 0;
  }
  state.sales.forEach((sale) => {
    if (!salesMap[sale.hourLabel]) salesMap[sale.hourLabel] = 0;
    salesMap[sale.hourLabel] += sale.amount;
  });
  return Object.entries(salesMap).map(([label, amount]) => ({ label, amount }));
}

function logEvent(message) {
  const timestamp = formatTime(state.nowMinutes);
  state.logs.push(`${timestamp} ${message}`);
  if (state.logs.length > 200) {
    state.logs.shift();
  }
}

function showError(message) {
  const banner = document.getElementById("error-banner");
  const msg = document.getElementById("error-message");
  if (!banner || !msg) return;
  msg.textContent = message;
  banner.classList.remove("hidden");
}

function clearError() {
  const banner = document.getElementById("error-banner");
  if (!banner) return;
  banner.classList.add("hidden");
}

function restoreScrollPositions(previousScroll) {
  requestAnimationFrame(() => {
    const customerList = document.getElementById("customer-list");
    const orderList = document.getElementById("order-list");
    const eventLog = document.getElementById("event-log");
    if (customerList) {
      customerList.scrollTop = previousScroll.customers ?? 0;
    }
    if (orderList) {
      orderList.scrollTop = previousScroll.orders ?? 0;
    }
    if (eventLog) {
      eventLog.scrollTop = previousScroll.logs ?? 0;
    }
  });
}

render();
