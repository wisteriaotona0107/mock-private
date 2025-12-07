// ====== 初期データ ======
const sakeList = [
  {
    id: 1,
    name: "獺祭 純米大吟醸45",
    type: "純米大吟醸",
    storage: "冷蔵庫A",
    openedDate: "2024-03-10",
    recommendedDays: 10,
    status: "良好",
    note: "華やかな香り。早めに出したい。",
  },
  {
    id: 2,
    name: "新政 No.6 R-type",
    type: "生酒",
    storage: "冷蔵庫A",
    openedDate: "2024-03-15",
    recommendedDays: 7,
    status: "そろそろ飲み切りたい",
    note: "要冷蔵。香味変化に注意。",
  },
  {
    id: 3,
    name: "田酒 特別純米",
    type: "純米",
    storage: "冷蔵庫B",
    openedDate: "2024-03-05",
    recommendedDays: 14,
    status: "良好",
    note: "常連向けの安定銘柄。",
  },
  {
    id: 4,
    name: "仙禽 かぶとむし",
    type: "ナチュール",
    storage: "冷蔵庫B",
    openedDate: "2024-03-01",
    recommendedDays: 7,
    status: "廃棄検討",
    note: "香味落ち確認。",
  },
  {
    id: 5,
    name: "飛露喜 特別純米",
    type: "純米",
    storage: "ショーケース",
    openedDate: "2024-03-08",
    recommendedDays: 12,
    status: "良好",
    note: "人気銘柄。提供推奨。",
  },
];

const devices = [
  { id: "fridgeA", name: "日本酒用冷蔵庫A" },
  { id: "fridgeB", name: "日本酒用冷蔵庫B" },
  { id: "freezer", name: "冷凍庫" },
  { id: "showcase", name: "ショーケース" },
];

const cleanTasks = [
  "カウンター清掃",
  "シンク・作業台清掃",
  "ゴミ処理・分別確認",
  "グラス棚の拭き上げ",
  "トイレ清掃",
  "床清掃",
];

let temperatureLogs = [];
let cleanLogs = [];
let staffLogs = [];
let activityLogs = [];

// ====== ユーティリティ ======
const formatDateTime = (date = new Date()) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${d} ${hh}:${mm}`;
};

const daysFrom = (dateStr) => {
  const target = new Date(dateStr);
  const diff = Date.now() - target.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

const addActivity = (category, content) => {
  activityLogs.unshift({ id: crypto.randomUUID(), category, content, timestamp: formatDateTime() });
  if (activityLogs.length > 50) activityLogs.pop();
};

// ====== 進捗計算 ======
const getDashboardStats = () => {
  const tempDone = temperatureLogs.filter((l) => isToday(l.timestamp)).length;
  const sakeChecked = sakeList.filter((s) => s.checkedToday).length;
  const cleanDone = cleanLogs.filter((l) => isToday(l.timestamp)).length;
  const staffDone = staffLogs.filter((l) => isToday(l.timestamp)).length;

  return {
    temp: { done: tempDone, total: devices.length },
    sake: { done: sakeChecked, total: sakeList.length },
    clean: { done: cleanDone, total: cleanTasks.length },
    staff: { done: staffDone, total: Math.max(staffLogs.length, 3) },
  };
};

const isToday = (timestamp) => {
  const today = new Date();
  const date = new Date(timestamp);
  return today.toDateString() === date.toDateString();
};

// ====== レンダリング関数 ======
const renderDashboard = () => {
  const container = document.getElementById("H_TOP");
  const stats = getDashboardStats();
  const recentLogs = activityLogs.slice(0, 3);

  container.innerHTML = `
    <h2 class="section-title">今日の状況</h2>
    <div class="grid columns-2">
      ${renderProgressCard("温度管理", stats.temp.done, stats.temp.total)}
      ${renderProgressCard("日本酒管理", stats.sake.done, stats.sake.total)}
      ${renderProgressCard("清掃（日次）", stats.clean.done, stats.clean.total)}
      ${renderProgressCard("従業員衛生", stats.staff.done, stats.staff.total)}
    </div>
    <div class="card" style="margin-top:14px;">
      <div class="card-header">
        <h3 style="margin:0;">最近のログ</h3>
        <span class="muted">最新3件</span>
      </div>
      <ul class="log-list">
        ${recentLogs
          .map(
            (log) => `
              <li class="log-item">
                <span class="muted">${log.timestamp}</span>
                <span class="badge">${log.category}</span>
                <span>${log.content}</span>
              </li>
            `
          )
          .join("") || "<p class='muted'>まだ記録がありません。</p>"}
      </ul>
    </div>
  `;
};

const renderProgressCard = (title, done, total) => {
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  return `
    <div class="card">
      <div class="card-header">
        <strong>${title}</strong>
        <span>${done} / ${total}</span>
      </div>
      <div class="progress-wrap">
        <div class="progress-bar" style="width:${percent}%;"></div>
      </div>
      <p class="muted" style="margin-top:6px;">進捗 ${percent}%</p>
    </div>
  `;
};

const renderTempPage = () => {
  const container = document.getElementById("H_TEMP");
  container.innerHTML = `
    <h2 class="section-title">温度記録</h2>
    <div class="grid columns-2">
      ${devices
        .map(
          (d) => `
            <div class="card" data-device="${d.id}">
              <div class="card-header">
                <strong>${d.name}</strong>
                <span class="muted">0〜15℃ を基準</span>
              </div>
              <div class="form-row">
                <input type="number" placeholder="温度を入力" step="0.1" aria-label="${d.name} 温度入力" />
                <button class="primary" data-action="record-temp" data-id="${d.id}">記録</button>
              </div>
              <p class="muted" id="temp-note-${d.id}">最新記録なし</p>
            </div>
          `
        )
        .join("")}
    </div>
  `;
};

const renderSakePage = () => {
  const container = document.getElementById("H_SAKE");
  container.innerHTML = `
    <h2 class="section-title">日本酒ボトル管理</h2>
    <table class="table">
      <thead>
        <tr>
          <th>酒名</th>
          <th>タイプ</th>
          <th>保存</th>
          <th>開栓日</th>
          <th>経過日</th>
          <th>推奨日数</th>
          <th>状態</th>
          <th>更新</th>
        </tr>
      </thead>
      <tbody>
        ${sakeList
          .map((s) => {
            const elapsed = daysFrom(s.openedDate);
            const overdue = elapsed > s.recommendedDays;
            return `
              <tr>
                <td>${s.name}</td>
                <td>${s.type}</td>
                <td>${s.storage}</td>
                <td>${s.openedDate}</td>
                <td>${elapsed}日</td>
                <td>${s.recommendedDays}日</td>
                <td>
                  <span class="badge ${overdue ? "warn" : "ok"}">${s.status}</span>
                </td>
                <td>
                  <select data-action="update-status" data-id="${s.id}">
                    <option value="良好" ${s.status === "良好" ? "selected" : ""}>良好</option>
                    <option value="そろそろ飲み切りたい" ${s.status === "そろそろ飲み切りたい" ? "selected" : ""}>そろそろ飲み切りたい</option>
                    <option value="廃棄検討" ${s.status === "廃棄検討" ? "selected" : ""}>廃棄検討</option>
                  </select>
                </td>
              </tr>
            `;
          })
          .join("")}
      </tbody>
    </table>
  `;
};

const renderCleanPage = () => {
  const container = document.getElementById("H_CLEAN");
  container.innerHTML = `
    <h2 class="section-title">日次清掃チェック</h2>
    <div class="card">
      ${cleanTasks
        .map(
          (task, idx) => `
            <div class="form-row">
              <input type="checkbox" id="clean-${idx}" data-task="${task}" />
              <label for="clean-${idx}">${task}</label>
            </div>
          `
        )
        .join("")}
      <div class="form-row">
        <input type="text" id="clean-staff" placeholder="担当スタッフ" />
        <button class="primary" id="save-clean">保存</button>
      </div>
    </div>
  `;
};

const renderStaffPage = () => {
  const container = document.getElementById("H_STAFF");
  container.innerHTML = `
    <h2 class="section-title">従業員衛生チェック</h2>
    <div class="card">
      <div class="form-row">
        <input type="text" id="staff-name" placeholder="スタッフ名" />
      </div>
      <div class="form-row">
        <label class="muted" style="min-width:120px;">手洗い／爪／傷</label>
        <select id="staff-hand">
          <option value="OK">OK</option>
          <option value="要確認">要確認</option>
        </select>
      </div>
      <div class="form-row">
        <label class="muted" style="min-width:120px;">服装（清潔）</label>
        <select id="staff-wear">
          <option value="OK">OK</option>
          <option value="要確認">要確認</option>
        </select>
      </div>
      <div class="form-row">
        <label class="muted" style="min-width:120px;">体調</label>
        <select id="staff-health">
          <option value="問題なし">問題なし</option>
          <option value="要注意">要注意</option>
        </select>
      </div>
      <div class="form-row">
        <textarea id="staff-notes" rows="2" placeholder="メモ（任意）"></textarea>
      </div>
      <div class="form-row">
        <button class="primary" id="save-staff">記録</button>
      </div>
    </div>
  `;
};

const renderLogPage = () => {
  const container = document.getElementById("H_LOG");
  container.innerHTML = `
    <h2 class="section-title">記録ログ</h2>
    <div class="card">
      <ul class="log-list">
        ${activityLogs
          .map(
            (log) => `
              <li class="log-item">
                <span class="muted">${log.timestamp}</span>
                <span class="badge">${log.category}</span>
                <span>${log.content}</span>
              </li>
            `
          )
          .join("") || "<p class='muted'>まだ記録がありません。</p>"}
      </ul>
    </div>
  `;
};

// ====== イベントハンドラ ======
const bindEvents = () => {
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => switchView(btn.dataset.target, btn));
  });

  document.getElementById("H_TEMP").addEventListener("click", (e) => {
    if (e.target.dataset.action === "record-temp") {
      const deviceId = e.target.dataset.id;
      const input = e.target.closest(".form-row").querySelector("input");
      const value = Number(input.value);
      if (Number.isNaN(value)) return alert("温度を入力してください");
      addTemperatureLog(deviceId, value);
      input.value = "";
      updateTempNotes();
      refreshAll();
    }
  });

  document.getElementById("H_SAKE").addEventListener("change", (e) => {
    if (e.target.dataset.action === "update-status") {
      const id = Number(e.target.dataset.id);
      const target = sakeList.find((s) => s.id === id);
      if (!target) return;
      target.status = e.target.value;
      target.checkedToday = true;
      addActivity("酒", `${target.name} ステータス更新: ${target.status}`);
      refreshAll();
    }
  });

  document.getElementById("H_CLEAN").addEventListener("click", (e) => {
    if (e.target.id === "save-clean") {
      saveCleanLogs();
    }
  });

  document.getElementById("H_STAFF").addEventListener("click", (e) => {
    if (e.target.id === "save-staff") {
      saveStaffLog();
    }
  });
};

const switchView = (viewId, button) => {
  document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
  if (button) button.classList.add("active");
  document.querySelectorAll(".view").forEach((v) => v.classList.remove("active-view"));
  const target = document.getElementById(viewId);
  if (target) target.classList.add("active-view");
};

const addTemperatureLog = (deviceId, value) => {
  const device = devices.find((d) => d.id === deviceId);
  const isAlert = value < 0 || value > 15;
  const entry = {
    id: crypto.randomUUID(),
    device: device?.name || deviceId,
    value,
    timestamp: formatDateTime(),
    isAlert,
  };
  temperatureLogs.unshift(entry);
  addActivity("温度", `${entry.device} ${value.toFixed(1)}℃ 記録${isAlert ? "(基準外)" : ""}`);
};

const updateTempNotes = () => {
  devices.forEach((d) => {
    const label = document.getElementById(`temp-note-${d.id}`);
    if (!label) return;
    const latest = temperatureLogs.find((l) => l.device === d.name);
    if (!latest) {
      label.textContent = "最新記録なし";
    } else {
      label.textContent = `${latest.timestamp} / ${latest.value}℃ ${latest.isAlert ? "⚠︎" : ""}`;
      label.className = `muted ${latest.isAlert ? "alert-text" : "success-text"}`;
    }
  });
};

const saveCleanLogs = () => {
  const staff = document.getElementById("clean-staff").value.trim() || "未入力";
  const checked = Array.from(document.querySelectorAll("#H_CLEAN input[type='checkbox']:checked"));
  checked.forEach((cb) => {
    const entry = {
      id: crypto.randomUUID(),
      task: cb.dataset.task,
      done: true,
      staff,
      timestamp: formatDateTime(),
    };
    cleanLogs.unshift(entry);
    addActivity("清掃", `${entry.task} / ${staff} が完了`);
    cb.checked = false;
  });
  document.getElementById("clean-staff").value = "";
  refreshAll();
};

const saveStaffLog = () => {
  const staff = document.getElementById("staff-name").value.trim();
  if (!staff) return alert("スタッフ名を入力してください");
  const hand = document.getElementById("staff-hand").value;
  const wear = document.getElementById("staff-wear").value;
  const health = document.getElementById("staff-health").value;
  const notes = document.getElementById("staff-notes").value.trim();

  const entry = {
    id: crypto.randomUUID(),
    staff,
    condition: { hand, wear, health },
    notes,
    timestamp: formatDateTime(),
  };
  staffLogs.unshift(entry);
  addActivity("スタッフ", `${staff} 衛生チェック: 手${hand}, 服${wear}, 体調${health}`);
  document.getElementById("staff-name").value = "";
  document.getElementById("staff-notes").value = "";
  refreshAll();
};

const refreshAll = () => {
  renderDashboard();
  renderLogPage();
};

// ====== 初期化 ======
const init = () => {
  document.getElementById("todayDate").textContent = formatDateTime(new Date()).split(" ")[0];
  renderDashboard();
  renderTempPage();
  renderSakePage();
  renderCleanPage();
  renderStaffPage();
  renderLogPage();
  bindEvents();
  updateTempNotes();
};

document.addEventListener("DOMContentLoaded", init);
