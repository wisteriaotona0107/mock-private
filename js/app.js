const DEFAULT_DATA = {
  Users: [
    {
      id: "0de76988-26ab-4a63-9e0b-8f0a36f3a807",
      version: 3,
      userName: "田中 太郎",
      email: "taro.tanaka@example.com",
      departmentId: "dep-001",
      role: "admin",
      isActive: true,
      updatedAt: "2024-03-01T08:14:22Z",
    },
    {
      id: "4c3f7d1b-cd06-4b42-8da0-350950e64564",
      version: 1,
      userName: "山田 花子",
      email: "hanako.yamada@example.com",
      departmentId: "dep-002",
      role: "editor",
      isActive: true,
      updatedAt: "2024-04-12T10:03:45Z",
    },
    {
      id: "851f64b9-3731-4e3c-9061-efbcb7dfaa43",
      version: 5,
      userName: "鈴木 次郎",
      email: "jiro.suzuki@example.com",
      departmentId: "dep-001",
      role: "viewer",
      isActive: false,
      updatedAt: "2024-02-08T15:43:11Z",
    },
  ],
  Departments: [
    {
      id: "dep-001",
      version: 2,
      name: "営業部",
      manager: "田中 太郎",
      updatedAt: "2024-03-31T00:00:00Z",
    },
    {
      id: "dep-002",
      version: 4,
      name: "開発部",
      manager: "山田 花子",
      updatedAt: "2024-02-01T00:00:00Z",
    },
  ],
};

const KEYS = new Set(["id"]);

const tableSelect = document.querySelector("#table-select");
const conditionList = document.querySelector("#condition-list");
const addConditionButton = document.querySelector("#add-condition");
const resetConditionsButton = document.querySelector("#reset-conditions");
const tableForm = document.querySelector("#table-form");
const jsonSource = document.querySelector("#json-source");
const loadJsonButton = document.querySelector("#load-json");
const resultTable = document.querySelector("#result-table");
const tableHead = resultTable.querySelector("thead");
const tableBody = resultTable.querySelector("tbody");
const emptyState = document.querySelector("#empty-state");
const addRowButton = document.querySelector("#add-row");
const updateButton = document.querySelector("#update-data");
const feedback = document.querySelector("#feedback");

let database = deepClone(DEFAULT_DATA);
let activeTableName = Object.keys(database)[0] ?? "";
let filteredRows = [];

function init() {
  jsonSource.value = JSON.stringify(database, null, 2);
  populateTableOptions();
  ensureAtLeastOneCondition();
  renderTable();
}

function deepClone(source) {
  if (typeof structuredClone === "function") {
    return structuredClone(source);
  }
  return JSON.parse(JSON.stringify(source));
}

function generateId() {
  const cryptoObj = globalThis.crypto;
  if (cryptoObj && typeof cryptoObj.randomUUID === "function") {
    return cryptoObj.randomUUID();
  }
  if (cryptoObj && typeof cryptoObj.getRandomValues === "function") {
    const buffer = new Uint8Array(16);
    cryptoObj.getRandomValues(buffer);
    buffer[6] = (buffer[6] & 0x0f) | 0x40;
    buffer[8] = (buffer[8] & 0x3f) | 0x80;
    const hex = Array.from(buffer, (b) => b.toString(16).padStart(2, "0"));
    return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex
      .slice(6, 8)
      .join("")}-${hex.slice(8, 10).join("")}-${hex.slice(10).join("")}`;
  }
  return `id-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
}

function populateTableOptions() {
  tableSelect.innerHTML = "";
  const tableNames = Object.keys(database);

  if (tableNames.length === 0) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "テーブルがありません";
    tableSelect.append(option);
    tableSelect.disabled = true;
    return;
  }

  tableSelect.disabled = false;

  for (const tableName of tableNames) {
    const option = document.createElement("option");
    option.value = tableName;
    option.textContent = tableName;
    option.selected = tableName === activeTableName;
    tableSelect.append(option);
  }

  if (!tableNames.includes(activeTableName)) {
    activeTableName = tableNames[0];
    tableSelect.value = activeTableName;
  }
}

function ensureAtLeastOneCondition() {
  if (conditionList.children.length === 0) {
    addConditionRow();
  }
}

function addConditionRow(initial = { attribute: "", value: "" }) {
  const row = document.createElement("div");
  row.className = "condition-row";
  row.setAttribute("role", "listitem");

  const attributeInput = document.createElement("input");
  attributeInput.type = "text";
  attributeInput.placeholder = "属性名";
  attributeInput.value = initial.attribute;
  attributeInput.setAttribute("aria-label", "属性名");

  const valueInput = document.createElement("input");
  valueInput.type = "text";
  valueInput.placeholder = "値";
  valueInput.value = initial.value;
  valueInput.setAttribute("aria-label", "値");

  const removeButton = document.createElement("button");
  removeButton.type = "button";
  removeButton.className = "btn ghost";
  removeButton.textContent = "削除";
  removeButton.addEventListener("click", () => {
    row.remove();
    if (conditionList.children.length === 0) {
      ensureAtLeastOneCondition();
    }
  });

  row.append(attributeInput, valueInput, removeButton);
  conditionList.append(row);
}

function readConditions() {
  const rows = Array.from(conditionList.children);
  return rows
    .map((row) => {
      const [attributeInput, valueInput] = row.querySelectorAll("input");
      const attribute = attributeInput.value.trim();
      const value = valueInput.value.trim();
      if (!attribute || !value) {
        return null;
      }
      return { attribute, value };
    })
    .filter(Boolean);
}

function parseJsonSource() {
  try {
    const parsed = JSON.parse(jsonSource.value);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("ルートはオブジェクトである必要があります");
    }
    const normalized = {};
    for (const [tableName, rows] of Object.entries(parsed)) {
      if (!Array.isArray(rows)) {
        throw new Error(`${tableName} は配列である必要があります`);
      }
      normalized[tableName] = rows.map((row) => ({ ...row }));
    }
    return normalized;
  } catch (error) {
    showFeedback(error.message, "error");
    return null;
  }
}

function renderTable() {
  const rows = database[activeTableName] ?? [];
  const columns = new Set();
  rows.forEach((row) => {
    Object.keys(row).forEach((key) => columns.add(key));
  });
  columns.add("id");
  columns.add("version");

  const columnList = Array.from(columns).sort((a, b) => {
    const aIsKey = KEYS.has(a);
    const bIsKey = KEYS.has(b);
    if (aIsKey && !bIsKey) return -1;
    if (!aIsKey && bIsKey) return 1;
    return a.localeCompare(b);
  });

  tableHead.innerHTML = "";
  const headerRow = document.createElement("tr");
  for (const column of columnList) {
    const th = document.createElement("th");
    th.textContent = column;
    headerRow.append(th);
  }
  tableHead.append(headerRow);

  tableBody.innerHTML = "";
  filteredRows = [];

  if (rows.length === 0) {
    emptyState.hidden = false;
    return;
  }

  filteredRows = applyFilters(rows, readConditions());
  emptyState.hidden = filteredRows.length > 0;

  for (const rowData of filteredRows) {
    const tr = document.createElement("tr");
    for (const column of columnList) {
      const td = document.createElement("td");
      if (KEYS.has(column)) {
        td.textContent = rowData[column] ?? "";
      } else {
        const input = document.createElement("input");
        input.value = valueToString(rowData[column]);
        input.dataset.column = column;
        input.dataset.id = rowData.id;
        input.addEventListener("change", handleCellChange);
        td.append(input);
      }
      tr.append(td);
    }
    tableBody.append(tr);
  }

  if (filteredRows.length === 0) {
    emptyState.hidden = false;
  }
}

function valueToString(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return String(value);
}

function handleCellChange(event) {
  const input = event.target;
  const { id, column } = input.dataset;
  const tableRows = database[activeTableName];
  const target = tableRows.find((row) => row.id === id);
  if (!target) return;

  target[column] = parseInputValue(input.value, target[column]);
  showFeedback(`id: ${id} の ${column} を更新しました`, "success");
  jsonSource.value = JSON.stringify(database, null, 2);
}

function parseInputValue(rawValue, previousValue) {
  const trimmed = rawValue.trim();
  if (trimmed === "") {
    return "";
  }

  if (typeof previousValue === "number") {
    const num = Number(trimmed);
    if (!Number.isNaN(num)) {
      return num;
    }
  }

  if (typeof previousValue === "boolean") {
    if (["true", "false"].includes(trimmed.toLowerCase())) {
      return trimmed.toLowerCase() === "true";
    }
  }

  if (isIsoDate(previousValue) && !Number.isNaN(Date.parse(trimmed))) {
    return new Date(trimmed).toISOString();
  }

  try {
    const parsed = JSON.parse(trimmed);
    if (typeof parsed === "object") {
      return parsed;
    }
  } catch (error) {
    // 無効な JSON は無視
  }

  return trimmed;
}

function isIsoDate(value) {
  return typeof value === "string" && /\d{4}-\d{2}-\d{2}T/.test(value);
}

function applyFilters(rows, conditions) {
  if (conditions.length === 0) return [...rows];

  return rows.filter((row) =>
    conditions.every(({ attribute, value }) => {
      if (!(attribute in row)) return false;
      const rowValue = row[attribute];
      if (typeof rowValue === "object") {
        return JSON.stringify(rowValue) === value;
      }
      return String(rowValue) === value;
    })
  );
}

function addRow() {
  const templateRow = database[activeTableName]?.[0] ?? {};
  const newRow = {};

  const columns = new Set(Object.keys(templateRow));
  columns.add("id");
  columns.add("version");

  for (const column of columns) {
    if (column === "id") {
      newRow.id = generateId();
    } else if (column === "version") {
      newRow.version = 1;
    } else {
      newRow[column] = "";
    }
  }

  if (!database[activeTableName]) {
    database[activeTableName] = [];
  }

  database[activeTableName].unshift(newRow);
  jsonSource.value = JSON.stringify(database, null, 2);
  renderTable();
  showFeedback(`新しいレコード (id: ${newRow.id}) を追加しました`, "success");
}

function updateData() {
  const rowsAffected = filteredRows.length;
  const timestamp = new Date().toLocaleString("ja-JP", {
    hour12: false,
  });
  showFeedback(
    `${activeTableName} テーブルを更新リクエストしました (対象件数: ${rowsAffected}) - ${timestamp}`,
    "success"
  );
}

function showFeedback(message, variant = "") {
  feedback.textContent = message;
  feedback.className = `feedback ${variant}`.trim();
}

function handleSearch(event) {
  event.preventDefault();
  renderTable();
  showFeedback("検索条件を適用しました", "success");
}

function handleTableChange(event) {
  activeTableName = event.target.value;
  renderTable();
  showFeedback(`${activeTableName} を選択しました`, "success");
}

function handleJsonLoad() {
  const parsed = parseJsonSource();
  if (!parsed) return;
  database = parsed;
  activeTableName = Object.keys(database)[0] ?? "";
  populateTableOptions();
  renderTable();
  showFeedback("JSON データを読み込みました", "success");
}

addConditionButton.addEventListener("click", () => addConditionRow());
resetConditionsButton.addEventListener("click", () => {
  conditionList.innerHTML = "";
  ensureAtLeastOneCondition();
});
tableForm.addEventListener("submit", handleSearch);
tableSelect.addEventListener("change", handleTableChange);
loadJsonButton.addEventListener("click", handleJsonLoad);
addRowButton.addEventListener("click", addRow);
updateButton.addEventListener("click", updateData);

document.addEventListener("DOMContentLoaded", init);
