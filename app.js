const today = new Date();
const formatISO = (date) => date.toISOString().split('T')[0];
const offsetDate = (days) => {
  const d = new Date(today);
  d.setDate(d.getDate() + days);
  return formatISO(d);
};

const sakes = [
  { id: 1, name: '純米吟醸 霞雪', brewery: '蔵元あさひ', type: '純米吟醸' },
  { id: 2, name: '山廃仕込み 暁', brewery: '藤原酒造', type: '山廃純米' },
  { id: 3, name: '生酛 原酒 翠', brewery: '北山酒造', type: '生酛' }
];

let batches = [
  { id: 1, sakeId: 1, batchCode: 'KS-2024-01', receivedDate: offsetDate(-14), serveStartDate: offsetDate(-10), serveEndDate: offsetDate(18), storageLocation: '冷蔵庫A', status: 'OK' },
  { id: 2, sakeId: 2, batchCode: 'AK-2024-02', receivedDate: offsetDate(-20), serveStartDate: offsetDate(-15), serveEndDate: offsetDate(10), storageLocation: '低温庫B', status: '注意' },
  { id: 3, sakeId: 1, batchCode: 'KS-2024-03', receivedDate: offsetDate(-5), serveStartDate: offsetDate(-3), serveEndDate: offsetDate(25), storageLocation: '冷蔵庫C', status: 'OK' },
  { id: 4, sakeId: 3, batchCode: 'SU-2024-01', receivedDate: offsetDate(-30), serveStartDate: offsetDate(-25), serveEndDate: offsetDate(5), storageLocation: '樽室', status: 'NG' }
];

let qualityRecords = [
  { id: 1, batchId: 1, date: offsetDate(-2), temperature: 7.8, aroma: '良好', taste: '良好', appearance: '良好', status: 'OK', comment: '香り安定' },
  { id: 2, batchId: 1, date: offsetDate(-1), temperature: 7.5, aroma: '良好', taste: '良好', appearance: '良好', status: 'OK', comment: '甘味しっかり' },
  { id: 3, batchId: 2, date: offsetDate(-2), temperature: 10.2, aroma: 'やや劣化', taste: 'やや劣化', appearance: 'やや濁り', status: '注意', comment: '酸味上昇' },
  { id: 4, batchId: 2, date: offsetDate(-1), temperature: 9.6, aroma: 'やや劣化', taste: 'やや劣化', appearance: '良好', status: '注意', comment: '酸味横ばい' },
  { id: 5, batchId: 3, date: offsetDate(-1), temperature: 6.1, aroma: '良好', taste: '良好', appearance: '良好', status: 'OK', comment: '微ガス感' },
  { id: 6, batchId: 4, date: offsetDate(-2), temperature: 12.4, aroma: '異常', taste: '異常', appearance: '異常', status: 'NG', comment: '火落ち兆候' },
  { id: 7, batchId: 4, date: offsetDate(-1), temperature: 11.9, aroma: '異常', taste: '異常', appearance: '異常', status: 'NG', comment: '沈殿物増加' },
  { id: 8, batchId: 2, date: offsetDate(0), temperature: 9.4, aroma: 'やや劣化', taste: 'やや劣化', appearance: '良好', status: '注意', comment: '味わい硬い' },
  { id: 9, batchId: 4, date: offsetDate(0), temperature: 11.5, aroma: '異常', taste: '異常', appearance: '異常', status: 'NG', comment: '香り強い異臭' }
];

const selectOptions = {
  aroma: ['良好', 'やや劣化', '異常'],
  taste: ['良好', 'やや劣化', '異常'],
  appearance: ['良好', 'やや濁り', '異常'],
  status: ['OK', '注意', 'NG']
};

const navLinks = document.querySelectorAll('.nav-link');
const views = document.querySelectorAll('.view');
const dailyTableBody = document.getElementById('dailyRecordsBody');
const recordDateInput = document.getElementById('recordDate');
const saveMessage = document.getElementById('saveMessage');
const lotMessage = document.getElementById('lotMessage');
const lotForm = document.getElementById('lotForm');
const lotSakeSelect = lotForm.querySelector('select[name="sakeId"]');

const ganttFromInput = document.getElementById('ganttFrom');
const ganttToInput = document.getElementById('ganttTo');
const ganttBrandSelect = document.getElementById('ganttBrand');
const ganttStatusSelect = document.getElementById('ganttStatus');

const unrecordedTable = document.getElementById('unrecordedTable');
const alertTable = document.getElementById('alertTable');
const lotTable = document.getElementById('lotTable');
const ganttRows = document.getElementById('ganttRows');
const ganttDetail = document.getElementById('ganttDetail');

const formatBadge = (status) => {
  const map = { 'OK': 'ok', '注意': 'warning', 'NG': 'ng' };
  return `<span class="badge ${map[status] || 'ok'}">${status}</span>`;
};

const getSakeName = (sakeId) => sakes.find((s) => s.id === sakeId)?.name || '不明';

const showView = (viewId) => {
  views.forEach((view) => {
    view.classList.toggle('active', view.id === viewId);
  });
  navLinks.forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.view === viewId);
  });
};

navLinks.forEach((btn) => {
  btn.addEventListener('click', () => showView(btn.dataset.view));
});

document.getElementById('goToDaily').addEventListener('click', () => {
  recordDateInput.value = formatISO(new Date());
  renderDailyTable();
  saveMessage.textContent = '';
  showView('daily-records');
});

const renderUnrecorded = () => {
  const todayStr = formatISO(new Date());
  const rows = batches
    .filter((batch) => !qualityRecords.some((rec) => rec.batchId === batch.id && rec.date === todayStr))
    .map((batch) => {
      const latest = qualityRecords
        .filter((rec) => rec.batchId === batch.id)
        .sort((a, b) => (a.date < b.date ? 1 : -1))[0];
      const status = latest ? formatBadge(latest.status) : '---';
      return `<tr>
        <td>${batch.batchCode}</td>
        <td>${getSakeName(batch.sakeId)}</td>
        <td>${batch.storageLocation}</td>
        <td>${status}</td>
      </tr>`;
    })
    .join('');
  unrecordedTable.innerHTML = rows || '<tr><td colspan="4">本日未記録のロットはありません。</td></tr>';
};

const renderAlerts = () => {
  const todayStr = formatISO(new Date());
  const alerts = qualityRecords.filter((rec) => rec.date === todayStr && rec.status !== 'OK');
  alertTable.innerHTML = alerts.length
    ? alerts
        .map((rec) => {
          const batch = batches.find((b) => b.id === rec.batchId);
          return `<tr>
            <td>${rec.date}</td>
            <td>${batch?.batchCode || ''}</td>
            <td>${getSakeName(batch?.sakeId || 0)}</td>
            <td>${formatBadge(rec.status)}</td>
            <td>${rec.comment}</td>
          </tr>`;
        })
        .join('')
    : '<tr><td colspan="5">今日のアラートはありません。</td></tr>';
};

const createSelectOptions = (options, selected) =>
  options.map((opt) => `<option value="${opt}" ${selected === opt ? 'selected' : ''}>${opt}</option>`).join('');

const renderDailyTable = () => {
  const selectedDate = recordDateInput.value;
  dailyTableBody.innerHTML = batches
    .map((batch) => {
      const record = qualityRecords.find((rec) => rec.batchId === batch.id && rec.date === selectedDate);
      return `<tr data-batch-id="${batch.id}">
        <td>${batch.batchCode}</td>
        <td>${getSakeName(batch.sakeId)}</td>
        <td>${batch.storageLocation}</td>
        <td><input type="number" step="0.1" data-field="temperature" value="${record?.temperature ?? ''}" placeholder="8"></td>
        <td><select data-field="aroma">${createSelectOptions(selectOptions.aroma, record?.aroma || '良好')}</select></td>
        <td><select data-field="taste">${createSelectOptions(selectOptions.taste, record?.taste || '良好')}</select></td>
        <td><select data-field="appearance">${createSelectOptions(selectOptions.appearance, record?.appearance || '良好')}</select></td>
        <td><select data-field="status">${createSelectOptions(selectOptions.status, record?.status || 'OK')}</select></td>
        <td><input type="text" data-field="comment" value="${record?.comment ?? ''}" placeholder="メモ"></td>
      </tr>`;
    })
    .join('');
};

const saveDailyRecords = () => {
  const selectedDate = recordDateInput.value;
  const rows = [...dailyTableBody.querySelectorAll('tr')];
  rows.forEach((row) => {
    const batchId = Number(row.dataset.batchId);
    const values = {};
    row.querySelectorAll('[data-field]').forEach((input) => {
      values[input.dataset.field] = input.value;
    });
    qualityRecords = qualityRecords.filter((rec) => !(rec.batchId === batchId && rec.date === selectedDate));
    qualityRecords.push({
      id: Date.now() + batchId,
      batchId,
      date: selectedDate,
      temperature: values.temperature ? Number(values.temperature) : '',
      aroma: values.aroma,
      taste: values.taste,
      appearance: values.appearance,
      status: values.status,
      comment: values.comment
    });
  });
  saveMessage.textContent = '保存しました（ブラウザメモリ上）';
  renderUnrecorded();
  renderAlerts();
  renderGantt();
};

const copyPreviousDay = () => {
  const selectedDate = new Date(recordDateInput.value);
  const prevDate = new Date(selectedDate);
  prevDate.setDate(prevDate.getDate() - 1);
  const prevStr = formatISO(prevDate);
  dailyTableBody.querySelectorAll('tr').forEach((row) => {
    const batchId = Number(row.dataset.batchId);
    const prevRecord = qualityRecords.find((rec) => rec.batchId === batchId && rec.date === prevStr);
    if (prevRecord) {
      row.querySelector('[data-field="temperature"]').value = prevRecord.temperature;
      row.querySelector('[data-field="aroma"]').value = prevRecord.aroma;
      row.querySelector('[data-field="taste"]').value = prevRecord.taste;
      row.querySelector('[data-field="appearance"]').value = prevRecord.appearance;
      row.querySelector('[data-field="status"]').value = prevRecord.status;
      row.querySelector('[data-field="comment"]').value = prevRecord.comment;
    }
  });
  saveMessage.textContent = `前日(${prevStr})の値を仮コピーしました`;
};

const renderLotTable = () => {
  lotTable.innerHTML = batches
    .map((batch) => `<tr>
      <td>${batch.batchCode}</td>
      <td>${getSakeName(batch.sakeId)}</td>
      <td>${batch.receivedDate}</td>
      <td>${batch.serveStartDate}</td>
      <td>${batch.serveEndDate}</td>
      <td>${batch.storageLocation}</td>
      <td>${formatBadge(batch.status)}</td>
    </tr>`)
    .join('');
};

const renderBrandOptions = () => {
  ganttBrandSelect.innerHTML = '<option value="all">すべて</option>' +
    sakes.map((sake) => `<option value="${sake.id}">${sake.name}</option>`).join('');
  lotSakeSelect.innerHTML = sakes.map((sake) => `<option value="${sake.id}">${sake.name}</option>`).join('');
};

const renderGantt = () => {
  const from = new Date(ganttFromInput.value);
  const to = new Date(ganttToInput.value);
  if (!(from instanceof Date) || isNaN(from) || !(to instanceof Date) || isNaN(to)) return;
  const totalMs = to - from;
  const totalDays = totalMs / (1000 * 60 * 60 * 24) || 1;
  const brandFilter = ganttBrandSelect.value;
  const statusFilter = ganttStatusSelect.value;

  const rows = batches
    .filter((batch) => (brandFilter === 'all' ? true : String(batch.sakeId) === brandFilter))
    .filter((batch) => (statusFilter === 'all' ? true : batch.status === statusFilter))
    .filter((batch) => new Date(batch.serveEndDate) >= from && new Date(batch.receivedDate) <= to)
    .map((batch) => {
      const start = new Date(batch.receivedDate);
      const end = new Date(batch.serveEndDate);
      const startOffsetDays = (start - from) / (1000 * 60 * 60 * 24);
      const endOffsetDays = (end - from) / (1000 * 60 * 60 * 24);
      const clippedStart = Math.max(0, startOffsetDays);
      const clippedEnd = Math.min(totalDays, endOffsetDays);
      const widthPercent = Math.max(5, ((clippedEnd - clippedStart) / totalDays) * 100);
      const leftPercent = (clippedStart / totalDays) * 100;
      const colorMap = { OK: 'var(--badge-ok)', '注意': 'var(--badge-warning)', NG: 'var(--badge-ng)' };
      return `<div class="gantt-row">
        <div class="gantt-label">${getSakeName(batch.sakeId)} ／ ${batch.batchCode} ／ ${batch.storageLocation}</div>
        <div class="gantt-track">
          <div class="gantt-bar" data-batch-id="${batch.id}" style="left:${leftPercent}%; width:${widthPercent}%; background:${colorMap[batch.status] || 'var(--badge-ok)'}">
            ${batch.status}
          </div>
        </div>
      </div>`;
    })
    .join('');

  ganttRows.innerHTML = rows || '<p>該当するロットがありません。</p>';
  ganttRows.querySelectorAll('.gantt-bar').forEach((bar) => {
    bar.addEventListener('click', () => showGanttDetail(Number(bar.dataset.batchId)));
  });
};

const showGanttDetail = (batchId) => {
  const batch = batches.find((b) => b.id === batchId);
  if (!batch) return;
  const recentRecords = qualityRecords
    .filter((rec) => rec.batchId === batchId)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 3);
  const recordsHtml = recentRecords.length
    ? '<ul>' +
      recentRecords
        .map((rec) => `<li>${rec.date}：${rec.status}（${rec.temperature || '--'}℃ ${rec.comment || ''}）</li>`)
        .join('') +
      '</ul>'
    : '<p>記録がありません。</p>';
  ganttDetail.innerHTML = `
    <h3>${getSakeName(batch.sakeId)} ／ ${batch.batchCode}</h3>
    <p>保管場所: ${batch.storageLocation}</p>
    <p>入荷日: ${batch.receivedDate} ／ 提供開始日: ${batch.serveStartDate} ／ 提供終了日: ${batch.serveEndDate}</p>
    <p>現在ステータス: ${formatBadge(batch.status)}</p>
    <h4>最近3日の記録</h4>
    ${recordsHtml}
  `;
};

const initializeDates = () => {
  const todayStr = formatISO(new Date());
  recordDateInput.value = todayStr;
  const minDate = batches.map((b) => b.receivedDate).sort()[0];
  const maxDate = batches.map((b) => b.serveEndDate).sort().slice(-1)[0];
  ganttFromInput.value = minDate;
  ganttToInput.value = maxDate;
};

const handleLotSubmit = (event) => {
  event.preventDefault();
  const formData = new FormData(lotForm);
  const newBatch = {
    id: batches.length ? Math.max(...batches.map((b) => b.id)) + 1 : 1,
    batchCode: formData.get('batchCode'),
    sakeId: Number(formData.get('sakeId')),
    receivedDate: formData.get('receivedDate'),
    serveStartDate: formData.get('serveStartDate'),
    serveEndDate: formData.get('serveEndDate'),
    storageLocation: formData.get('storageLocation'),
    status: formData.get('status')
  };
  batches.push(newBatch);
  lotMessage.textContent = 'ロットを追加しました（モック）';
  lotForm.reset();
  renderLotTable();
  renderDailyTable();
  renderGantt();
};

lotForm.addEventListener('submit', handleLotSubmit);
recordDateInput.addEventListener('change', () => {
  renderDailyTable();
  saveMessage.textContent = '';
});
document.getElementById('saveRecords').addEventListener('click', saveDailyRecords);
document.getElementById('copyPrevious').addEventListener('click', copyPreviousDay);
ganttFromInput.addEventListener('change', renderGantt);
ganttToInput.addEventListener('change', renderGantt);
ganttBrandSelect.addEventListener('change', renderGantt);
ganttStatusSelect.addEventListener('change', renderGantt);

document.addEventListener('DOMContentLoaded', () => {
  renderBrandOptions();
  initializeDates();
  renderUnrecorded();
  renderAlerts();
  renderDailyTable();
  renderLotTable();
  renderGantt();
});
