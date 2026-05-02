import { formatCoord } from './logger.js';

export function setupUI(state, handlers) {
  const modes = ['start','goal','block','height','normal'];
  const labels = {start:'Start設定',goal:'Goal設定',block:'障害物切替',height:'高さ変更',normal:'通常セル化'};
  const modeWrap = document.querySelector('#mode-buttons');
  modes.forEach(m=>{
    const b = document.createElement('button'); b.textContent = labels[m];
    b.onclick=()=>{ state.mode=m; [...modeWrap.children].forEach(c=>c.classList.remove('active')); b.classList.add('active');};
    if (m===state.mode) b.classList.add('active'); modeWrap.appendChild(b);
  });

  const searchOps = [['Run A*','run'],['Step実行','step'],['Auto再生','auto'],['Reset Search','reset'],['Clear All','clear']];
  const sw = document.querySelector('#search-buttons');
  searchOps.forEach(([t,k])=>{ const b=document.createElement('button'); b.textContent=t; b.onclick=handlers[k]; sw.appendChild(b); });

  const logOps = [['ログクリア','clearLogs'],['JSONエクスポート','exportJson']];
  const lw = document.querySelector('#log-buttons');
  logOps.forEach(([t,k])=>{ const b=document.createElement('button'); b.textContent=t; b.onclick=handlers[k]; lw.appendChild(b); });

  document.querySelector('#json-import').addEventListener('change', handlers.importJson);
}

export function renderLogs(logs) {
  const tbody = document.querySelector('#log-table tbody');
  tbody.innerHTML = '';
  logs.forEach(l=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${l.step ?? ''}</td><td>${l.action ?? ''}</td><td>${formatCoord(l.from)}</td><td>${formatCoord(l.to)}</td><td>${l.heightDiff ?? ''}</td><td>${l.cost ?? ''}</td><td>${l.totalCost ?? ''}</td><td>${l.result ?? l.reason ?? ''}</td>`;
    tbody.appendChild(tr);
  });
}

export function renderSelection(c) {
  document.querySelector('#selection-info').textContent = c ? JSON.stringify(c, null, 2) : 'none';
}
