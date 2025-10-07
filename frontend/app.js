const { apiBase } = window.APP_CONFIG || {};

const state = {
  query: "",
  limit: 20,
  currentToken: null,
  nextToken: null,
  prevTokens: [],
  items: [],
  selectedId: null
};

const elements = {
  searchForm: document.getElementById("search-form"),
  searchInput: document.getElementById("search-input"),
  clearSearch: document.getElementById("clear-search"),
  itemsBody: document.getElementById("items-body"),
  prevPage: document.getElementById("prev-page"),
  nextPage: document.getElementById("next-page"),
  itemForm: document.getElementById("item-form"),
  itemId: document.getElementById("item-id"),
  itemVersion: document.getElementById("item-version"),
  itemCode: document.getElementById("item-code"),
  itemName: document.getElementById("item-name"),
  itemDescription: document.getElementById("item-description"),
  itemEnabled: document.getElementById("item-enabled"),
  resetButton: document.getElementById("reset-button"),
  deleteButton: document.getElementById("delete-button"),
  toastContainer: document.getElementById("toast-container"),
  saveButton: document.getElementById("save-button")
};

function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.setAttribute("role", "status");
  toast.textContent = message;
  elements.toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 4200);
}

async function apiFetch(path, options = {}) {
  const url = new URL(path, apiBase);
  const opts = { ...options };
  opts.headers = {
    "Accept": "application/json",
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(options.headers || {})
  };
  const response = await fetch(url, opts);
  if (!response.ok) {
    let errorPayload;
    try {
      errorPayload = await response.json();
    } catch (err) {
      errorPayload = { message: response.statusText };
    }
    const error = new Error(errorPayload.message || "Request failed");
    error.status = response.status;
    error.payload = errorPayload;
    throw error;
  }
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (err) {
    return text;
  }
}

function formatDate(value) {
  if (!value) return "-";
  try {
    const date = new Date(value);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  } catch (err) {
    return value;
  }
}

function renderItems(items) {
  elements.itemsBody.innerHTML = "";
  if (!items.length) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 6;
    cell.textContent = "該当するデータがありません";
    cell.style.textAlign = "center";
    row.appendChild(cell);
    elements.itemsBody.appendChild(row);
    return;
  }

  for (const item of items) {
    const row = document.createElement("tr");
    if (item.id === state.selectedId) {
      row.classList.add("selected");
    }

    const idCell = document.createElement("td");
    idCell.className = "cell-id";
    idCell.title = item.id;
    idCell.textContent = item.id;

    const codeCell = document.createElement("td");
    codeCell.textContent = item.code || "-";

    const nameCell = document.createElement("td");
    nameCell.textContent = item.name || "-";

    const enabledCell = document.createElement("td");
    enabledCell.appendChild(createEnabledBadge(item.enabled));

    const updatedCell = document.createElement("td");
    updatedCell.textContent = formatDate(item.updatedAt);

    const actionsCell = document.createElement("td");
    actionsCell.className = "actions";
    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.textContent = "編集";
    editBtn.addEventListener("click", () => {
      loadItemDetail(item.id);
    });
    actionsCell.appendChild(editBtn);

    row.append(idCell, codeCell, nameCell, enabledCell, updatedCell, actionsCell);
    elements.itemsBody.appendChild(row);
  }
}

function createEnabledBadge(enabled) {
  const span = document.createElement("span");
  span.className = enabled ? "badge" : "badge disabled";
  span.textContent = enabled ? "有効" : "無効";
  return span;
}

function updatePagingControls() {
  elements.prevPage.disabled = state.prevTokens.length === 0;
  elements.nextPage.disabled = !state.nextToken;
}

async function loadItems({ action = "reset" } = {}) {
  let nextTokenParam = null;
  let newCurrentToken = state.currentToken;
  let newPrevTokens = [...state.prevTokens];

  if (action === "reset") {
    newPrevTokens = [];
    newCurrentToken = null;
    nextTokenParam = null;
  } else if (action === "next") {
    if (!state.nextToken) {
      return;
    }
    newPrevTokens.push(state.currentToken);
    newCurrentToken = state.nextToken;
    nextTokenParam = state.nextToken;
  } else if (action === "prev") {
    if (state.prevTokens.length === 0) {
      return;
    }
    const targetToken = newPrevTokens.pop();
    newCurrentToken = targetToken ?? null;
    nextTokenParam = newCurrentToken;
  } else if (action === "refresh") {
    nextTokenParam = state.currentToken;
  }

  try {
    const params = new URLSearchParams();
    if (state.query) params.set("q", state.query);
    if (state.limit) params.set("limit", state.limit);
    if (nextTokenParam) params.set("nextToken", nextTokenParam);

    const data = await apiFetch(`/items?${params.toString()}`);
    state.items = data.items || [];
    state.nextToken = data.nextToken || null;
    state.currentToken = newCurrentToken;
    state.prevTokens = newPrevTokens;
    renderItems(state.items);
    updatePagingControls();
  } catch (error) {
    console.error(error);
    showToast(error.message || "一覧の取得に失敗しました", "error");
  }
}

async function loadItemDetail(id) {
  try {
    const item = await apiFetch(`/items/${id}`);
    populateForm(item);
    state.selectedId = item.id;
    renderItems(state.items);
  } catch (error) {
    if (error.status === 404) {
      showToast("対象のデータが見つかりません", "error");
    } else {
      showToast("詳細の取得に失敗しました", "error");
    }
  }
}

function populateForm(item) {
  if (!item) {
    elements.itemId.value = "";
    elements.itemVersion.value = "";
    elements.itemCode.value = "";
    elements.itemName.value = "";
    elements.itemDescription.value = "";
    elements.itemEnabled.checked = true;
    state.selectedId = null;
    renderItems(state.items);
    return;
  }
  elements.itemId.value = item.id || "";
  elements.itemVersion.value = item.version ?? "";
  elements.itemCode.value = item.code || "";
  elements.itemName.value = item.name || "";
  elements.itemDescription.value = item.description || "";
  elements.itemEnabled.checked = Boolean(item.enabled);
  state.selectedId = item.id;
}

function validateForm(payload) {
  const errors = [];
  if (!payload.code) {
    errors.push("コードは必須です");
  } else if (payload.code.length > 64) {
    errors.push("コードは64文字以内で入力してください");
  }
  if (!payload.name) {
    errors.push("名前は必須です");
  } else if (payload.name.length > 128) {
    errors.push("名前は128文字以内で入力してください");
  }
  if (payload.description && payload.description.length > 512) {
    errors.push("説明は512文字以内で入力してください");
  }
  return errors;
}

elements.searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const query = elements.searchInput.value.trim();
  state.query = query;
  loadItems({ action: "reset" });
});

elements.clearSearch.addEventListener("click", () => {
  elements.searchInput.value = "";
  state.query = "";
  loadItems({ action: "reset" });
});

elements.prevPage.addEventListener("click", () => {
  if (!elements.prevPage.disabled) {
    loadItems({ action: "prev" });
  }
});

elements.nextPage.addEventListener("click", () => {
  if (!elements.nextPage.disabled) {
    loadItems({ action: "next" });
  }
});

elements.resetButton.addEventListener("click", () => {
  populateForm(null);
});

elements.deleteButton.addEventListener("click", async () => {
  const id = elements.itemId.value;
  if (!id) {
    showToast("削除対象を選択してください", "info");
    return;
  }
  if (!confirm("このレコードを削除しますか？")) {
    return;
  }
  const version = elements.itemVersion.value;
  try {
    const query = version ? `?version=${encodeURIComponent(version)}` : "";
    await apiFetch(`/items/${id}${query}`, { method: "DELETE" });
    showToast("削除しました", "success");
    populateForm(null);
    await loadItems({ action: "refresh" });
  } catch (error) {
    if (error.status === 409) {
      showToast("他のユーザーにより更新されました。最新を読み込んでください", "error");
    } else if (error.status === 404) {
      showToast("対象が見つかりません", "error");
    } else {
      showToast("削除に失敗しました", "error");
    }
  }
});

elements.itemForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(elements.itemForm);
  const payload = {
    code: (formData.get("code") || "").trim(),
    name: (formData.get("name") || "").trim(),
    description: (formData.get("description") || "").trim(),
    enabled: formData.get("enabled") !== null
  };
  const id = formData.get("id");
  const version = formData.get("version");

  const errors = validateForm(payload);
  if (errors.length) {
    showToast(errors[0], "error");
    return;
  }

  const body = JSON.stringify(
    id
      ? { ...payload, version: version ? Number(version) : undefined }
      : payload
  );

  elements.saveButton.disabled = true;
  try {
    let result;
    if (id) {
      result = await apiFetch(`/items/${id}`, { method: "PUT", body });
      showToast("更新しました", "success");
    } else {
      result = await apiFetch(`/items`, { method: "POST", body });
      showToast("作成しました", "success");
    }
    populateForm(result);
    await loadItems({ action: "refresh" });
  } catch (error) {
    if (error.status === 409) {
      showToast("他のユーザーにより更新されました。最新を読み込んでください", "error");
    } else if (error.status === 400) {
      showToast(error.message || "入力エラーです", "error");
    } else {
      showToast("保存に失敗しました", "error");
    }
  } finally {
    elements.saveButton.disabled = false;
  }
});

function init() {
  loadItems({ action: "reset" });
}

document.addEventListener("DOMContentLoaded", init);
