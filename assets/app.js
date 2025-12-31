const state = {
  language: 'en',
  categoryId: 'all',
  search: '',
  cards: [],
  categories: [],
  responses: {},
  history: [],
  activeCardId: null,
};

const storageKeys = {
  responses: 'translation-cards.responses',
  history: 'translation-cards.history',
  language: 'translation-cards.language',
};

const replyLabels = {
  ok: { ja: 'OK', en: 'OK', zh: '好的', ko: '확인' },
  yes: { ja: 'はい', en: 'Yes', zh: '是的', ko: '네' },
  no: { ja: 'いいえ', en: 'No', zh: '不', ko: '아니요' },
  wait: { ja: '少々お待ちください', en: 'Please wait', zh: '请稍等', ko: '잠시만요' },
  custom: { ja: 'メモ', en: 'Note', zh: '备注', ko: '메모' },
};

const languageOptions = [
  { code: 'en', label: 'English' },
  { code: 'zh', label: '中文' },
  { code: 'ko', label: '한국어' },
];

const appElements = {
  cardGrid: document.getElementById('cardGrid'),
  categoryFilter: document.getElementById('categoryFilter'),
  languageSelector: document.getElementById('languageSelector'),
  searchInput: document.getElementById('searchInput'),
  detailCard: document.getElementById('detailCard'),
  homeView: document.getElementById('homeView'),
  detailView: document.getElementById('detailView'),
  historyView: document.getElementById('historyView'),
  backButton: document.getElementById('backButton'),
  historyList: document.getElementById('historyList'),
  navButtons: document.querySelectorAll('.nav-button'),
};

const loadStorage = () => {
  const storedResponses = localStorage.getItem(storageKeys.responses);
  const storedHistory = localStorage.getItem(storageKeys.history);
  const storedLanguage = localStorage.getItem(storageKeys.language);

  if (storedResponses) {
    try {
      state.responses = JSON.parse(storedResponses);
    } catch {
      state.responses = {};
    }
  }

  if (storedHistory) {
    try {
      state.history = JSON.parse(storedHistory);
    } catch {
      state.history = [];
    }
  }

  if (storedLanguage && ['en', 'zh', 'ko'].includes(storedLanguage)) {
    state.language = storedLanguage;
  }
};

const saveResponses = () => {
  localStorage.setItem(storageKeys.responses, JSON.stringify(state.responses));
};

const saveHistory = () => {
  localStorage.setItem(storageKeys.history, JSON.stringify(state.history));
};

const saveLanguage = () => {
  localStorage.setItem(storageKeys.language, state.language);
};

const setActiveView = (view) => {
  ['home', 'detail', 'history'].forEach((id) => {
    const element = appElements[`${id}View`];
    if (element) {
      element.classList.toggle('view-active', id === view);
    }
  });

  appElements.navButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.view === view);
  });
};

const getStatus = (cardId) => state.responses[cardId]?.status ?? 'idle';

const addHistory = (item) => {
  state.history = [item, ...state.history].slice(0, 20);
  saveHistory();
  renderHistory();
};

const renderLanguageSelector = () => {
  appElements.languageSelector.innerHTML = '';
  languageOptions.forEach((option) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = option.label;
    button.classList.toggle('active', state.language === option.code);
    button.addEventListener('click', () => {
      state.language = option.code;
      saveLanguage();
      renderLanguageSelector();
      renderCards();
      if (state.activeCardId) {
        renderDetail();
      }
    });
    appElements.languageSelector.appendChild(button);
  });
};

const renderCategories = () => {
  const fragment = document.createDocumentFragment();
  const allButton = document.createElement('button');
  allButton.type = 'button';
  allButton.textContent = 'すべて';
  allButton.classList.toggle('active', state.categoryId === 'all');
  allButton.addEventListener('click', () => {
    state.categoryId = 'all';
    renderCategories();
    renderCards();
  });
  fragment.appendChild(allButton);

  state.categories.forEach((category) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = category.name_ja;
    button.classList.toggle('active', state.categoryId === category.id);
    button.addEventListener('click', () => {
      state.categoryId = category.id;
      renderCategories();
      renderCards();
    });
    fragment.appendChild(button);
  });

  appElements.categoryFilter.innerHTML = '';
  appElements.categoryFilter.appendChild(fragment);
};

const renderCards = () => {
  const searchTerm = state.search.trim().toLowerCase();
  const filtered = state.cards.filter((card) => {
    const matchesCategory = state.categoryId === 'all' || card.categoryId === state.categoryId;
    const matchesSearch =
      !searchTerm ||
      card.text.ja.toLowerCase().includes(searchTerm) ||
      card.text[state.language].toLowerCase().includes(searchTerm);
    return matchesCategory && matchesSearch;
  });

  appElements.cardGrid.innerHTML = '';

  filtered.forEach((card) => {
    const cardElement = document.createElement('div');
    cardElement.className = 'card-item';
    cardElement.addEventListener('click', () => {
      state.activeCardId = card.id;
      renderDetail();
      setActiveView('detail');
    });

    const badge = document.createElement('span');
    const status = getStatus(card.id);
    badge.className = `status-badge status-${status}`;
    badge.textContent = status === 'idle' ? '未回答' : status.toUpperCase();

    const foreignText = document.createElement('div');
    foreignText.className = 'foreign-text';
    foreignText.textContent = card.text[state.language];

    const japaneseText = document.createElement('div');
    japaneseText.className = 'japanese-text';
    japaneseText.textContent = card.text.ja;

    cardElement.appendChild(badge);
    cardElement.appendChild(foreignText);
    cardElement.appendChild(japaneseText);

    appElements.cardGrid.appendChild(cardElement);
  });
};

const renderDetail = () => {
  const card = state.cards.find((item) => item.id === state.activeCardId);
  if (!card) return;

  const response = state.responses[card.id];
  const status = response?.status ?? 'idle';
  const replyLabel = response?.status ? replyLabels[response.status][state.language] : '';
  const replyText = response?.status === 'custom' && response?.memo ? response.memo : replyLabel;
  const japaneseLabel = response?.status ? replyLabels[response.status].ja : '';

  appElements.detailCard.innerHTML = '';
  appElements.detailCard.className = `detail-card status-${status}`;

  const foreignSection = document.createElement('div');
  foreignSection.className = 'detail-section foreign';
  foreignSection.innerHTML = `
    <p class="section-label">Foreign</p>
    <p class="foreign-text">${card.text[state.language]}</p>
  `;

  if (status !== 'idle') {
    const replyDisplay = document.createElement('div');
    replyDisplay.className = 'reply-display';
    replyDisplay.innerHTML = `
      <p class="reply-label">Reply</p>
      <p class="reply-text">${replyText}</p>
    `;
    foreignSection.appendChild(replyDisplay);
  }

  const japaneseSection = document.createElement('div');
  japaneseSection.className = 'detail-section japanese';
  japaneseSection.innerHTML = `
    <p class="section-label">日本語</p>
    <p class="japanese-text">${card.text.ja}</p>
  `;

  if (status !== 'idle') {
    const jpReply = document.createElement('p');
    jpReply.className = 'japanese-reply';
    jpReply.textContent = japaneseLabel;
    japaneseSection.appendChild(jpReply);
  }

  const actions = document.createElement('div');
  actions.className = 'detail-actions';

  const buttons = document.createElement('div');
  buttons.className = 'reply-buttons';

  ['ok', 'yes', 'no', 'wait'].forEach((statusKey) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = statusKey.toUpperCase();
    button.addEventListener('click', () => {
      const updatedAt = new Date().toISOString();
      state.responses[card.id] = { status: statusKey, memo: '', updatedAt };
      saveResponses();
      addHistory({
        id: `${card.id}-${updatedAt}`,
        cardId: card.id,
        status: statusKey,
        memo: '',
        createdAt: updatedAt,
      });
      renderCards();
      renderDetail();
    });
    buttons.appendChild(button);
  });

  const resetButton = document.createElement('button');
  resetButton.type = 'button';
  resetButton.className = 'reset-button';
  resetButton.textContent = 'リセット';
  resetButton.addEventListener('click', () => {
    delete state.responses[card.id];
    saveResponses();
    renderCards();
    renderDetail();
  });
  buttons.appendChild(resetButton);

  actions.appendChild(buttons);

  const customSection = document.createElement('div');
  customSection.innerHTML = `
    <label>任意メモで返答</label>
    <div class="input-row">
      <input type="text" placeholder="例：今は満席です" />
      <button type="button">送信</button>
    </div>
  `;

  const customInput = customSection.querySelector('input');
  const customButton = customSection.querySelector('button');
  customButton.addEventListener('click', () => {
    const value = customInput.value.trim();
    if (!value) return;
    const updatedAt = new Date().toISOString();
    state.responses[card.id] = { status: 'custom', memo: value, updatedAt };
    saveResponses();
    addHistory({
      id: `${card.id}-${updatedAt}`,
      cardId: card.id,
      status: 'custom',
      memo: value,
      createdAt: updatedAt,
    });
    customInput.value = '';
    renderCards();
    renderDetail();
  });

  actions.appendChild(customSection);

  const memoSection = document.createElement('div');
  memoSection.innerHTML = `
    <label>メモを残す</label>
    <div class="input-row">
      <input type="text" placeholder="短いメモを入力" />
      <button type="button">保存</button>
    </div>
  `;

  const memoInput = memoSection.querySelector('input');
  const memoButton = memoSection.querySelector('button');
  memoButton.addEventListener('click', () => {
    const value = memoInput.value.trim();
    if (!value) return;
    const createdAt = new Date().toISOString();
    addHistory({
      id: `${card.id}-memo-${createdAt}`,
      cardId: card.id,
      status: state.responses[card.id]?.status ?? 'idle',
      memo: value,
      createdAt,
    });
    memoInput.value = '';
  });

  actions.appendChild(memoSection);

  appElements.detailCard.appendChild(foreignSection);
  appElements.detailCard.appendChild(japaneseSection);
  appElements.detailCard.appendChild(actions);
};

const renderHistory = () => {
  appElements.historyList.innerHTML = '';
  if (state.history.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = 'まだ履歴がありません。';
    appElements.historyList.appendChild(empty);
    return;
  }

  state.history.forEach((item) => {
    const card = state.cards.find((cardItem) => cardItem.id === item.cardId);
    const row = document.createElement('div');
    row.className = 'history-item';

    const info = document.createElement('div');
    info.innerHTML = `
      <p class="card-title">${card?.text.ja ?? item.cardId}</p>
      <p class="timestamp">${new Date(item.createdAt).toLocaleString()}</p>
    `;

    const detail = document.createElement('div');
    detail.className = 'history-detail';
    const status = document.createElement('span');
    status.className = 'history-status';
    status.textContent = item.status.toUpperCase();
    detail.appendChild(status);

    if (item.memo) {
      const memo = document.createElement('span');
      memo.className = 'history-memo';
      memo.textContent = item.memo;
      detail.appendChild(memo);
    }

    row.appendChild(info);
    row.appendChild(detail);

    appElements.historyList.appendChild(row);
  });
};

const initNav = () => {
  appElements.navButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const view = button.dataset.view;
      if (view === 'home') {
        setActiveView('home');
      }
      if (view === 'history') {
        renderHistory();
        setActiveView('history');
      }
    });
  });

  appElements.backButton.addEventListener('click', () => {
    setActiveView('home');
  });
};

const initSearch = () => {
  appElements.searchInput.addEventListener('input', (event) => {
    state.search = event.target.value;
    renderCards();
  });
};

const bootstrap = async () => {
  loadStorage();
  initNav();
  initSearch();

  const [cardsResponse, categoriesResponse] = await Promise.all([
    fetch('/data/cards.json'),
    fetch('/data/categories.json'),
  ]);

  state.cards = await cardsResponse.json();
  state.categories = (await categoriesResponse.json()).sort(
    (a, b) => a.sortOrder - b.sortOrder
  );

  renderLanguageSelector();
  renderCategories();
  renderCards();
};

bootstrap();
