const STORAGE_KEY = "traceabilityMockData";
const WARNING_SIZE = 200000;
const PREVIEW_LINES = 100;
const ABNORMAL_WORDS = ["timeout", "retrans", "error", "crc", "drop"];

const state = {
  data: null,
  selectedStepId: null,
  selectedEvidenceId: null,
  searchText: "",
  searchOnly: false,
  showAllLines: false,
  abnormalMode: false,
};

const elements = {
  stepsList: document.getElementById("stepsList"),
  evidenceList: document.getElementById("evidenceList"),
  stepTitle: document.getElementById("stepTitle"),
  stepDescription: document.getElementById("stepDescription"),
  viewerMeta: document.getElementById("viewerMeta"),
  logContainer: document.getElementById("logContainer"),
  viewerFooter: document.getElementById("viewerFooter"),
  searchInput: document.getElementById("searchInput"),
  searchOnly: document.getElementById("searchOnly"),
  toggleAllLines: document.getElementById("toggleAllLines"),
  tcpdumpHeader: document.getElementById("tcpdumpHeader"),
  storageStatus: document.getElementById("storageStatus"),
  storageWarning: document.getElementById("storageWarning"),
};

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function highlightText(text, terms) {
  if (!terms || terms.length === 0) {
    return text;
  }
  const termList = Array.isArray(terms) ? terms : [terms];
  const escapedTerms = termList.map((term) =>
    term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  );
  const regex = new RegExp(escapedTerms.join("|"), "gi");
  return text.replace(regex, (match) => `<mark>${match}</mark>`);
}

function formatTeraTerm(line, searchTerms) {
  let html = escapeHtml(line);
  html = highlightText(html, searchTerms);
  html = html.replace(/^(\[[^\]]+\])/, "<strong>$1</strong>");
  html = html.replace(/\bERROR\b/gi, '<span class="severity">$&</span>');
  html = html.replace(/\bWARN\b/gi, '<span class="warn">$&</span>');
  html = html.replace(/\bRETRY\b/gi, '<span class="retry">$&</span>');
  return html;
}

function formatTcpdump(line, searchTerms) {
  let html = escapeHtml(line);
  html = highlightText(html, searchTerms);
  html = html.replace(/^(\s*0x[0-9a-fA-F]+:)/, '<span class="offset">$1</span>');
  return html;
}

function parseTcpdumpHeader(lines) {
  const headerIndex = lines.findIndex((line) => line.trim().length > 0);
  const header = headerIndex >= 0 ? lines[headerIndex] : "";
  if (!header) {
    return { headerLine: "", length: null, headerIndex: -1 };
  }
  const lengthMatch = header.match(/length\s+(\d+)/i);
  return {
    headerLine: header,
    length: lengthMatch ? lengthMatch[1] : null,
    headerIndex,
  };
}

function getSelectedStep() {
  return state.data?.steps?.find((step) => step.id === state.selectedStepId) || null;
}

function getSelectedEvidence() {
  const step = getSelectedStep();
  return step?.evidences?.find((ev) => ev.id === state.selectedEvidenceId) || null;
}

function updateStorageStatus(saved) {
  elements.storageStatus.textContent = saved
    ? "localStorage: 保存済み"
    : "localStorage: 未保存";
}

function saveToStorage() {
  if (!state.data) {
    return;
  }
  const payload = JSON.stringify(state.data);
  localStorage.setItem(STORAGE_KEY, payload);
  updateStorageStatus(true);
  elements.storageWarning.classList.toggle("hidden", payload.length <= WARNING_SIZE);
}

function loadFromStorage() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return null;
  }
  try {
    const parsed = JSON.parse(stored);
    updateStorageStatus(true);
    return parsed;
  } catch (error) {
    console.error("Failed to parse storage", error);
    return null;
  }
}

async function loadSampleData() {
  const response = await fetch("sample_data.json");
  const data = await response.json();
  state.data = data;
  state.selectedStepId = data.steps?.[0]?.id || null;
  state.selectedEvidenceId = data.steps?.[0]?.evidences?.[0]?.id || null;
  saveToStorage();
  renderAll();
}

function setData(data) {
  state.data = data;
  state.selectedStepId = data.steps?.[0]?.id || null;
  state.selectedEvidenceId = data.steps?.[0]?.evidences?.[0]?.id || null;
  saveToStorage();
  renderAll();
}

function renderSteps() {
  elements.stepsList.innerHTML = "";
  if (!state.data?.steps) {
    return;
  }
  state.data.steps.forEach((step) => {
    const item = document.createElement("li");
    item.textContent = step.title;
    item.classList.toggle("active", step.id === state.selectedStepId);
    item.addEventListener("click", () => {
      state.selectedStepId = step.id;
      state.selectedEvidenceId = step.evidences?.[0]?.id || null;
      renderAll();
    });
    elements.stepsList.appendChild(item);
  });
}

function renderStepDetails() {
  const step = getSelectedStep();
  if (!step) {
    elements.stepTitle.textContent = "Step";
    elements.stepDescription.textContent = "Stepを選択してください。";
    elements.evidenceList.innerHTML = "";
    return;
  }
  elements.stepTitle.textContent = step.title;
  elements.stepDescription.textContent = step.description || "";
  elements.evidenceList.innerHTML = "";
  step.evidences?.forEach((ev) => {
    const item = document.createElement("li");
    item.innerHTML = `<strong>${ev.name}</strong><br><span class="muted">${ev.format} / ${ev.tool}</span>`;
    item.classList.toggle("active", ev.id === state.selectedEvidenceId);
    item.addEventListener("click", () => {
      state.selectedEvidenceId = ev.id;
      renderViewer();
      renderStepDetails();
    });
    elements.evidenceList.appendChild(item);
  });
}

function renderViewerMeta(evidence) {
  if (!evidence) {
    elements.viewerMeta.innerHTML = "";
    return;
  }
  const lines = [
    `type: ${evidence.type || "log"}`,
    `contentMode: ${evidence.contentMode || "-"}`,
    `format: ${evidence.format}`,
    `tool: ${evidence.tool}`,
    `relativePath: ${evidence.relativePath || "(inline)"}`,
    `createdAt: ${evidence.createdAt || "-"}`,
    `extractionHint: ${evidence.extractionHint || "-"}`,
  ];
  elements.viewerMeta.innerHTML = lines.map((line) => `<div>${escapeHtml(line)}</div>`).join("");
}

function filterLines(lines, searchTerms, onlyMatches) {
  if (!searchTerms || searchTerms.length === 0) {
    return lines;
  }
  const termList = Array.isArray(searchTerms) ? searchTerms : [searchTerms];
  const normalized = termList.map((term) => term.toLowerCase());
  if (!onlyMatches) {
    return lines;
  }
  return lines.filter((line) =>
    normalized.some((term) => line.toLowerCase().includes(term))
  );
}

function renderLogLines(lines, evidence, searchTerms) {
  elements.logContainer.innerHTML = "";
  if (!lines.length) {
    elements.logContainer.textContent = "ログがありません。";
    return;
  }

  const formatLine = evidence.format === "teraterm" ? formatTeraTerm : formatTcpdump;
  lines.forEach((line, index) => {
    const lineEl = document.createElement("div");
    lineEl.className = "log-line";
    const numberEl = document.createElement("div");
    numberEl.className = "line-number";
    numberEl.textContent = String(index + 1).padStart(3, "0");
    const contentEl = document.createElement("div");
    contentEl.className = "log-content";
    contentEl.innerHTML = formatLine(line, searchTerms);
    lineEl.appendChild(numberEl);
    lineEl.appendChild(contentEl);
    elements.logContainer.appendChild(lineEl);
  });
}

function renderViewerFooter(lines, totalLines) {
  if (totalLines > lines.length) {
    elements.viewerFooter.textContent = `表示中: ${lines.length} / ${totalLines} 行`;
  } else {
    elements.viewerFooter.textContent = `表示中: ${lines.length} 行`;
  }
}

function renderTcpdumpHeader(lines) {
  const { headerLine, length } = parseTcpdumpHeader(lines);
  if (!headerLine) {
    elements.tcpdumpHeader.classList.add("hidden");
    elements.tcpdumpHeader.textContent = "";
    return;
  }
  const lengthInfo = length ? `Length: ${length} bytes` : "Length: (unknown)";
  elements.tcpdumpHeader.textContent = `${headerLine}\n${lengthInfo}`;
  elements.tcpdumpHeader.classList.remove("hidden");
}

function renderViewer() {
  const evidence = getSelectedEvidence();
  renderViewerMeta(evidence);
  elements.tcpdumpHeader.classList.add("hidden");
  elements.toggleAllLines.classList.add("hidden");

  if (!evidence) {
    elements.logContainer.textContent = "証跡を選択してください。";
    elements.viewerFooter.textContent = "";
    return;
  }

  const inlineText = evidence.inlineText || "";
  const allLines = inlineText.split(/\r?\n/);
  const searchTerms = state.abnormalMode
    ? ABNORMAL_WORDS
    : state.searchText.trim()
    ? [state.searchText.trim()]
    : [];
  const filteredLines = filterLines(allLines, searchTerms, state.searchOnly);
  let linesToRender = filteredLines;
  let renderLines = linesToRender;
  let totalLines = filteredLines.length;

  if (!state.showAllLines && filteredLines.length > PREVIEW_LINES) {
    linesToRender = filteredLines.slice(0, PREVIEW_LINES);
    elements.toggleAllLines.classList.remove("hidden");
  }

  elements.toggleAllLines.textContent = state.showAllLines ? "先頭100行" : "全文表示";

  if (evidence.format === "tcpdump_x") {
    const { headerLine } = parseTcpdumpHeader(allLines);
    renderTcpdumpHeader(allLines);
    let removed = false;
    renderLines = linesToRender.filter((line) => {
      if (!removed && line === headerLine) {
        removed = true;
        return false;
      }
      return true;
    });
    if (removed) {
      totalLines = Math.max(totalLines - 1, 0);
    }
  }

  renderLogLines(renderLines, evidence, searchTerms);
  renderViewerFooter(renderLines, totalLines);
}

function renderAll() {
  renderSteps();
  renderStepDetails();
  renderViewer();
}

function applyAbnormalExtract() {
  const evidence = getSelectedEvidence();
  if (!evidence) {
    return;
  }
  state.searchText = "";
  elements.searchInput.value = "";
  state.abnormalMode = true;
  state.searchOnly = true;
  elements.searchOnly.checked = true;
  renderViewer();
}

function setupEventListeners() {
  document.getElementById("exportJson").addEventListener("click", () => {
    if (!state.data) {
      return;
    }
    const blob = new Blob([JSON.stringify(state.data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "traceability_data.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  });

  document.getElementById("importJson").addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    const text = await file.text();
    try {
      const parsed = JSON.parse(text);
      setData(parsed);
    } catch (error) {
      alert("JSONの読み込みに失敗しました。");
      console.error(error);
    }
  });

  document.getElementById("resetSample").addEventListener("click", () => {
    loadSampleData();
  });

  elements.searchInput.addEventListener("input", (event) => {
    state.searchText = event.target.value;
    state.abnormalMode = false;
    renderViewer();
  });

  elements.searchOnly.addEventListener("change", (event) => {
    state.searchOnly = event.target.checked;
    renderViewer();
  });

  elements.toggleAllLines.addEventListener("click", () => {
    state.showAllLines = !state.showAllLines;
    renderViewer();
  });

  document.getElementById("abnormalExtract").addEventListener("click", () => {
    applyAbnormalExtract();
  });
}

async function init() {
  const stored = loadFromStorage();
  if (stored) {
    setData(stored);
  } else {
    await loadSampleData();
  }
  setupEventListeners();
}

init();
