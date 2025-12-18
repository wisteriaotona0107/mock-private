const defaultData = {
  items: [
    {
      id: "alpha-01",
      name: "Alpha Site",
      status: "active",
      owner: "Ops Team",
      description: "Primary region handling core traffic.",
    },
    {
      id: "beta-04",
      name: "Beta Node",
      status: "maintenance",
      owner: "Platform",
      description: "Scheduled upgrade window.",
    },
    {
      id: "gamma-12",
      name: "Gamma Edge",
      status: "standby",
      owner: "Edge",
      description: "Warm standby for failover drills.",
    },
  ],
};

let state = structuredClone(defaultData);
let activeId = state.items[0]?.id ?? null;

const listEl = document.getElementById("itemList");
const formEl = document.getElementById("itemForm");
const previewEl = document.getElementById("jsonPreview");
const copyBtn = document.getElementById("copyJson");
const downloadBtn = document.getElementById("downloadJson");
const resetBtn = document.getElementById("resetForm");
const addBtn = document.getElementById("addItem");
const activeLabel = document.getElementById("activeLabel");

const idInput = document.getElementById("itemId");
const nameInput = document.getElementById("itemName");
const statusInput = document.getElementById("itemStatus");
const ownerInput = document.getElementById("itemOwner");
const descriptionInput = document.getElementById("itemDescription");

function renderList() {
  listEl.innerHTML = "";
  state.items.forEach((item) => {
    const li = document.createElement("li");
    li.className = "item-row" + (item.id === activeId ? " active" : "");
    li.tabIndex = 0;

    const title = document.createElement("p");
    title.className = "item-title";
    title.textContent = item?.name?.trim() || item.id || "Untitled";

    const meta = document.createElement("p");
    meta.className = "item-meta";
    const status = item?.status?.trim() || "—";
    const owner = item?.owner?.trim() || "Unassigned";
    meta.textContent = `Status: ${status} · Owner: ${owner}`;

    li.append(title, meta);
    li.addEventListener("click", () => selectItem(item.id));
    li.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        selectItem(item.id);
      }
    });

    listEl.appendChild(li);
  });
}

function selectItem(id) {
  activeId = id;
  const item = state.items.find((entry) => entry.id === id);
  if (!item) return;

  activeLabel.textContent = item.name?.trim() || item.id || "Selected";
  idInput.value = item.id ?? "";
  nameInput.value = item.name ?? "";
  statusInput.value = item.status ?? "";
  ownerInput.value = item.owner ?? "";
  descriptionInput.value = item.description ?? "";
  renderList();
  updatePreview();
}

function updatePreview() {
  previewEl.value = JSON.stringify(state, null, 2);
}

function safeUpdateFromForm() {
  const clean = (value) => value?.trim() ?? "";
  const id = clean(idInput.value);
  if (!id) return;

  const targetIndex = state.items.findIndex((item) => item.id === activeId);
  if (targetIndex === -1) return;

  state.items[targetIndex] = {
    id,
    name: clean(nameInput.value) || undefined,
    status: clean(statusInput.value) || undefined,
    owner: clean(ownerInput.value) || undefined,
    description: clean(descriptionInput.value) || undefined,
  };
  activeId = id;
  renderList();
  updatePreview();
}

function addNewItem() {
  const newId = `item-${Date.now().toString(36)}`;
  const newItem = { id: newId, name: "New item", status: "draft" };
  state.items.unshift(newItem);
  selectItem(newId);
}

function resetForm() {
  const item = state.items.find((entry) => entry.id === activeId);
  if (!item) return;
  selectItem(item.id);
}

function copyJson() {
  navigator.clipboard
    .writeText(previewEl.value)
    .then(() => {
      copyBtn.textContent = "Copied";
      setTimeout(() => (copyBtn.textContent = "Copy"), 900);
    })
    .catch(() => {
      copyBtn.textContent = "Error";
      setTimeout(() => (copyBtn.textContent = "Copy"), 900);
    });
}

function downloadJson() {
  const blob = new Blob([previewEl.value], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "mock-data.json";
  link.click();
  URL.revokeObjectURL(url);
}

formEl.addEventListener("submit", (event) => {
  event.preventDefault();
  safeUpdateFromForm();
});

copyBtn.addEventListener("click", copyJson);
downloadBtn.addEventListener("click", downloadJson);
resetBtn.addEventListener("click", resetForm);
addBtn.addEventListener("click", addNewItem);

window.addEventListener("DOMContentLoaded", () => {
  renderList();
  if (activeId) {
    selectItem(activeId);
  } else if (state.items.length) {
    selectItem(state.items[0].id);
  }
  updatePreview();
});

