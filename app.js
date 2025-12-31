const flows = [
  {
    id: "flow-pdf-fast",
    title: "Markdown → Marp ですぐPDF化",
    summary: "短時間でPDF資料に変換したい場合の最短ルート",
    category: ["pdf", "quick"],
    nodes: ["md-prepare", "marp-preview", "marp-export"],
  },
  {
    id: "flow-canva-slide",
    title: "Markdown → Canva でスライド仕上げ",
    summary: "見た目重視でデザインを整えたいとき",
    category: ["design", "ipad"],
    nodes: ["md-prepare", "canva-import", "canva-design", "canva-export"],
  },
  {
    id: "flow-figma",
    title: "Markdown → Figma で共同編集",
    summary: "チームで設計・レビューしながら資料を作る",
    category: ["design", "collab"],
    nodes: ["md-prepare", "figma-frame", "figma-design", "figma-export"],
  },
  {
    id: "flow-ipad",
    title: "iPad 完結フロー",
    summary: "iPad mini だけで資料制作を完結させる",
    category: ["ipad"],
    nodes: ["md-prepare", "notion-outline", "canva-design", "canva-export"],
  },
  {
    id: "flow-ai",
    title: "AI で再構成してからデザイン",
    summary: "AI で構成を整えてから外部デザインへ",
    category: ["ai", "design"],
    nodes: ["md-prepare", "ai-structure", "canva-design", "canva-export"],
  },
];

const nodes = {
  "md-prepare": {
    id: "md-prepare",
    label: "Markdown 整理",
    role: "note",
    description: "構成を整理して、見出しと本文を整える段階",
    purpose: "素材準備",
    input: "アイデア・メモ",
    output: "整理済み Markdown",
    caution: "1スライド1メッセージを意識する",
    externalUrl: "https://www.markdownguide.org/basic-syntax/",
  },
  "marp-preview": {
    id: "marp-preview",
    label: "Marp でプレビュー",
    role: "note",
    description: "Marp のテンプレートで見え方を確認",
    purpose: "レイアウト確認",
    input: "Markdown",
    output: "スライドプレビュー",
    caution: "テーマに合わせて改行量を調整",
    externalUrl: "https://marp.app/",
  },
  "marp-export": {
    id: "marp-export",
    label: "PDF 出力",
    role: "output",
    description: "Marp からPDFを出力",
    purpose: "配布用資料作成",
    input: "Marp スライド",
    output: "PDF",
    caution: "余白やフォント埋め込みを確認",
    externalUrl: "https://marp.app/",
  },
  "canva-import": {
    id: "canva-import",
    label: "Canva に貼り付け",
    role: "note",
    description: "Markdown の内容をCanvaのテキストへ流し込み",
    purpose: "素材移行",
    input: "整理済み Markdown",
    output: "Canva テキスト",
    caution: "見出しごとにページを分割",
    externalUrl: "https://www.canva.com/",
  },
  "canva-design": {
    id: "canva-design",
    label: "Canva でデザイン",
    role: "design",
    description: "テンプレートを使いながら装飾を調整",
    purpose: "デザイン作成",
    input: "テキスト素材",
    output: "Canva デザイン",
    caution: "文字量は控えめに",
    externalUrl: "https://www.canva.com/",
  },
  "canva-export": {
    id: "canva-export",
    label: "Canva で書き出し",
    role: "output",
    description: "PDF または PPTX で書き出し",
    purpose: "共有用データ出力",
    input: "Canva デザイン",
    output: "PDF / PPTX",
    caution: "用途に合わせて形式を選択",
    externalUrl: "https://www.canva.com/",
  },
  "figma-frame": {
    id: "figma-frame",
    label: "Figma フレーム準備",
    role: "note",
    description: "スライドサイズのフレームを作成",
    purpose: "構成準備",
    input: "Markdown",
    output: "Figma フレーム",
    caution: "サイズは16:9を基準に",
    externalUrl: "https://www.figma.com/",
  },
  "figma-design": {
    id: "figma-design",
    label: "Figma デザイン",
    role: "design",
    description: "コンポーネントを使いデザインを調整",
    purpose: "共同編集",
    input: "フレーム",
    output: "デザイン資料",
    caution: "コメント機能でレビューを残す",
    externalUrl: "https://www.figma.com/",
  },
  "figma-export": {
    id: "figma-export",
    label: "Figma 書き出し",
    role: "output",
    description: "PDF や PNG として書き出し",
    purpose: "配布用出力",
    input: "Figma デザイン",
    output: "PDF / PNG",
    caution: "ページ単位で書き出し設定",
    externalUrl: "https://www.figma.com/",
  },
  "notion-outline": {
    id: "notion-outline",
    label: "Notion で構成整理",
    role: "note",
    description: "iPad で構成を調整しながら整理",
    purpose: "アウトライン作成",
    input: "Markdown",
    output: "整理済み構成",
    caution: "見出し階層を明確に",
    externalUrl: "https://www.notion.so/",
  },
  "ai-structure": {
    id: "ai-structure",
    label: "AI で再構成",
    role: "note",
    description: "AI ツールで構成や表現をブラッシュアップ",
    purpose: "構成調整",
    input: "Markdown",
    output: "再構成されたテキスト",
    caution: "最終チェックは人が行う",
    externalUrl: "https://chat.openai.com/",
  },
};

const tools = [
  {
    name: "Marp",
    role: "変換",
    usage: "Markdown から PDF / PPTX",
    device: "PC",
    flows: ["flow-pdf-fast"],
  },
  {
    name: "Canva",
    role: "デザイン",
    usage: "テンプレートで仕上げ",
    device: "iPad / PC",
    flows: ["flow-canva-slide", "flow-ipad", "flow-ai"],
  },
  {
    name: "Figma",
    role: "デザイン / 共同編集",
    usage: "チームで構成レビュー",
    device: "PC",
    flows: ["flow-figma"],
  },
  {
    name: "Notion",
    role: "構成整理",
    usage: "アウトライン共有",
    device: "iPad / PC",
    flows: ["flow-ipad"],
  },
  {
    name: "AI Assist",
    role: "AI 補助",
    usage: "構成の再構成",
    device: "PC / iPad",
    flows: ["flow-ai"],
  },
];

const state = {
  view: "home",
  flowId: flows[0].id,
  nodeId: flows[0].nodes[0],
};

const viewButtons = document.querySelectorAll(".nav-button");
const views = document.querySelectorAll(".view");

const flowGrid = document.getElementById("flow-grid");
const detailTitle = document.getElementById("detail-title");
const detailSummary = document.getElementById("detail-summary");
const detailTags = document.getElementById("detail-tags");
const flowNodes = document.getElementById("flow-nodes");
const nodeTitle = document.getElementById("node-title");
const nodeDescription = document.getElementById("node-description");
const nodePurpose = document.getElementById("node-purpose");
const nodeInput = document.getElementById("node-input");
const nodeOutput = document.getElementById("node-output");
const nodeCaution = document.getElementById("node-caution");
const nodeLink = document.getElementById("node-link");
const toolsGrid = document.getElementById("tools-grid");

const roleLabel = {
  note: "記述",
  design: "デザイン",
  output: "出力",
};

function setView(nextView) {
  state.view = nextView;
  views.forEach((view) => {
    view.classList.toggle("active", view.id === nextView);
  });
  viewButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.view === nextView);
  });
  if (nextView === "detail") {
    renderDetail();
  }
}

function selectFlow(flowId) {
  const flow = flows.find((item) => item.id === flowId);
  if (!flow) return;
  state.flowId = flowId;
  state.nodeId = flow.nodes[0];
  setView("detail");
}

function selectNode(nodeId) {
  state.nodeId = nodeId;
  renderDetail();
}

function renderHome() {
  flowGrid.innerHTML = "";
  flows.forEach((flow) => {
    const card = document.createElement("article");
    card.className = "flow-card";

    const title = document.createElement("div");
    title.className = "tagline";
    title.textContent = flow.title;

    const summary = document.createElement("p");
    summary.textContent = flow.summary;

    const button = document.createElement("button");
    button.type = "button";
    button.textContent = "フローを見る";
    button.addEventListener("click", () => selectFlow(flow.id));

    card.append(title, summary, button);
    flowGrid.appendChild(card);
  });
}

function renderDetail() {
  const flow = flows.find((item) => item.id === state.flowId);
  if (!flow) return;

  detailTitle.textContent = flow.title;
  detailSummary.textContent = flow.summary;
  detailTags.innerHTML = "";
  flow.category.forEach((tag) => {
    const span = document.createElement("span");
    span.className = "tag";
    span.textContent = tag;
    detailTags.appendChild(span);
  });

  flowNodes.innerHTML = "";
  flow.nodes.forEach((nodeId) => {
    const node = nodes[nodeId];
    if (!node) return;
    const card = document.createElement("button");
    card.type = "button";
    card.className = `node-card ${state.nodeId === nodeId ? "active" : ""}`;
    card.addEventListener("click", () => selectNode(nodeId));

    const label = document.createElement("strong");
    label.textContent = node.label;

    const pill = document.createElement("div");
    pill.className = `node-pill role-${node.role}`;
    const dot = document.createElement("span");
    const text = document.createElement("span");
    text.textContent = roleLabel[node.role];
    pill.append(dot, text);

    const detail = document.createElement("p");
    detail.textContent = node.description;
    detail.className = "muted";

    card.append(label, pill, detail);
    flowNodes.appendChild(card);
  });

  const activeNode = nodes[state.nodeId];
  if (!activeNode) return;

  nodeTitle.textContent = activeNode.label;
  nodeDescription.textContent = activeNode.description;
  nodePurpose.textContent = activeNode.purpose;
  nodeInput.textContent = activeNode.input;
  nodeOutput.textContent = activeNode.output;
  nodeCaution.textContent = activeNode.caution;
  nodeLink.href = activeNode.externalUrl;
}

function renderTools() {
  toolsGrid.innerHTML = "";
  tools.forEach((tool) => {
    const card = document.createElement("article");
    card.className = "tool-card";

    const title = document.createElement("h3");
    title.textContent = tool.name;

    const role = document.createElement("p");
    role.textContent = `役割: ${tool.role}`;

    const usage = document.createElement("p");
    usage.textContent = `向いている用途: ${tool.usage}`;

    const device = document.createElement("p");
    device.textContent = `対応デバイス: ${tool.device}`;

    const tags = document.createElement("div");
    tags.className = "tool-tags";
    tool.flows.forEach((flowId) => {
      const flow = flows.find((item) => item.id === flowId);
      if (!flow) return;
      const tag = document.createElement("button");
      tag.type = "button";
      tag.className = "tool-tag";
      tag.textContent = flow.title;
      tag.addEventListener("click", () => selectFlow(flowId));
      tags.appendChild(tag);
    });

    card.append(title, role, usage, device, tags);
    toolsGrid.appendChild(card);
  });
}

viewButtons.forEach((button) => {
  button.addEventListener("click", () => setView(button.dataset.view));
});

renderHome();
renderTools();
setView(state.view);
