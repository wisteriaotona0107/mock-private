const equipments = [
  { name: "日本酒用冷蔵庫A", range: "0〜8℃" },
  { name: "日本酒用冷蔵庫B", range: "0〜8℃" },
  { name: "低温ショーケース", range: "0〜10℃" },
  { name: "冷凍庫", range: "-20〜-15℃" }
];

const cleanItems = [
  "カウンター清掃",
  "シンク・作業台清掃",
  "ゴミ処理・分別確認",
  "グラス棚の拭き上げ",
  "トイレ清掃",
  "床清掃"
];

const sakeList = [
  {
    id: 1,
    name: "鳳凰美田 純米吟醸",
    type: "純米吟醸",
    storage: "日本酒用冷蔵庫A",
    openedDate: "2025-03-01",
    recommendedDays: 7,
    status: "良好",
    note: "華やかな香り。フレッシュさを保ちたい。",
    lastChecked: null
  },
  {
    id: 2,
    name: "寫樂 純米酒",
    type: "純米",
    storage: "日本酒用冷蔵庫B",
    openedDate: "2025-02-25",
    recommendedDays: 10,
    status: "良好",
    note: "食中酒に。フレッシュ感を確認。",
    lastChecked: null
  },
  {
    id: 3,
    name: "新政 No.6 R-type 生酒",
    type: "生酒",
    storage: "低温ショーケース",
    openedDate: "2025-03-05",
    recommendedDays: 5,
    status: "良好",
    note: "低温管理必須。日々確認。",
    lastChecked: null
  },
  {
    id: 4,
    name: "黒龍 いっちょらい",
    type: "吟醸",
    storage: "日本酒用冷蔵庫A",
    openedDate: "2025-02-20",
    recommendedDays: 14,
    status: "そろそろ飲み切りたい",
    note: "熟成感が出る前に提供。",
    lastChecked: null
  },
  {
    id: 5,
    name: "而今 特別純米",
    type: "特別純米",
    storage: "日本酒用冷蔵庫B",
    openedDate: "2025-02-28",
    recommendedDays: 9,
    status: "良好",
    note: "香りが落ちないよう注意。",
    lastChecked: null
  }
];

let temperatureLogs = [];
let cleanLogs = [];
let staffLogs = [];
let logEntries = [];

const formatDateTime = (date) => {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${day} ${hh}:${mm}`;
};

const isToday = (date) => {
  const now = new Date();
  const d = new Date(date);
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
};

const daysSince = (dateString) => {
  const opened = new Date(dateString);
  const now = new Date();
  const diff = now - opened;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

const addLog = (category, content) => {
  const entry = { time: new Date(), category, content };
  logEntries.unshift(entry);
  renderRecentLogs();
  renderAllLogs();
  renderDashboard();
};

const renderDate = () => {
  const today = new Date();
  const text = today.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short"
  });
  document.getElementById("todayDate").textContent = text;
};

const renderTemperatureTable = () => {
  const tbody = document.querySelector("#tempTable tbody");
  tbody.innerHTML = "";
  equipments.forEach((eq, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${eq.name}</td>
      <td>${eq.range}</td>
      <td><input type="number" step="0.1" class="input" data-eq="${index}" placeholder="5.0"></td>
      <td><button class="primary" data-action="record" data-index="${index}">記録</button></td>
    `;
    tbody.appendChild(tr);
  });

  tbody.addEventListener("click", (e) => {
    const target = e.target;
    if (target.dataset.action === "record") {
      const idx = Number(target.dataset.index);
      const input = tbody.querySelector(`input[data-eq="${idx}"]`);
      recordTemperature(idx, input.value);
    }
  });
};

const recordTemperature = (index, value) => {
  const temp = parseFloat(value);
  if (Number.isNaN(temp)) {
    alert("温度を入力してください");
    return;
  }
  const eq = equipments[index];
  const abnormal = temp < 0 || temp > 15;
  const time = new Date();
  temperatureLogs.push({ equipment: eq.name, temp, time, abnormal });
  addLog("温度", `${eq.name} ${temp.toFixed(1)}℃ ${abnormal ? "(基準外)" : "記録"}`);
  renderDashboard();
};

const renderSakeTable = () => {
  const tbody = document.querySelector("#sakeTable tbody");
  tbody.innerHTML = "";
  sakeList.forEach((sake) => {
    const days = daysSince(sake.openedDate);
    const over = days > sake.recommendedDays;
    const tr = document.createElement("tr");
    if (over) tr.classList.add("overdue");

    const statusClass = over ? "danger" : sake.status.includes("そろそろ") ? "warn" : "";
    const selectId = `status-${sake.id}`;

    tr.innerHTML = `
      <td>
        <div>${sake.name}</div>
        <div class="text-muted">${sake.note || ""}</div>
      </td>
      <td>${sake.type}</td>
      <td>${sake.storage}</td>
      <td>${sake.openedDate}</td>
      <td>${days}日経過</td>
      <td>推奨 ${sake.recommendedDays}日</td>
      <td><span class="status-chip ${statusClass}">${sake.status}</span></td>
      <td>
        <select id="${selectId}" class="input">
          <option value="良好">良好</option>
          <option value="そろそろ飲み切りたい">そろそろ飲み切りたい</option>
          <option value="廃棄検討">廃棄検討</option>
        </select>
        <button class="ghost" data-action="update-sake" data-id="${sake.id}">更新</button>
      </td>
    `;
    tbody.appendChild(tr);
    document.getElementById(selectId).value = sake.status;
  });

  if (!tbody.dataset.bound) {
    tbody.addEventListener("click", (e) => {
      const target = e.target;
      if (target.dataset.action === "update-sake") {
        const id = Number(target.dataset.id);
        const select = document.getElementById(`status-${id}`);
        updateSakeStatus(id, select.value);
      }
    });
    tbody.dataset.bound = "true";
  }
};

const updateSakeStatus = (id, newStatus) => {
  const sake = sakeList.find((s) => s.id === id);
  if (!sake) return;
  sake.status = newStatus;
  sake.lastChecked = new Date();
  addLog("酒", `${sake.name} 状態更新: ${newStatus}`);
  renderSakeTable();
  renderDashboard();
};

const renderCleanChecklist = () => {
  const form = document.getElementById("cleanForm");
  form.innerHTML = "";
  cleanItems.forEach((item, idx) => {
    const id = `clean-${idx}`;
    const label = document.createElement("label");
    label.innerHTML = `<input type="checkbox" id="${id}" value="${item}"> ${item}`;
    form.appendChild(label);
  });
};

const saveCleanChecklist = () => {
  const staff = document.getElementById("cleanStaff").value || "未入力";
  const checkboxes = Array.from(document.querySelectorAll("#cleanForm input[type='checkbox']"));
  const completed = checkboxes.filter((c) => c.checked);
  if (completed.length === 0) {
    alert("完了した項目にチェックを入れてください");
    return;
  }
  const time = new Date();
  completed.forEach((cb) => {
    cleanLogs.push({ item: cb.value, staff, time, done: true });
    addLog("清掃", `${cb.value} 完了 (${staff})`);
    cb.checked = false;
  });
  renderDashboard();
};

const handleStaffSubmit = (e) => {
  e.preventDefault();
  const name = document.getElementById("staffName").value.trim();
  if (!name) {
    alert("スタッフ名を入力してください");
    return;
  }
  const hand = document.querySelector("input[name='hand']:checked").value;
  const attire = document.querySelector("input[name='attire']:checked").value;
  const condition = document.querySelector("input[name='condition']:checked").value;
  const time = new Date();
  const record = { name, hand, attire, condition, time };
  staffLogs.push(record);
  addLog("スタッフ", `${name} 衛生チェック: 手 ${hand} / 服装 ${attire} / 体調 ${condition}`);
  e.target.reset();
};

const renderRecentLogs = () => {
  const list = document.getElementById("recentLogs");
  list.innerHTML = "";
  logEntries.slice(0, 3).forEach((log) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div class="time">${formatDateTime(log.time)}</div>
      <div><span class="cat">${log.category}</span>${log.content}</div>
    `;
    list.appendChild(li);
  });
};

const renderAllLogs = () => {
  const list = document.getElementById("allLogs");
  list.innerHTML = "";
  logEntries.forEach((log) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div class="time">${formatDateTime(log.time)}</div>
      <div><span class="cat">${log.category}</span>${log.content}</div>
    `;
    list.appendChild(li);
  });
};

const computeCleanProgress = () => {
  const todayLogs = cleanLogs.filter((log) => isToday(log.time) && log.done);
  const completedItems = new Set(todayLogs.map((l) => l.item));
  return { done: completedItems.size, total: cleanItems.length };
};

const computeSakeChecksToday = () => {
  return sakeList.filter((s) => s.lastChecked && isToday(s.lastChecked)).length;
};

const computeTempProgress = () => {
  const todayLogs = temperatureLogs.filter((log) => isToday(log.time));
  return { done: todayLogs.length, total: equipments.length };
};

const computeStaffProgress = () => {
  const today = staffLogs.filter((log) => isToday(log.time));
  return { done: today.length, total: 5 };
};

const setBar = (id, percent) => {
  const bar = document.getElementById(id);
  bar.style.width = `${Math.min(percent, 100)}%`;
};

const renderDashboard = () => {
  const temp = computeTempProgress();
  document.getElementById("tempProgress").textContent = `${temp.done} / ${temp.total} 記録`;
  setBar("tempBar", (temp.done / Math.max(temp.total, 1)) * 100);

  const sakeChecked = computeSakeChecksToday();
  document.getElementById("sakeProgress").textContent = `${sakeChecked}本 確認済み / ${sakeList.length}本`;
  setBar("sakeBar", (sakeChecked / Math.max(sakeList.length, 1)) * 100);

  const clean = computeCleanProgress();
  document.getElementById("cleanProgress").textContent = `${clean.done} / ${clean.total} 完了`;
  setBar("cleanBar", (clean.done / Math.max(clean.total, 1)) * 100);

  const staff = computeStaffProgress();
  document.getElementById("staffProgress").textContent = `${staff.done}人 チェック / 目標5人`;
  setBar("staffBar", (staff.done / 5) * 100);
};

const bindTabs = () => {
  const buttons = document.querySelectorAll(".tab-btn");
  const views = document.querySelectorAll(".view");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const target = btn.dataset.target;
      views.forEach((v) => v.classList.remove("active"));
      document.getElementById(target).classList.add("active");
    });
  });
};

const bootstrap = () => {
  renderDate();
  renderTemperatureTable();
  renderSakeTable();
  renderCleanChecklist();
  renderRecentLogs();
  renderAllLogs();
  renderDashboard();

  document.getElementById("saveClean").addEventListener("click", saveCleanChecklist);
  document.getElementById("staffForm").addEventListener("submit", handleStaffSubmit);
  bindTabs();
};

document.addEventListener("DOMContentLoaded", bootstrap);
