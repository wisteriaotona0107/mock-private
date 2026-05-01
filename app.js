const STORAGE_KEY = "conveyor-mock-v1";
const state = loadState() || {
  mode: "select",
  image: "",
  selected: null,
  points: [],
  moves: [],
  routes: [],
  mechanisms: [],
  sensors: [],
  risks: []
};

const modes = ["point", "move", "route", "mech", "sensor", "select", "delete"];
const modeLabel = {
  point: "Point追加", move: "MOVE追加", route: "ROUTE追加", mech: "MECH追加",
  sensor: "SENSOR追加", select: "選択・編集", delete: "削除"
};

const modeGroup = document.getElementById("modeGroup");
const bgImage = document.getElementById("bgImage");
const overlay = document.getElementById("overlay");
const editorContent = document.getElementById("editorContent");
const tablesEl = document.getElementById("tables");
const mermaidOutput = document.getElementById("mermaidOutput");
const jsonOutput = document.getElementById("jsonOutput");

let pendingMoveStart = null;
let pendingRouteMoves = [];

init();
function init() {
  renderModeButtons();
  bindEvents();
  if (state.image) bgImage.src = state.image;
  renderAll();
}
function bindEvents() {
  document.getElementById("imageUpload").addEventListener("change", onUpload);
  overlay.addEventListener("click", onCanvasClick);
  document.getElementById("saveBtn").addEventListener("click", persist);
  document.getElementById("resetBtn").addEventListener("click", () => { localStorage.removeItem(STORAGE_KEY); location.reload(); });
  document.getElementById("copyMermaidBtn").addEventListener("click", () => navigator.clipboard.writeText(mermaidOutput.value));
  document.getElementById("downloadJsonBtn").addEventListener("click", downloadJSON);
  bgImage.addEventListener("load", syncOverlaySize);
  window.addEventListener("resize", syncOverlaySize);
}
function renderModeButtons() {
  modeGroup.innerHTML = "";
  modes.forEach((m) => {
    const b = document.createElement("button");
    b.className = "mode-btn" + (state.mode === m ? " active" : "");
    b.textContent = modeLabel[m];
    b.onclick = () => { state.mode = m; pendingMoveStart = null; renderModeButtons(); renderEditor(); };
    modeGroup.appendChild(b);
  });
}
function onUpload(e) {
  const f = e.target.files[0];
  if (!f) return;
  const r = new FileReader();
  r.onload = () => { state.image = r.result; bgImage.src = state.image; persist(); };
  r.readAsDataURL(f);
}
function getSvgPoint(e) {
  const rect = overlay.getBoundingClientRect();
  return { x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 };
}
function onCanvasClick(e) {
  const p = getSvgPoint(e);
  if (state.mode === "point") addPoint(p);
  else if (state.mode === "mech") addMech(p);
  else if (state.mode === "sensor") addSensor(p);
  else if (state.mode === "move") pickMovePointNearby(p);
  else if (state.mode === "route") pickMoveForRoute(p);
  else if (state.mode === "select" || state.mode === "delete") pickNearestElement(p);
  renderAll();
}
function pickPoint(p) { return state.points.find((pt) => dist(pt, p) < 3); }
function pickMovePointNearby(p) {
  const pt = pickPoint(p);
  if (!pt) return alert("MOVEはPoint同士を選択してください");
  if (!pendingMoveStart) pendingMoveStart = pt.id;
  else { addMove(pendingMoveStart, pt.id); pendingMoveStart = null; }
}
function pickNearestElement(p) {
  const all = [...state.points.map(x=>({t:"point",x})), ...state.moves.map(x=>({t:"move",x})), ...state.mechanisms.map(x=>({t:"mech",x})), ...state.sensors.map(x=>({t:"sensor",x}))];
  let hit = null, best = 999;
  all.forEach(({t,x}) => {
    const ref = t === "move" ? midOfMove(x) : x;
    const d = dist(ref,p);
    if (d < best) { best = d; hit = {type:t,id:x.id}; }
  });
  if (best > 4) return;
  if (state.mode === "delete") deleteByHit(hit);
  else state.selected = hit;
}
function pickMoveForRoute(p) {
  const hit = state.moves.find((m) => dist(midOfMove(m), p) < 4);
  if (!hit) return;
  if (pendingRouteMoves.includes(hit.id)) {
    pendingRouteMoves = pendingRouteMoves.filter((id) => id !== hit.id);
  } else {
    pendingRouteMoves.push(hit.id);
  }
}
function deleteByHit(hit) {
  if (!hit) return;
  if (hit.type === "point") state.points = state.points.filter(x=>x.id!==hit.id);
  if (hit.type === "move") state.moves = state.moves.filter(x=>x.id!==hit.id);
  if (hit.type === "mech") state.mechanisms = state.mechanisms.filter(x=>x.id!==hit.id);
  if (hit.type === "sensor") state.sensors = state.sensors.filter(x=>x.id!==hit.id);
  state.selected = null;
}
function addPoint(p){ state.points.push({id:nextId("P",state.points),number:state.points.length+1,name:"",role:"",note:"要確認",...p}); }
function addMech(p){ state.mechanisms.push({id:nextId("MECH",state.mechanisms),name:"",kind:"未確定",relatedMoves:[],risk:"推定",note:"要確認",...p}); }
function addSensor(p){ state.sensors.push({id:nextId("SENS",state.sensors),name:"",kind:"未確定",relatedMoves:[],use:"停止/分岐候補",note:"要確認",...p}); }
function addMove(start,end){ state.moves.push({id:nextId("MOVE",state.moves),start,end,action:"",stopCondition:"",sensorIds:[],mechIds:[],note:"推定"}); }
function midOfMove(m){ const s=state.points.find(x=>x.id===m.start), e=state.points.find(x=>x.id===m.end); return {x:(s.x+e.x)/2,y:(s.y+e.y)/2}; }
function nextId(prefix, arr){ return `${prefix}-${String(arr.length+1).padStart(2,"0")}`; }
function dist(a,b){ return Math.hypot(a.x-b.x,a.y-b.y); }

function renderAll(){ syncOverlaySize(); renderSvg(); inferRisks(); renderEditor(); renderTables(); renderExports(); persist(); }
function syncOverlaySize(){ const r = bgImage.getBoundingClientRect(); if (r.width>0){ overlay.style.width = r.width+"px"; overlay.style.height=r.height+"px"; document.getElementById("canvasContainer").style.minHeight = r.height+"px"; } }
function renderSvg(){
  overlay.innerHTML = `<defs><marker id="arrowRed" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#d32f2f"/></marker><marker id="arrowBlue" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#1e88e5"/></marker></defs>`;
  state.moves.forEach(m=>{ const s=state.points.find(x=>x.id===m.start),e=state.points.find(x=>x.id===m.end); if(!s||!e) return; overlay.insertAdjacentHTML("beforeend", `<line x1="${s.x}%" y1="${s.y}%" x2="${e.x}%" y2="${e.y}%" stroke="#d32f2f" stroke-width="3" marker-end="url(#arrowRed)"/><text x="${(s.x+e.x)/2}%" y="${(s.y+e.y)/2 -1}%" fill="#d32f2f" font-size="12">${m.id}</text>`); });
  state.points.forEach(p=> overlay.insertAdjacentHTML("beforeend", `<g data-id="${p.id}"><circle cx="${p.x}%" cy="${p.y}%" r="13" fill="white" stroke="#111"/><text x="${p.x}%" y="${p.y+1}%" text-anchor="middle" dominant-baseline="middle" font-size="11">${p.number}</text></g>`));
  state.mechanisms.forEach(m=> overlay.insertAdjacentHTML("beforeend", `<rect x="${m.x-1.5}%" y="${m.y-1.5}%" width="3%" height="3%" fill="#2e7d32" rx="3" />`));
  state.sensors.forEach(s=> overlay.insertAdjacentHTML("beforeend", `<circle cx="${s.x}%" cy="${s.y}%" r="9" fill="#f9a825" />`));
}
function renderEditor(){
  if (state.mode === "route") {
    editorContent.innerHTML = `
      <p class="small">MOVEをクリックして順序選択: ${pendingRouteMoves.join(" → ") || "未選択"}</p>
      <label>ROUTE名称<input id="routeName" placeholder="正常経路 / 分岐経路 など"></label>
      <label>条件<input id="routeCondition" placeholder="SENS-01 ON など"></label>
      <label>備考<input id="routeNote" placeholder="推定/要確認"></label>
      <button class="btn" id="createRouteBtn">選択MOVEでROUTE作成</button>
    `;
    document.getElementById("createRouteBtn").onclick = () => {
      if (!pendingRouteMoves.length) return;
      state.routes.push({
        id: nextId("ROUTE", state.routes),
        name: document.getElementById("routeName").value || "未命名",
        moveOrder: [...pendingRouteMoves],
        condition: document.getElementById("routeCondition").value || "要確認",
        note: document.getElementById("routeNote").value || "推定"
      });
      pendingRouteMoves = [];
      renderAll();
    };
    return;
  }
  if(!state.selected){ editorContent.innerHTML = `<p class="small">モード: ${modeLabel[state.mode]} / 未選択</p>`; return; }
  const obj = getSelectedObj(); if(!obj) return;
  const entries = Object.entries(obj).filter(([k])=>!["x","y"].includes(k));
  editorContent.innerHTML = entries.map(([k,v])=>`<label>${k}<input data-k="${k}" value="${Array.isArray(v)?v.join(","):v??""}"></label>`).join("");
  editorContent.querySelectorAll("input").forEach(i=>i.onchange=(e)=>{ const k=e.target.dataset.k; obj[k]=e.target.value.includes(",")?e.target.value.split(",").map(s=>s.trim()).filter(Boolean):e.target.value; renderAll(); });
}
function getSelectedObj(){ const s=state.selected; if(!s)return null; const map={point:state.points,move:state.moves,mech:state.mechanisms,sensor:state.sensors}; return map[s.type].find(x=>x.id===s.id); }
function inferRisks(){
  state.risks = [];
  state.moves.forEach(m=>{
    const mid = midOfMove(m);
    state.mechanisms.forEach(me=>{ if (dist(mid,me)<12) state.risks.push({type:"干渉候補", moveId:m.id, mechId:me.id, status:"推定"}); });
    state.sensors.forEach(se=>{ if (dist(mid,se)<12) state.risks.push({type:"制御条件候補", moveId:m.id, sensorId:se.id, status:"要確認"}); });
  });
}
function renderTables(){
  const tbl = (title, headers, rows) => `<h3>${title}</h3><table><thead><tr>${headers.map(h=>`<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(c=>`<td>${c??""}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
  tablesEl.innerHTML =
    tbl("A. 搬送ポイント一覧", ["Point ID","番号","名称","役割","備考"], state.points.map(p=>[p.id,p.number,p.name,p.role,p.note])) +
    tbl("B. MOVE一覧", ["MOVE-ID","開始","終了","動作内容","停止条件","関連センサー","干渉候補"], state.moves.map(m=>[m.id,m.start,m.end,m.action,m.stopCondition,m.sensorIds,m.mechIds])) +
    tbl("C. ROUTE一覧", ["ROUTE-ID","名称","MOVE順","条件","備考"], state.routes.map(r=>[r.id,r.name,r.moveOrder,r.condition,r.note])) +
    tbl("D. 機構一覧", ["MECH-ID","名称","種別","関連MOVE","干渉リスク","備考"], state.mechanisms.map(m=>[m.id,m.name,m.kind,m.relatedMoves,m.risk,m.note])) +
    tbl("E. センサー一覧", ["SENSOR-ID","名称","種別","関連MOVE","用途","備考"], state.sensors.map(s=>[s.id,s.name,s.kind,s.relatedMoves,s.use,s.note])) +
    tbl("干渉/制御候補", ["区分","MOVE","機構/センサー","状態"], state.risks.map(r=>[r.type,r.moveId,r.mechId||r.sensorId,r.status]));
}
function renderExports(){
  mermaidOutput.value = generateMermaid();
  jsonOutput.value = JSON.stringify({points:state.points,moves:state.moves,routes:state.routes,mechanisms:state.mechanisms,sensors:state.sensors,risks:state.risks}, null, 2);
}
function generateMermaid(){
  const lines = ["flowchart LR"];
  state.points.forEach(p=>lines.push(`  ${p.id.replace("-","")}(( ${p.id} ${p.name||""} ))`));
  state.moves.forEach(m=>lines.push(`  ${m.start.replace("-","")} -->|${m.id}| ${m.end.replace("-","")}`));
  state.sensors.forEach(s=>{ const target = s.relatedMoves?.[0]; if(target) lines.push(`  ${s.id.replace("-","")}[[${s.id}]] -.制御候補.-> ${target.replace("-","")}`); });
  state.mechanisms.forEach(m=>{ const target = m.relatedMoves?.[0]; if(target) lines.push(`  ${m.id.replace("-","")}[${m.id}] -.干渉候補.-> ${target.replace("-","")}`); });
  return lines.join("\n");
}
function persist(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function loadState(){ try{return JSON.parse(localStorage.getItem(STORAGE_KEY));}catch{return null;} }
function downloadJSON(){ const blob = new Blob([jsonOutput.value], {type:"application/json"}); const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="conveyor-annotation.json"; a.click(); URL.revokeObjectURL(a.href); }
