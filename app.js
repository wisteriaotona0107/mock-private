const storageKey = "traceability_db_v1";

const sampleData = {
  requirements: [
    {
      id: "REQ-UART-001",
      title: "UART連続ログ出力の欠落防止",
      description: "921600bpsで連続送信してもRingBufferあふれで欠落しないこと",
      priority: "High",
      status: "InProgress",
      category: "UART",
      environment: "Board Rev.B / FW v1.3.2 / Baudrate 921600 / FreeRTOS",
      tags: ["ISR", "RingBuffer"]
    },
    {
      id: "REQ-UART-002",
      title: "UARTタイムアウト再送",
      description: "タイムアウト時に最大3回まで再送する",
      priority: "High",
      status: "Fail",
      category: "UART",
      environment: "Board Rev.B / FW v1.3.2 / Baudrate 115200 / FreeRTOS",
      tags: ["Timeout", "Retry"]
    },
    {
      id: "REQ-CAN-010",
      title: "CAN IDフィルタリング",
      description: "対象IDのみを受信し、それ以外は破棄",
      priority: "Medium",
      status: "Pass",
      category: "CAN",
      environment: "Board Rev.A / FW v1.3.1 / 500kbps",
      tags: ["Filter"]
    },
    {
      id: "REQ-ETH-005",
      title: "UDPパケットロス率1%未満",
      description: "負荷試験時もUDPロス率1%未満",
      priority: "High",
      status: "Fail",
      category: "ETH",
      environment: "Board Rev.B / FW v1.3.2 / 100Base-T",
      tags: ["UDP", "Perf"]
    },
    {
      id: "REQ-RTOS-003",
      title: "タスク遅延監視",
      description: "周期タスクの遅延を5ms以内に収める",
      priority: "Medium",
      status: "InProgress",
      category: "RTOS",
      environment: "FreeRTOS / Tick 1ms",
      tags: ["Scheduler"]
    },
    {
      id: "REQ-BOOT-001",
      title: "起動時間2秒以内",
      description: "Power OnからApp起動まで2秒以内",
      priority: "Low",
      status: "Pass",
      category: "Boot",
      environment: "Board Rev.A / FW v1.3.1",
      tags: ["Boot"]
    },
    {
      id: "REQ-MEM-002",
      title: "DMAバッファオーバーラン防止",
      description: "DMA転送でバッファオーバーランを検出",
      priority: "High",
      status: "InProgress",
      category: "Memory",
      environment: "Board Rev.B / FW v1.3.2",
      tags: ["DMA", "Overflow"]
    },
    {
      id: "REQ-POWER-004",
      title: "低電圧検知",
      description: "電圧降下時に安全停止",
      priority: "Medium",
      status: "NotRun",
      category: "Power",
      environment: "Board Rev.A / FW v1.3.1",
      tags: ["Safety"]
    }
  ],
  designs: [
    {
      id: "DES-UART-01",
      name: "UART RX RingBuffer",
      notes: "RX ISRでRingBuffer pushしTaskで処理",
      mermaidText: "sequenceDiagram\nUART->>ISR: RX interrupt\nISR->>RingBuffer: push\nTask->>RingBuffer: pop",
      linkedRequirementIds: ["REQ-UART-001", "REQ-UART-002"],
      steps: [
        { stepId: "S-010", label: "UART RX割り込み→RingBuffer push", kind: "ISR", lineRange: "12-18" },
        { stepId: "S-020", label: "ConsoleTaskで解析→ログ出力", kind: "Task", lineRange: "34-55" }
      ]
    },
    {
      id: "DES-ETH-02",
      name: "UDP Rx監視",
      notes: "lwIP受信コールバックで統計",
      mermaidText: "sequenceDiagram\nETH->>lwIP: RX\nlwIP->>StatsTask: enqueue\nStatsTask->>Logger: update",
      linkedRequirementIds: ["REQ-ETH-005"],
      steps: [
        { stepId: "S-110", label: "lwIP RXコールバック", kind: "Driver", lineRange: "88-95" },
        { stepId: "S-120", label: "StatsTaskでロス率計算", kind: "Task", lineRange: "120-150" }
      ]
    },
    {
      id: "DES-CAN-01",
      name: "CAN ID Filter",
      notes: "Filter設定と受信割り込み",
      mermaidText: "sequenceDiagram\nCAN->>Driver: Rx\nDriver->>App: Accept Only IDs",
      linkedRequirementIds: ["REQ-CAN-010"],
      steps: [
        { stepId: "S-210", label: "CANフィルタ設定", kind: "Driver", lineRange: "20-32" }
      ]
    }
  ],
  testcases: [
    {
      id: "TC-UART-010",
      title: "UART連続出力耐性",
      preconditions: "TeraTermで連続出力。バッファサイズ 4KB",
      stepsText: "1. 5分間連続送信\n2. 欠落率を計測",
      expected: "欠落率0%",
      status: "Fail",
      metricsFocus: "ドロップ率%、バッファ使用率%",
      linkedRequirementIds: ["REQ-UART-001"],
      linkedDesignRefs: [{ designId: "DES-UART-01", stepId: "S-010" }]
    },
    {
      id: "TC-UART-020",
      title: "UARTタイムアウト再送",
      preconditions: "相手機器の応答遅延を300msに設定",
      stepsText: "1. コマンド送信\n2. 応答がない場合に再送回数を確認",
      expected: "最大3回再送",
      status: "Fail",
      metricsFocus: "再送回数、タイムアウトms",
      linkedRequirementIds: ["REQ-UART-002"],
      linkedDesignRefs: [{ designId: "DES-UART-01", stepId: "S-020" }]
    },
    {
      id: "TC-CAN-010",
      title: "CANフィルタ確認",
      preconditions: "対象ID:0x120/0x121",
      stepsText: "1. 0x120と0x200を送信\n2. 0x200が破棄されること",
      expected: "非対象IDは破棄",
      status: "Pass",
      metricsFocus: "受信ID比率",
      linkedRequirementIds: ["REQ-CAN-010"],
      linkedDesignRefs: [{ designId: "DES-CAN-01", stepId: "S-210" }]
    },
    {
      id: "TC-ETH-005",
      title: "UDPロス率",
      preconditions: "iperf + 独自ツールで1万pkt送信",
      stepsText: "1. UDP送信\n2. ロス率算出",
      expected: "ロス率1%未満",
      status: "Fail",
      metricsFocus: "ロス率%、遅延ms",
      linkedRequirementIds: ["REQ-ETH-005"],
      linkedDesignRefs: [{ designId: "DES-ETH-02", stepId: "S-120" }]
    },
    {
      id: "TC-RTOS-003",
      title: "タスク遅延監視",
      preconditions: "CPU負荷70%",
      stepsText: "1. 1分監視\n2. 5ms超をカウント",
      expected: "5ms超は0件",
      status: "NotRun",
      metricsFocus: "遅延ms",
      linkedRequirementIds: ["REQ-RTOS-003"],
      linkedDesignRefs: []
    },
    {
      id: "TC-BOOT-001",
      title: "起動時間計測",
      preconditions: "電源OFFから起動",
      stepsText: "1. 電源ON\n2. ロゴ表示まで計測",
      expected: "2秒以内",
      status: "Pass",
      metricsFocus: "起動時間ms",
      linkedRequirementIds: ["REQ-BOOT-001"],
      linkedDesignRefs: []
    },
    {
      id: "TC-MEM-002",
      title: "DMAバッファ監視",
      preconditions: "DMA転送負荷最大",
      stepsText: "1. DMA連続転送\n2. エラー検知確認",
      expected: "オーバーラン検知",
      status: "NotRun",
      metricsFocus: "バッファ使用率%",
      linkedRequirementIds: ["REQ-MEM-002"],
      linkedDesignRefs: []
    },
    {
      id: "TC-POWER-004",
      title: "低電圧検知",
      preconditions: "電源電圧を低下",
      stepsText: "1. 3.0Vに低下\n2. 安全停止を確認",
      expected: "安全停止ログ出力",
      status: "NotRun",
      metricsFocus: "電圧V",
      linkedRequirementIds: ["REQ-POWER-004"],
      linkedDesignRefs: []
    }
  ],
  evidences: [
    {
      id: "EV-20260207-001",
      type: "serial_log",
      description: "UART連続出力ログ（欠落あり）",
      relativePath: "./evidence/uart/2026-02-07/teraterm.log",
      createdAt: "2026-02-07",
      tool: "TeraTerm",
      extractionHint: "grep -n ""DROP""",
      linkedTestcaseIds: ["TC-UART-010"],
      linkedDesignRefs: [{ designId: "DES-UART-01", stepId: "S-010" }]
    },
    {
      id: "EV-20260207-002",
      type: "waveform",
      description: "UART RX FIFOオーバーラン波形",
      relativePath: "./evidence/uart/2026-02-07/uart_fifo.png",
      createdAt: "2026-02-07",
      tool: "Logic Analyzer",
      extractionHint: "Trigger: RX overflow",
      linkedTestcaseIds: ["TC-UART-010"],
      linkedDesignRefs: [{ designId: "DES-UART-01", stepId: "S-010" }]
    },
    {
      id: "EV-20260208-001",
      type: "serial_log",
      description: "UART再送ログ（再送4回発生）",
      relativePath: "./evidence/uart/2026-02-08/retry.log",
      createdAt: "2026-02-08",
      tool: "TeraTerm",
      extractionHint: "grep -n ""retry""",
      linkedTestcaseIds: ["TC-UART-020"],
      linkedDesignRefs: [{ designId: "DES-UART-01", stepId: "S-020" }]
    },
    {
      id: "EV-20260208-002",
      type: "csv",
      description: "UART再送回数集計",
      relativePath: "./evidence/uart/2026-02-08/retry_count.csv",
      createdAt: "2026-02-08",
      tool: "Python script",
      extractionHint: "awk -F,",
      linkedTestcaseIds: ["TC-UART-020"],
      linkedDesignRefs: []
    },
    {
      id: "EV-20260206-003",
      type: "pcap",
      description: "UDPロス試験pcap",
      relativePath: "./evidence/eth/2026-02-06/udp_loss.pcap",
      createdAt: "2026-02-06",
      tool: "Wireshark",
      extractionHint: "tshark -Y ""udp""",
      linkedTestcaseIds: ["TC-ETH-005"],
      linkedDesignRefs: [{ designId: "DES-ETH-02", stepId: "S-120" }]
    },
    {
      id: "EV-20260206-004",
      type: "csv",
      description: "UDPロス率集計",
      relativePath: "./evidence/eth/2026-02-06/udp_loss.csv",
      createdAt: "2026-02-06",
      tool: "Wireshark + Excel",
      extractionHint: "tshark -T fields",
      linkedTestcaseIds: ["TC-ETH-005"],
      linkedDesignRefs: []
    },
    {
      id: "EV-20260205-001",
      type: "serial_log",
      description: "CANフィルタ受信ログ",
      relativePath: "./evidence/can/2026-02-05/can.log",
      createdAt: "2026-02-05",
      tool: "CANoe",
      extractionHint: "filter ID=0x200",
      linkedTestcaseIds: ["TC-CAN-010"],
      linkedDesignRefs: [{ designId: "DES-CAN-01", stepId: "S-210" }]
    },
    {
      id: "EV-20260205-002",
      type: "screenshot",
      description: "CAN filter GUI画面",
      relativePath: "./evidence/can/2026-02-05/filter.png",
      createdAt: "2026-02-05",
      tool: "CANoe",
      extractionHint: "",
      linkedTestcaseIds: ["TC-CAN-010"],
      linkedDesignRefs: []
    },
    {
      id: "EV-20260204-001",
      type: "serial_log",
      description: "Bootログ",
      relativePath: "./evidence/boot/2026-02-04/boot.log",
      createdAt: "2026-02-04",
      tool: "UART Logger",
      extractionHint: "grep -n ""BOOT""",
      linkedTestcaseIds: ["TC-BOOT-001"],
      linkedDesignRefs: []
    },
    {
      id: "EV-20260203-001",
      type: "serial_log",
      description: "RTOSタスク遅延ログ（未解析）",
      relativePath: "./evidence/rtos/2026-02-03/task_delay.log",
      createdAt: "2026-02-03",
      tool: "Tracealyzer",
      extractionHint: "",
      linkedTestcaseIds: [],
      linkedDesignRefs: []
    },
    {
      id: "EV-20260202-001",
      type: "waveform",
      description: "DMAバッファ波形",
      relativePath: "./evidence/mem/2026-02-02/dma_wave.png",
      createdAt: "2026-02-02",
      tool: "oscilloscope",
      extractionHint: "",
      linkedTestcaseIds: [],
      linkedDesignRefs: []
    },
    {
      id: "EV-20260201-001",
      type: "link",
      description: "外部チケット: ETHドロップ解析",
      relativePath: "https://example.com/ticket/ETH-99",
      createdAt: "2026-02-01",
      tool: "JIRA",
      extractionHint: "",
      linkedTestcaseIds: ["TC-ETH-005"],
      linkedDesignRefs: []
    }
  ],
  history: []
};

let state = loadState();
let currentView = "dashboard";
let currentEdit = { type: null, id: null };

const viewIds = ["dashboard", "requirements", "designs", "testcases", "evidences", "trace"];

const toast = document.getElementById("toast");

function showToast(message) {
  toast.textContent = message;
  toast.classList.remove("hidden");
  setTimeout(() => toast.classList.add("hidden"), 2000);
}

function loadState() {
  const raw = localStorage.getItem(storageKey);
  if (!raw) {
    return structuredClone(sampleData);
  }
  try {
    const data = JSON.parse(raw);
    return normalizeState(data);
  } catch (error) {
    console.warn("Failed to parse stored data", error);
    return structuredClone(sampleData);
  }
}

function normalizeState(data) {
  const base = {
    requirements: [],
    designs: [],
    testcases: [],
    evidences: [],
    history: []
  };
  return { ...base, ...data };
}

function saveState() {
  localStorage.setItem(storageKey, JSON.stringify(state, null, 2));
}

function setView(view) {
  currentView = view;
  render();
}

function render() {
  viewIds.forEach((id) => {
    document.getElementById(`view-${id}`).classList.toggle("hidden", id !== currentView);
    document.querySelector(`.nav-btn[data-view="${id}"]`).classList.toggle("active", id === currentView);
  });
  renderDashboard();
  renderRequirements();
  renderDesigns();
  renderTestcases();
  renderEvidences();
  renderTraceability();
}

function renderDashboard() {
  const root = document.getElementById("view-dashboard");
  const failTests = state.testcases.filter((tc) => tc.status === "Fail").length;
  const orphanRequirements = state.requirements.filter((req) => getDesignsByRequirement(req.id).length === 0).length;
  const orphanTests = state.testcases.filter((tc) => tc.linkedRequirementIds.length === 0 && tc.linkedDesignRefs.length === 0).length;
  const orphanEvidence = state.evidences.filter((ev) => ev.linkedTestcaseIds.length === 0).length;
  const recentLogs = [...state.evidences]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  root.innerHTML = `
    <div class="dashboard-grid">
      <div class="card">
        <h3>Requirements</h3>
        <div class="metric">${state.requirements.length}</div>
      </div>
      <div class="card">
        <h3>Testcases</h3>
        <div class="metric">${state.testcases.length}</div>
      </div>
      <div class="card">
        <h3>Evidences</h3>
        <div class="metric">${state.evidences.length}</div>
      </div>
      <div class="card">
        <h3>Fail件数</h3>
        <div class="metric trace-highlight">${failTests}</div>
      </div>
      <div class="card">
        <h3>未紐付け</h3>
        <div class="metric">${orphanRequirements + orphanTests + orphanEvidence}</div>
      </div>
    </div>
    <div class="split-layout">
      <div class="card">
        <h3>異常系への導線</h3>
        <p>Fail / NotRun の試験と、証跡に紐付いていない要件をすばやく抽出。</p>
        <div class="action-group">
          <button onclick="setView('testcases')">Fail / NotRun試験へ</button>
          <button class="secondary" onclick="setView('trace')">Traceabilityで孤立検知</button>
        </div>
      </div>
      <div class="card">
        <h3>直近の試験ログ</h3>
        <table class="table">
          <thead>
            <tr><th>ID</th><th>種別</th><th>説明</th><th>日付</th></tr>
          </thead>
          <tbody>
            ${recentLogs
              .map(
                (ev) => `
              <tr>
                <td>${ev.id}</td>
                <td>${ev.type}</td>
                <td>${ev.description}</td>
                <td>${ev.createdAt}</td>
              </tr>`
              )
              .join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderRequirements() {
  const root = document.getElementById("view-requirements");
  root.innerHTML = `
    <div class="split-layout">
      <div>
        <table class="table">
          <thead>
            <tr>
              <th>ID</th><th>タイトル</th><th>優先度</th><th>ステータス</th><th>カテゴリ</th><th>操作</th>
            </tr>
          </thead>
          <tbody>
            ${state.requirements
              .map(
                (req) => `
              <tr>
                <td>${req.id}</td>
                <td>${req.title}</td>
                <td>${req.priority}</td>
                <td><span class="status-chip ${req.status === "Fail" ? "fail" : req.status === "Pass" ? "pass" : req.status === "NotRun" ? "notrun" : ""}">${req.status}</span></td>
                <td>${req.category}</td>
                <td>
                  <button class="secondary" data-action="edit" data-type="requirements" data-id="${req.id}">編集</button>
                  <button class="danger" data-action="delete" data-type="requirements" data-id="${req.id}">削除</button>
                </td>
              </tr>`
              )
              .join("")}
          </tbody>
        </table>
      </div>
      <div class="form-panel">
        <h3>Requirement ${currentEdit.type === "requirements" ? "編集" : "追加"}</h3>
        <div class="form-row">
          <label>ID</label>
          <input id="req-id" value="${currentEdit.type === "requirements" ? getById("requirements", currentEdit.id).id : ""}" />
        </div>
        <div class="form-row">
          <label>タイトル</label>
          <input id="req-title" value="${currentEdit.type === "requirements" ? getById("requirements", currentEdit.id).title : ""}" />
        </div>
        <div class="form-row">
          <label>概要</label>
          <textarea id="req-description">${currentEdit.type === "requirements" ? getById("requirements", currentEdit.id).description : ""}</textarea>
        </div>
        <div class="form-row">
          <label>優先度</label>
          <select id="req-priority">
            ${["High", "Medium", "Low"].map((p) => `<option ${currentEdit.type === "requirements" && getById("requirements", currentEdit.id).priority === p ? "selected" : ""}>${p}</option>`).join("")}
          </select>
        </div>
        <div class="form-row">
          <label>ステータス</label>
          <select id="req-status">
            ${["NotRun", "InProgress", "Pass", "Fail"].map((s) => `<option ${currentEdit.type === "requirements" && getById("requirements", currentEdit.id).status === s ? "selected" : ""}>${s}</option>`).join("")}
          </select>
        </div>
        <div class="form-row">
          <label>カテゴリ</label>
          <input id="req-category" value="${currentEdit.type === "requirements" ? getById("requirements", currentEdit.id).category : ""}" placeholder="UART/CAN/ETH/Power" />
        </div>
        <div class="form-row">
          <label>想定環境</label>
          <textarea id="req-environment">${currentEdit.type === "requirements" ? getById("requirements", currentEdit.id).environment : ""}</textarea>
        </div>
        <div class="form-row">
          <label>タグ (カンマ区切り)</label>
          <input id="req-tags" value="${currentEdit.type === "requirements" ? getById("requirements", currentEdit.id).tags.join(", ") : ""}" />
        </div>
        <div class="action-group">
          <button id="req-save">保存</button>
          <button class="secondary" id="req-clear">クリア</button>
        </div>
        <p class="helper" id="req-error"></p>
      </div>
    </div>
  `;
}

function renderDesigns() {
  const root = document.getElementById("view-designs");
  root.innerHTML = `
    <div class="split-layout">
      <div>
        <table class="table">
          <thead>
            <tr>
              <th>ID</th><th>名称</th><th>関連要件</th><th>操作</th>
            </tr>
          </thead>
          <tbody>
            ${state.designs
              .map(
                (design) => `
              <tr>
                <td>${design.id}</td>
                <td>${design.name}</td>
                <td>${design.linkedRequirementIds.map((id) => `<span class="badge">${id}</span>`).join("")}</td>
                <td>
                  <button class="secondary" data-action="edit" data-type="designs" data-id="${design.id}">編集</button>
                  <button class="danger" data-action="delete" data-type="designs" data-id="${design.id}">削除</button>
                </td>
              </tr>`
              )
              .join("")}
          </tbody>
        </table>
      </div>
      <div class="form-panel">
        <h3>Design ${currentEdit.type === "designs" ? "編集" : "追加"}</h3>
        <div class="form-row">
          <label>ID</label>
          <input id="design-id" value="${currentEdit.type === "designs" ? getById("designs", currentEdit.id).id : ""}" />
        </div>
        <div class="form-row">
          <label>名称</label>
          <input id="design-name" value="${currentEdit.type === "designs" ? getById("designs", currentEdit.id).name : ""}" />
        </div>
        <div class="form-row">
          <label>関連要件IDs (カンマ区切り)</label>
          <input id="design-reqs" value="${currentEdit.type === "designs" ? getById("designs", currentEdit.id).linkedRequirementIds.join(", ") : ""}" />
        </div>
        <div class="form-row">
          <label>設計ノート</label>
          <textarea id="design-notes">${currentEdit.type === "designs" ? getById("designs", currentEdit.id).notes : ""}</textarea>
        </div>
        <div class="form-row">
          <label>シーケンス図風テキスト</label>
          <textarea id="design-mermaid">${currentEdit.type === "designs" ? getById("designs", currentEdit.id).mermaidText : ""}</textarea>
        </div>
        <div class="form-row">
          <label>設計ステップ (JSON形式)</label>
          <textarea id="design-steps">${currentEdit.type === "designs" ? JSON.stringify(getById("designs", currentEdit.id).steps, null, 2) : "[]"}</textarea>
          <span class="helper">例: [{"stepId":"S-010","label":"UART RX割り込み→RingBuffer push","kind":"ISR","lineRange":"12-18"}]</span>
        </div>
        <div class="action-group">
          <button id="design-save">保存</button>
          <button class="secondary" id="design-clear">クリア</button>
        </div>
        <p class="helper" id="design-error"></p>
      </div>
    </div>
  `;
}

function renderTestcases() {
  const root = document.getElementById("view-testcases");
  root.innerHTML = `
    <div class="split-layout">
      <div>
        <table class="table">
          <thead>
            <tr>
              <th>ID</th><th>タイトル</th><th>ステータス</th><th>関連要件</th><th>操作</th>
            </tr>
          </thead>
          <tbody>
            ${state.testcases
              .map(
                (tc) => `
              <tr>
                <td>${tc.id}</td>
                <td>${tc.title}</td>
                <td><span class="status-chip ${tc.status === "Fail" ? "fail" : tc.status === "Pass" ? "pass" : "notrun"}">${tc.status}</span></td>
                <td>${tc.linkedRequirementIds.map((id) => `<span class="badge">${id}</span>`).join("")}</td>
                <td>
                  <button class="secondary" data-action="edit" data-type="testcases" data-id="${tc.id}">編集</button>
                  <button class="danger" data-action="delete" data-type="testcases" data-id="${tc.id}">削除</button>
                </td>
              </tr>`
              )
              .join("")}
          </tbody>
        </table>
      </div>
      <div class="form-panel">
        <h3>Testcase ${currentEdit.type === "testcases" ? "編集" : "追加"}</h3>
        <div class="form-row">
          <label>ID</label>
          <input id="tc-id" value="${currentEdit.type === "testcases" ? getById("testcases", currentEdit.id).id : ""}" />
        </div>
        <div class="form-row">
          <label>タイトル</label>
          <input id="tc-title" value="${currentEdit.type === "testcases" ? getById("testcases", currentEdit.id).title : ""}" />
        </div>
        <div class="form-row">
          <label>前提</label>
          <textarea id="tc-pre">${currentEdit.type === "testcases" ? getById("testcases", currentEdit.id).preconditions : ""}</textarea>
        </div>
        <div class="form-row">
          <label>手順</label>
          <textarea id="tc-steps">${currentEdit.type === "testcases" ? getById("testcases", currentEdit.id).stepsText : ""}</textarea>
        </div>
        <div class="form-row">
          <label>期待結果</label>
          <textarea id="tc-expected">${currentEdit.type === "testcases" ? getById("testcases", currentEdit.id).expected : ""}</textarea>
        </div>
        <div class="form-row">
          <label>ステータス</label>
          <select id="tc-status">
            ${["NotRun", "Pass", "Fail"].map((s) => `<option ${currentEdit.type === "testcases" && getById("testcases", currentEdit.id).status === s ? "selected" : ""}>${s}</option>`).join("")}
          </select>
        </div>
        <div class="form-row">
          <label>測定観点</label>
          <input id="tc-metrics" value="${currentEdit.type === "testcases" ? getById("testcases", currentEdit.id).metricsFocus : ""}" />
        </div>
        <div class="form-row">
          <label>関連要件IDs (カンマ区切り)</label>
          <input id="tc-reqs" value="${currentEdit.type === "testcases" ? getById("testcases", currentEdit.id).linkedRequirementIds.join(", ") : ""}" />
        </div>
        <div class="form-row">
          <label>関連設計Refs (DESIGNID:STEPID, カンマ区切り)</label>
          <input id="tc-designrefs" value="${currentEdit.type === "testcases" ? getById("testcases", currentEdit.id).linkedDesignRefs.map((ref) => `${ref.designId}:${ref.stepId}`).join(", ") : ""}" />
        </div>
        <div class="action-group">
          <button id="tc-save">保存</button>
          <button class="secondary" id="tc-clear">クリア</button>
        </div>
        <p class="helper" id="tc-error"></p>
      </div>
    </div>
  `;
}

function renderEvidences() {
  const root = document.getElementById("view-evidences");
  root.innerHTML = `
    <div class="split-layout">
      <div>
        <table class="table">
          <thead>
            <tr>
              <th>ID</th><th>種別</th><th>説明</th><th>試験</th><th>操作</th>
            </tr>
          </thead>
          <tbody>
            ${state.evidences
              .map(
                (ev) => `
              <tr>
                <td>${ev.id}</td>
                <td>${ev.type}</td>
                <td>${ev.description}</td>
                <td>${ev.linkedTestcaseIds.map((id) => `<span class="badge">${id}</span>`).join("")}</td>
                <td>
                  <button class="secondary" data-action="edit" data-type="evidences" data-id="${ev.id}">編集</button>
                  <button class="danger" data-action="delete" data-type="evidences" data-id="${ev.id}">削除</button>
                </td>
              </tr>`
              )
              .join("")}
          </tbody>
        </table>
      </div>
      <div class="form-panel">
        <h3>Evidence ${currentEdit.type === "evidences" ? "編集" : "追加"}</h3>
        <div class="form-row">
          <label>ID</label>
          <input id="ev-id" value="${currentEdit.type === "evidences" ? getById("evidences", currentEdit.id).id : ""}" />
        </div>
        <div class="form-row">
          <label>種別</label>
          <select id="ev-type">
            ${["serial_log", "pcap", "waveform", "screenshot", "csv", "link"].map((t) => `<option ${currentEdit.type === "evidences" && getById("evidences", currentEdit.id).type === t ? "selected" : ""}>${t}</option>`).join("")}
          </select>
        </div>
        <div class="form-row">
          <label>説明</label>
          <textarea id="ev-description">${currentEdit.type === "evidences" ? getById("evidences", currentEdit.id).description : ""}</textarea>
        </div>
        <div class="form-row">
          <label>相対パス / URL</label>
          <input id="ev-path" value="${currentEdit.type === "evidences" ? getById("evidences", currentEdit.id).relativePath : ""}" />
          <div class="helper">相対パスはリンク表示＋コピーボタンのみ。localファイル読込は不要。</div>
        </div>
        <div class="form-row">
          <label>作成日</label>
          <input id="ev-date" type="date" value="${currentEdit.type === "evidences" ? getById("evidences", currentEdit.id).createdAt : ""}" />
        </div>
        <div class="form-row">
          <label>計測ツール</label>
          <input id="ev-tool" value="${currentEdit.type === "evidences" ? getById("evidences", currentEdit.id).tool : ""}" />
        </div>
        <div class="form-row">
          <label>抽出条件</label>
          <input id="ev-extract" value="${currentEdit.type === "evidences" ? getById("evidences", currentEdit.id).extractionHint : ""}" />
        </div>
        <div class="form-row">
          <label>関連試験IDs (カンマ区切り)</label>
          <input id="ev-tests" value="${currentEdit.type === "evidences" ? getById("evidences", currentEdit.id).linkedTestcaseIds.join(", ") : ""}" />
        </div>
        <div class="form-row">
          <label>関連設計Refs (DESIGNID:STEPID, カンマ区切り)</label>
          <input id="ev-designrefs" value="${currentEdit.type === "evidences" ? getById("evidences", currentEdit.id).linkedDesignRefs.map((ref) => `${ref.designId}:${ref.stepId}`).join(", ") : ""}" />
        </div>
        <div class="action-group">
          <button id="ev-save">保存</button>
          <button class="secondary" id="ev-clear">クリア</button>
        </div>
        <p class="helper" id="ev-error"></p>
      </div>
    </div>
  `;
}

function renderTraceability() {
  const root = document.getElementById("view-trace");
  const categories = ["All", ...new Set(state.requirements.map((req) => req.category))];
  const statuses = ["All", "Pass", "Fail", "NotRun", "InProgress"];
  root.innerHTML = `
    <div class="card">
      <h3>フィルタ</h3>
      <div class="action-group">
        <div class="form-row">
          <label>カテゴリ</label>
          <select id="trace-category">
            ${categories.map((c) => `<option>${c}</option>`).join("")}
          </select>
        </div>
        <div class="form-row">
          <label>ステータス</label>
          <select id="trace-status">
            ${statuses.map((s) => `<option>${s}</option>`).join("")}
          </select>
        </div>
        <div class="form-row">
          <label>検索</label>
          <input id="trace-search" placeholder="ID/タイトル" />
        </div>
        <div class="form-row">
          <label>Failのみ</label>
          <input id="trace-fail" type="checkbox" />
        </div>
        <div class="form-row">
          <label>孤立のみ</label>
          <input id="trace-orphan" type="checkbox" />
        </div>
        <button class="secondary" id="trace-apply">適用</button>
      </div>
    </div>
    <div class="trace-grid">
      <div class="trace-tree" id="trace-forward"></div>
      <div class="trace-tree" id="trace-reverse"></div>
    </div>
  `;
  renderTraceTree();
}

function renderTraceTree(filters = {}) {
  const { category = "All", status = "All", search = "", failOnly = false, orphanOnly = false } = filters;
  const forwardRoot = document.getElementById("trace-forward");
  const reverseRoot = document.getElementById("trace-reverse");
  const reqs = state.requirements.filter((req) => {
    if (category !== "All" && req.category !== category) return false;
    if (status !== "All" && req.status !== status) return false;
    if (search && !`${req.id} ${req.title}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const orphanReqs = state.requirements.filter((req) => getDesignsByRequirement(req.id).length === 0);
  const orphanTests = state.testcases.filter((tc) => tc.linkedRequirementIds.length === 0 && tc.linkedDesignRefs.length === 0);
  const orphanEvidence = state.evidences.filter((ev) => ev.linkedTestcaseIds.length === 0);

  const forwardList = reqs
    .filter((req) => (orphanOnly ? orphanReqs.some((o) => o.id === req.id) : true))
    .map((req) => {
      const designs = getDesignsByRequirement(req.id);
      const tests = state.testcases.filter((tc) => tc.linkedRequirementIds.includes(req.id));
      const designBlocks = designs
        .map((design) => {
          const designTests = state.testcases.filter((tc) =>
            tc.linkedDesignRefs.some((ref) => ref.designId === design.id)
          );
          return `
            <li>
              <strong>${design.id}</strong> - ${design.name}
              <ul>
                ${design.steps
                  .map((step) => `<li>${step.stepId} ${step.label} <span class="badge">${step.kind}</span></li>`)
                  .join("")}
                ${designTests
                  .map(
                    (tc) => `
                  <li>
                    <span class="status-chip ${tc.status === "Fail" ? "fail" : tc.status === "Pass" ? "pass" : "notrun"}">${tc.status}</span>
                    ${tc.id} ${tc.title}
                    <ul>
                      ${state.evidences
                        .filter((ev) => ev.linkedTestcaseIds.includes(tc.id))
                        .map((ev) => `<li>${ev.id} ${ev.description}</li>`)
                        .join("")}
                    </ul>
                  </li>`
                  )
                  .join("")}
              </ul>
            </li>
          `;
        })
        .join("");

      const directTests = tests
        .map(
          (tc) => `
          <li>
            <span class="status-chip ${tc.status === "Fail" ? "fail" : tc.status === "Pass" ? "pass" : "notrun"}">${tc.status}</span>
            ${tc.id} ${tc.title}
            <ul>
              ${state.evidences
                .filter((ev) => ev.linkedTestcaseIds.includes(tc.id))
                .map((ev) => `<li>${ev.id} ${ev.description}</li>`)
                .join("")}
            </ul>
          </li>`
        )
        .join("");

      const allFail = failOnly
        ? req.status === "Fail" || tests.some((tc) => tc.status === "Fail")
        : true;
      if (!allFail) {
        return "";
      }

      return `
        <li>
          <strong>${req.id}</strong> ${req.title}
          <div class="helper">${req.environment}</div>
          <ul>
            ${designBlocks}
            ${directTests}
          </ul>
        </li>
      `;
    })
    .join("");

  forwardRoot.innerHTML = `
    <h3>要件 → 設計 → 試験 → 証跡</h3>
    <ul>
      ${forwardList || "<li>条件に一致するデータがありません。</li>"}
    </ul>
    <div class="card">
      <h4>孤立検知</h4>
      <p>要件孤立: ${orphanReqs.length}, 試験孤立: ${orphanTests.length}, 証跡孤立: ${orphanEvidence.length}</p>
      <ul>
        ${orphanReqs.map((req) => `<li>要件: ${req.id}</li>`).join("")}
        ${orphanTests.map((tc) => `<li>試験: ${tc.id}</li>`).join("")}
        ${orphanEvidence.map((ev) => `<li>証跡: ${ev.id}</li>`).join("")}
      </ul>
    </div>
  `;

  const reverseList = state.evidences
    .filter((ev) => (orphanOnly ? orphanEvidence.some((o) => o.id === ev.id) : true))
    .map((ev) => {
      const tests = state.testcases.filter((tc) => ev.linkedTestcaseIds.includes(tc.id));
      const requirements = tests
        .flatMap((tc) => tc.linkedRequirementIds)
        .map((id) => state.requirements.find((req) => req.id === id))
        .filter(Boolean);

      const matchesSearch = search
        ? `${ev.id} ${ev.description}`.toLowerCase().includes(search.toLowerCase())
        : true;
      if (!matchesSearch) return "";
      if (category !== "All" && !requirements.some((req) => req.category === category)) return "";
      if (status !== "All" && !requirements.some((req) => req.status === status)) return "";
      if (failOnly && !tests.some((tc) => tc.status === "Fail")) return "";

      return `
        <li>
          <strong>${ev.id}</strong> ${ev.description}
          <div class="helper">${ev.relativePath}</div>
          <ul>
            ${tests.map((tc) => `<li>${tc.id} ${tc.title}</li>`).join("")}
            ${requirements.map((req) => `<li>${req.id} ${req.title}</li>`).join("")}
          </ul>
        </li>
      `;
    })
    .join("");

  reverseRoot.innerHTML = `
    <h3>証跡 → 試験 → 要件</h3>
    <ul>
      ${reverseList || "<li>条件に一致するデータがありません。</li>"}
    </ul>
  `;
}

function getById(type, id) {
  return state[type].find((item) => item.id === id);
}

function getDesignsByRequirement(reqId) {
  return state.designs.filter((design) => design.linkedRequirementIds.includes(reqId));
}

function parseCsv(value) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseDesignRefs(value) {
  return parseCsv(value).map((token) => {
    const [designId, stepId] = token.split(":");
    return { designId: designId || "", stepId: stepId || "" };
  });
}

function validateUniqueId(type, id) {
  if (!id) {
    return "IDは必須です";
  }
  const exists = state[type].some((item) => item.id === id && id !== currentEdit.id);
  if (exists) {
    return "IDが重複しています";
  }
  return "";
}

function deleteItem(type, id) {
  state[type] = state[type].filter((item) => item.id !== id);
  saveState();
  render();
  showToast(`${id} を削除しました`);
}

function clearEdit() {
  currentEdit = { type: null, id: null };
  render();
}

function handleSaveRequirement() {
  const id = document.getElementById("req-id").value.trim();
  const error = validateUniqueId("requirements", id);
  if (error) {
    document.getElementById("req-error").textContent = error;
    return;
  }
  const payload = {
    id,
    title: document.getElementById("req-title").value.trim(),
    description: document.getElementById("req-description").value.trim(),
    priority: document.getElementById("req-priority").value,
    status: document.getElementById("req-status").value,
    category: document.getElementById("req-category").value.trim(),
    environment: document.getElementById("req-environment").value.trim(),
    tags: parseCsv(document.getElementById("req-tags").value)
  };
  if (!payload.title) {
    document.getElementById("req-error").textContent = "タイトルは必須です";
    return;
  }
  if (currentEdit.type === "requirements") {
    state.requirements = state.requirements.map((req) => (req.id === currentEdit.id ? payload : req));
  } else {
    state.requirements.push(payload);
  }
  saveState();
  clearEdit();
  showToast("保存しました");
}

function handleSaveDesign() {
  const id = document.getElementById("design-id").value.trim();
  const error = validateUniqueId("designs", id);
  if (error) {
    document.getElementById("design-error").textContent = error;
    return;
  }
  let steps = [];
  try {
    steps = JSON.parse(document.getElementById("design-steps").value || "[]");
  } catch (err) {
    document.getElementById("design-error").textContent = "設計ステップのJSONが壊れています";
    return;
  }
  const payload = {
    id,
    name: document.getElementById("design-name").value.trim(),
    notes: document.getElementById("design-notes").value.trim(),
    mermaidText: document.getElementById("design-mermaid").value.trim(),
    linkedRequirementIds: parseCsv(document.getElementById("design-reqs").value),
    steps
  };
  if (!payload.name) {
    document.getElementById("design-error").textContent = "名称は必須です";
    return;
  }
  if (currentEdit.type === "designs") {
    state.designs = state.designs.map((design) => (design.id === currentEdit.id ? payload : design));
  } else {
    state.designs.push(payload);
  }
  saveState();
  clearEdit();
  showToast("保存しました");
}

function handleSaveTestcase() {
  const id = document.getElementById("tc-id").value.trim();
  const error = validateUniqueId("testcases", id);
  if (error) {
    document.getElementById("tc-error").textContent = error;
    return;
  }
  const payload = {
    id,
    title: document.getElementById("tc-title").value.trim(),
    preconditions: document.getElementById("tc-pre").value.trim(),
    stepsText: document.getElementById("tc-steps").value.trim(),
    expected: document.getElementById("tc-expected").value.trim(),
    status: document.getElementById("tc-status").value,
    metricsFocus: document.getElementById("tc-metrics").value.trim(),
    linkedRequirementIds: parseCsv(document.getElementById("tc-reqs").value),
    linkedDesignRefs: parseDesignRefs(document.getElementById("tc-designrefs").value)
  };
  if (!payload.title) {
    document.getElementById("tc-error").textContent = "タイトルは必須です";
    return;
  }
  if (currentEdit.type === "testcases") {
    state.testcases = state.testcases.map((tc) => (tc.id === currentEdit.id ? payload : tc));
  } else {
    state.testcases.push(payload);
  }
  saveState();
  clearEdit();
  showToast("保存しました");
}

function handleSaveEvidence() {
  const id = document.getElementById("ev-id").value.trim();
  const error = validateUniqueId("evidences", id);
  if (error) {
    document.getElementById("ev-error").textContent = error;
    return;
  }
  const payload = {
    id,
    type: document.getElementById("ev-type").value,
    description: document.getElementById("ev-description").value.trim(),
    relativePath: document.getElementById("ev-path").value.trim(),
    createdAt: document.getElementById("ev-date").value,
    tool: document.getElementById("ev-tool").value.trim(),
    extractionHint: document.getElementById("ev-extract").value.trim(),
    linkedTestcaseIds: parseCsv(document.getElementById("ev-tests").value),
    linkedDesignRefs: parseDesignRefs(document.getElementById("ev-designrefs").value)
  };
  if (!payload.description) {
    document.getElementById("ev-error").textContent = "説明は必須です";
    return;
  }
  if (currentEdit.type === "evidences") {
    state.evidences = state.evidences.map((ev) => (ev.id === currentEdit.id ? payload : ev));
  } else {
    state.evidences.push(payload);
  }
  saveState();
  clearEdit();
  showToast("保存しました");
}

function exportJson() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "traceability_export.json";
  link.click();
  URL.revokeObjectURL(url);
}

function importJson(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      state = normalizeState(data);
      saveState();
      render();
      showToast("インポート完了");
    } catch (error) {
      showToast("JSONの読み込みに失敗しました");
    }
  };
  reader.readAsText(file);
}

function bindEvents() {
  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.addEventListener("click", () => setView(btn.dataset.view));
  });

  document.getElementById("export-btn").addEventListener("click", exportJson);
  document.getElementById("import-btn").addEventListener("click", () => document.getElementById("import-file").click());
  document.getElementById("import-file").addEventListener("change", (event) => {
    if (event.target.files[0]) {
      importJson(event.target.files[0]);
    }
  });
  document.getElementById("sample-btn").addEventListener("click", () => {
    state = structuredClone(sampleData);
    saveState();
    render();
    showToast("サンプルを投入しました");
  });
  document.getElementById("reset-btn").addEventListener("click", () => {
    if (confirm("すべてリセットしますか？")) {
      state = normalizeState({});
      saveState();
      render();
    }
  });

  document.body.addEventListener("click", (event) => {
    const action = event.target.dataset.action;
    if (!action) return;
    const type = event.target.dataset.type;
    const id = event.target.dataset.id;
    if (action === "edit") {
      currentEdit = { type, id };
      render();
    }
    if (action === "delete") {
      deleteItem(type, id);
    }
  });

  document.body.addEventListener("click", (event) => {
    if (event.target.id === "req-save") handleSaveRequirement();
    if (event.target.id === "req-clear") clearEdit();
    if (event.target.id === "design-save") handleSaveDesign();
    if (event.target.id === "design-clear") clearEdit();
    if (event.target.id === "tc-save") handleSaveTestcase();
    if (event.target.id === "tc-clear") clearEdit();
    if (event.target.id === "ev-save") handleSaveEvidence();
    if (event.target.id === "ev-clear") clearEdit();
    if (event.target.id === "trace-apply") {
      renderTraceTree({
        category: document.getElementById("trace-category").value,
        status: document.getElementById("trace-status").value,
        search: document.getElementById("trace-search").value,
        failOnly: document.getElementById("trace-fail").checked,
        orphanOnly: document.getElementById("trace-orphan").checked
      });
    }
  });

  document.body.addEventListener("click", (event) => {
    if (event.target.classList.contains("copy-btn")) {
      const path = event.target.dataset.path;
      navigator.clipboard.writeText(path).then(() => showToast("コピーしました"));
    }
  });
}

function updateEvidenceLinks() {
  document.querySelectorAll("[data-path]").forEach((button) => {
    button.addEventListener("click", () => {
      const path = button.dataset.path;
      navigator.clipboard.writeText(path).then(() => showToast("コピーしました"));
    });
  });
}

function enhanceEvidenceTable() {
  const rows = document.querySelectorAll("#view-evidences tbody tr");
  rows.forEach((row) => {
    const idCell = row.querySelector("td:nth-child(1)");
    const evidence = state.evidences.find((ev) => ev.id === idCell.textContent);
    if (evidence) {
      const descriptionCell = row.querySelector("td:nth-child(3)");
      const link = evidence.relativePath
        ? `<a class="inline-link" href="${evidence.relativePath}" target="_blank">${evidence.relativePath}</a>`
        : "";
      descriptionCell.innerHTML = `${evidence.description}<div class="helper">${link} <button class="copy-btn" data-path="${evidence.relativePath}">Copy</button></div>`;
    }
  });
  updateEvidenceLinks();
}

render();
bindEvents();

const observer = new MutationObserver(() => {
  enhanceEvidenceTable();
});
observer.observe(document.getElementById("view-evidences"), { childList: true, subtree: true });
