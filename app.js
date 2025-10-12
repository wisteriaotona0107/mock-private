const TOTAL_SLOTS = 10;
const STORAGE_PREFIX = 'daily:';
const DESCRIPTION_LIMIT = 1000;

// TODO: replace with real API
const api = {
  loadByDate(date) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const raw = localStorage.getItem(`${STORAGE_PREFIX}${date}`);
        resolve(raw ? JSON.parse(raw) : null);
      }, 320);
    });
  },
  saveDraft(date, payload) {
    return new Promise((resolve) => {
      setTimeout(() => {
        localStorage.setItem(`${STORAGE_PREFIX}${date}`, JSON.stringify(payload));
        resolve(payload);
      }, 420);
    });
  },
  publish(date, payload) {
    return new Promise((resolve) => {
      setTimeout(() => {
        localStorage.setItem(`${STORAGE_PREFIX}${date}`, JSON.stringify(payload));
        resolve(payload);
      }, 420);
    });
  },
  copyFromDate(date) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const raw = localStorage.getItem(`${STORAGE_PREFIX}${date}`);
        resolve(raw ? JSON.parse(raw) : null);
      }, 320);
    });
  }
};

const state = {
  date: '',
  status: 'draft',
  lastUpdated: null,
  items: new Map(),
  previews: new Map(),
  activeCard: null
};

const elements = {};

document.addEventListener('DOMContentLoaded', () => {
  cacheElements();
  renderCards();
  bindEvents();
  initializeDate();
});

function cacheElements() {
  elements.app = document.getElementById('app');
  elements.dateInput = document.getElementById('menu-date');
  elements.themeSwitch = document.getElementById('theme-switch');
  elements.cardGrid = document.querySelector('.card-grid');
  elements.statusBadge = document.getElementById('status-badge');
  elements.lastUpdated = document.getElementById('last-updated');
  elements.toastContainer = document.querySelector('.toast-container');
  elements.progressBar = document.getElementById('progress-bar');
  elements.progressFill = elements.progressBar.querySelector('.progress-fill');
  elements.loadButton = document.getElementById('load-button');
  elements.copyButton = document.getElementById('copy-button');
  elements.draftButton = document.getElementById('draft-button');
  elements.publishButton = document.getElementById('publish-button');
  elements.helpButton = document.getElementById('help-button');
  elements.helpModal = document.getElementById('help-modal');
  elements.helpClose = document.getElementById('help-close');
  elements.warningModal = document.getElementById('warning-modal');
  elements.warningList = document.getElementById('warning-list');
  elements.warningCancel = document.getElementById('warning-cancel');
  elements.warningContinue = document.getElementById('warning-continue');
  elements.skeletonOverlay = document.getElementById('skeleton-overlay');
}

function renderCards() {
  const template = document.getElementById('card-template');
  elements.cardGrid.innerHTML = '';
  elements.cardGrid.appendChild(elements.skeletonOverlay);

  for (let i = 1; i <= TOTAL_SLOTS; i += 1) {
    const node = template.content.cloneNode(true);
    const article = node.querySelector('.menu-card');
    article.dataset.slot = i;
    node.querySelector('.slot-number').textContent = i.toString().padStart(2, '0');

    const nameInput = node.querySelector('input[name="name"]');
    const descTextarea = node.querySelector('textarea[name="desc"]');
    const altInput = node.querySelector('input[name="alt"]');
    const dropzone = node.querySelector('[data-dropzone]');
    const fileInput = node.querySelector('.file-input');
    const previewImg = node.querySelector('.preview img');
    const previewPlaceholder = node.querySelector('.preview-placeholder');
    const fileNameLabel = node.querySelector('.file-name');
    const clearButton = node.querySelector('[data-clear]');
    const counter = node.querySelector('.char-counter .count');

    nameInput.id = `name-${i}`;
    descTextarea.id = `desc-${i}`;
    altInput.id = `alt-${i}`;
    nameInput.closest('.field').querySelector('label').setAttribute('for', nameInput.id);
    descTextarea.closest('.field').querySelector('label').setAttribute('for', descTextarea.id);
    altInput.closest('.field').querySelector('label').setAttribute('for', altInput.id);

    descTextarea.addEventListener('input', () => {
      const remaining = DESCRIPTION_LIMIT - descTextarea.value.length;
      counter.textContent = remaining.toString();
    });

    const updateState = () => {
      const slotState = state.items.get(i) || {};
      state.items.set(i, {
        slot: i,
        name: nameInput.value.trim(),
        desc: descTextarea.value.trim(),
        alt: altInput.value.trim(),
        hasImage: slotState.hasImage || false,
        imageName: slotState.imageName || ''
      });
    };

    nameInput.addEventListener('input', updateState);
    descTextarea.addEventListener('input', updateState);
    altInput.addEventListener('input', updateState);

    fileInput.addEventListener('change', (event) => {
      const file = event.target.files[0];
      handleFile(file, { slot: i, previewImg, previewPlaceholder, fileNameLabel });
    });

    dropzone.addEventListener('click', () => fileInput.click());
    dropzone.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        fileInput.click();
      }
    });
    dropzone.addEventListener('dragover', (event) => {
      event.preventDefault();
      dropzone.classList.add('drag-over');
    });
    dropzone.addEventListener('dragleave', () => {
      dropzone.classList.remove('drag-over');
    });
    dropzone.addEventListener('drop', (event) => {
      event.preventDefault();
      dropzone.classList.remove('drag-over');
      const file = event.dataTransfer.files[0];
      handleFile(file, { slot: i, previewImg, previewPlaceholder, fileNameLabel });
    });

    clearButton.addEventListener('click', () => {
      clearCard(article);
    });

    article.addEventListener('focusin', () => {
      state.activeCard = article;
    });

    elements.cardGrid.appendChild(node);
  }
}

function bindEvents() {
  elements.dateInput.addEventListener('change', () => {
    state.date = elements.dateInput.value;
    loadData(state.date);
  });

  elements.cardGrid.addEventListener('focusout', gatherCardState);

  elements.loadButton.addEventListener('click', () => {
    loadData(state.date);
  });

  elements.copyButton.addEventListener('click', () => {
    copyFromPreviousDay();
  });

  elements.draftButton.addEventListener('click', async () => {
    await saveDraft();
  });

  elements.publishButton.addEventListener('click', async () => {
    await attemptPublish();
  });

  elements.themeSwitch.addEventListener('change', toggleTheme);

  elements.helpButton.addEventListener('click', () => openModal(elements.helpModal));
  elements.helpClose.addEventListener('click', () => closeModal(elements.helpModal, elements.helpButton));
  elements.helpModal.addEventListener('click', (event) => {
    if (event.target === elements.helpModal) closeModal(elements.helpModal, elements.helpButton);
  });

  elements.warningCancel.addEventListener('click', () => closeModal(elements.warningModal, elements.publishButton));
  elements.warningContinue.addEventListener('click', async () => {
    closeModal(elements.warningModal, elements.publishButton);
    await publish();
  });
  elements.warningModal.addEventListener('click', (event) => {
    if (event.target === elements.warningModal) closeModal(elements.warningModal, elements.publishButton);
  });

  document.addEventListener('keydown', handleShortcuts);
}

function initializeDate() {
  const today = new Date();
  const dateString = today.toISOString().slice(0, 10);
  elements.dateInput.value = dateString;
  state.date = dateString;
  loadData(state.date);

  const storedTheme = localStorage.getItem('menu-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = storedTheme || (prefersDark ? 'dark' : 'light');
  elements.themeSwitch.checked = theme === 'dark';
  applyTheme(theme);
}

function loadData(date) {
  if (!date) return;
  startSkeleton();
  api.loadByDate(date).then((data) => {
    resetCards();
    if (data) {
      const items = Array.isArray(data.items) ? data.items : [];
      state.status = data.status;
      state.lastUpdated = data.lastUpdated;
      state.items = new Map(items.map((item) => [item.slot, item]));
    } else {
      state.status = 'draft';
      state.lastUpdated = null;
      state.items = new Map();
    }
    state.previews = new Map();
    populateCards();
    updateStatusBadge();
    stopSkeleton();
  });
}

function populateCards() {
  const cards = elements.cardGrid.querySelectorAll('.menu-card');
  cards.forEach((card) => {
    const slot = Number(card.dataset.slot);
    const item = state.items.get(slot);
    const nameInput = card.querySelector('input[name="name"]');
    const descTextarea = card.querySelector('textarea[name="desc"]');
    const altInput = card.querySelector('input[name="alt"]');
    const previewImg = card.querySelector('.preview img');
    const placeholder = card.querySelector('.preview-placeholder');
    const fileLabel = card.querySelector('.file-name');
    const counter = card.querySelector('.char-counter .count');

    if (item) {
      nameInput.value = item.name || '';
      descTextarea.value = item.desc || '';
      altInput.value = item.alt || '';
      fileLabel.textContent = item.hasImage ? (item.imageName || '画像あり') : '画像未選択';
    } else {
      nameInput.value = '';
      descTextarea.value = '';
      altInput.value = '';
      fileLabel.textContent = '画像未選択';
    }

    counter.textContent = (DESCRIPTION_LIMIT - descTextarea.value.length).toString();
    previewImg.src = '';
    previewImg.style.display = 'none';
    placeholder.style.display = 'flex';
  });

  const timestamp = state.lastUpdated ? new Date(state.lastUpdated) : null;
  elements.lastUpdated.textContent = timestamp ? `保存済み ${formatTime(timestamp)}` : '保存済み --:--';
}

function resetCards() {
  const cards = elements.cardGrid.querySelectorAll('.menu-card');
  cards.forEach((card) => {
    card.querySelector('input[name="name"]').value = '';
    card.querySelector('textarea[name="desc"]').value = '';
    card.querySelector('input[name="alt"]').value = '';
    card.querySelector('.preview img').style.display = 'none';
    card.querySelector('.preview-placeholder').style.display = 'flex';
    card.querySelector('.file-name').textContent = '画像未選択';
    card.querySelector('.char-counter .count').textContent = DESCRIPTION_LIMIT.toString();
  });
}

function clearCard(card) {
  const slot = Number(card.dataset.slot);
  card.querySelector('input[name="name"]').value = '';
  card.querySelector('textarea[name="desc"]').value = '';
  card.querySelector('input[name="alt"]').value = '';
  const fileInput = card.querySelector('.file-input');
  if (fileInput) {
    fileInput.value = '';
  }
  const previewImg = card.querySelector('.preview img');
  previewImg.src = '';
  previewImg.style.display = 'none';
  card.querySelector('.preview-placeholder').style.display = 'flex';
  card.querySelector('.file-name').textContent = '画像未選択';
  card.querySelector('.char-counter .count').textContent = DESCRIPTION_LIMIT.toString();
  state.items.delete(slot);
  state.previews.delete(slot);
}

function handleFile(file, { slot, previewImg, previewPlaceholder, fileNameLabel }) {
  if (!file) return;
  const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    showToast('jpg / png / webp 形式のみアップロードできます', 'error');
    return;
  }

  const reader = new FileReader();
  reader.onload = (event) => {
    previewImg.src = event.target.result;
    previewImg.style.display = 'block';
    previewPlaceholder.style.display = 'none';
    fileNameLabel.textContent = file.name;
    state.previews.set(slot, event.target.result);
    const slotState = state.items.get(slot) || { slot };
    state.items.set(slot, {
      ...slotState,
      slot,
      name: slotState.name || '',
      desc: slotState.desc || '',
      alt: slotState.alt || '',
      hasImage: true,
      imageName: file.name
    });
  };

  reader.readAsDataURL(file);
}

function toggleTheme(event) {
  applyTheme(event.target.checked ? 'dark' : 'light');
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('menu-theme', theme);
}

function updateStatusBadge() {
  elements.statusBadge.dataset.status = state.status;
  elements.statusBadge.textContent = state.status === 'published' ? '公開済み' : '下書き';
}

async function saveDraft() {
  const payload = buildPayload('draft');
  await animateProgress(async () => {
    await api.saveDraft(state.date, payload);
  });
  state.status = 'draft';
  state.lastUpdated = payload.lastUpdated;
  updateStatusBadge();
  elements.lastUpdated.textContent = `保存済み ${formatTime(new Date(state.lastUpdated))}`;
  showToast('下書きを保存しました', 'success');
}

async function attemptPublish() {
  const missing = validateBeforePublish();
  if (missing.length) {
    elements.warningList.innerHTML = '';
    missing.forEach((slot) => {
      const li = document.createElement('li');
      li.textContent = `スロット ${slot.toString().padStart(2, '0')}`;
      elements.warningList.appendChild(li);
    });
    openModal(elements.warningModal);
    return;
  }
  await publish();
}

async function publish() {
  const payload = buildPayload('published');
  await animateProgress(async () => {
    await api.publish(state.date, payload);
  });
  state.status = 'published';
  state.lastUpdated = payload.lastUpdated;
  updateStatusBadge();
  elements.lastUpdated.textContent = `保存済み ${formatTime(new Date(state.lastUpdated))}`;
  showToast('公開が完了しました', 'success');
}

function buildPayload(status) {
  gatherCardState();
  const items = [];
  for (let i = 1; i <= TOTAL_SLOTS; i += 1) {
    const item = state.items.get(i);
    if (!item) continue;
    const hasContent = item.name || item.desc || item.alt || item.hasImage;
    if (!hasContent) continue;
    items.push({
      slot: i,
      name: item.name || '',
      desc: item.desc || '',
      alt: item.alt || '',
      hasImage: Boolean(item.hasImage),
      imageName: item.imageName || ''
    });
  }
  const now = toLocalISOString();
  return {
    date: state.date,
    status,
    lastUpdated: now,
    items
  };
}

function validateBeforePublish() {
  const missing = [];
  for (let i = 1; i <= TOTAL_SLOTS; i += 1) {
    const item = state.items.get(i);
    const hasName = item && item.name && item.name.length > 0;
    const hasImage = item && item.hasImage;
    if (!hasName || !hasImage) {
      missing.push(i);
    }
  }
  return missing;
}

function showToast(message, variant = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${variant}`;
  toast.textContent = message;
  elements.toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function openModal(modal) {
  modal.hidden = false;
  const focusable = modal.querySelector('button, [href], input, textarea');
  if (focusable) {
    focusable.focus();
  }
}

function closeModal(modal, focusTarget = elements.helpButton) {
  modal.hidden = true;
  if (focusTarget) {
    focusTarget.focus();
  }
}

function startSkeleton() {
  elements.cardGrid.classList.add('loading');
}

function stopSkeleton() {
  elements.cardGrid.classList.remove('loading');
}

function animateProgress(callback) {
  elements.progressBar.hidden = false;
  elements.progressFill.style.width = '10%';
  elements.progressBar.setAttribute('aria-valuenow', '10');
  return new Promise((resolve) => {
    setTimeout(async () => {
      elements.progressFill.style.width = '70%';
      elements.progressBar.setAttribute('aria-valuenow', '70');
      await callback();
      elements.progressFill.style.width = '100%';
      elements.progressBar.setAttribute('aria-valuenow', '100');
      setTimeout(() => {
        elements.progressBar.hidden = true;
        elements.progressFill.style.width = '0%';
        elements.progressBar.setAttribute('aria-valuenow', '0');
        resolve();
      }, 300);
    }, 150);
  });
}

function copyFromPreviousDay() {
  const currentDate = new Date(state.date);
  if (Number.isNaN(currentDate.valueOf())) return;
  const previous = new Date(currentDate);
  previous.setDate(previous.getDate() - 1);
  const prevKey = previous.toISOString().slice(0, 10);
  api.copyFromDate(prevKey).then((data) => {
    if (!data) {
      showToast('前日のデータはありません', 'warning');
      return;
    }
    const items = Array.isArray(data.items) ? data.items : [];
    state.items = new Map(items.map((item) => [item.slot, { ...item, hasImage: false, imageName: '' }]));
    state.previews = new Map();
    state.status = 'draft';
    state.lastUpdated = toLocalISOString();
    populateCards();
    updateStatusBadge();
    elements.lastUpdated.textContent = `保存済み ${formatTime(new Date(state.lastUpdated))}`;
    showToast('前日の内容をコピーしました（画像は再設定してください）', 'success');
  });
}

function handleShortcuts(event) {
  const isCtrl = event.ctrlKey || event.metaKey;
  if (isCtrl && event.key.toLowerCase() === 's') {
    event.preventDefault();
    saveDraft();
  }
  if (isCtrl && event.key === 'Enter') {
    event.preventDefault();
    attemptPublish();
  }
  if (event.key === 'Escape') {
    if (state.activeCard) {
      clearCard(state.activeCard);
    }
  }
}

function formatTime(date) {
  const hour = date.getHours().toString().padStart(2, '0');
  const minute = date.getMinutes().toString().padStart(2, '0');
  return `${hour}:${minute}`;
}

function toLocalISOString(date = new Date()) {
  const pad = (number) => number.toString().padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  const offsetMinutes = -date.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const offsetHour = pad(Math.floor(Math.abs(offsetMinutes) / 60));
  const offsetMinute = pad(Math.abs(offsetMinutes) % 60);
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${sign}${offsetHour}:${offsetMinute}`;
}

function gatherCardState() {
  const cards = elements.cardGrid.querySelectorAll('.menu-card');
  cards.forEach((card) => {
    const slot = Number(card.dataset.slot);
    const name = card.querySelector('input[name="name"]').value.trim();
    const desc = card.querySelector('textarea[name="desc"]').value.trim();
    const alt = card.querySelector('input[name="alt"]').value.trim();
    const hasPreview = state.previews.has(slot);
    const fileLabel = card.querySelector('.file-name').textContent;
    const hasImage = hasPreview || (state.items.get(slot)?.hasImage ?? false);
    state.items.set(slot, {
      slot,
      name,
      desc,
      alt,
      hasImage,
      imageName: hasImage ? (state.items.get(slot)?.imageName || fileLabel || '') : ''
    });
  });
}

function openHelp() {
  openModal(elements.helpModal);
}

// expose for debugging
window.dailyMenuApp = {
  state,
  saveDraft,
  attemptPublish,
  openHelp
};
