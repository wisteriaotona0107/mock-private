import { loadInitialData } from './data-loader.js';
import { createSentenceBuilder } from './sentence-builder.js';
import { createSpeaker } from './speech.js';
import { readRecent, pushRecent, readSettings, storageAvailable } from './store.js';
import { applySettingsToDOM, bindSettingsDialog } from './settings.js';
import { renderCategories, renderCards, renderSentence, renderSmallList, setFilterText, showError } from './ui.js';
import { $, debounce } from './utils.js';

const state = {
  categories: [],
  cards: [],
  activeCategoryId: null,
  query: '',
  settings: null
};

const sentenceBuilder = createSentenceBuilder();
const speaker = createSpeaker();

const getVisibleCards = () => {
  const q = state.query.trim().toLowerCase();
  return state.cards
    .filter((card) => card.active)
    .filter((card) => !state.activeCategoryId || card.category_id === state.activeCategoryId)
    .filter((card) => !q || card.label.toLowerCase().includes(q) || card.tags.some((t) => t.toLowerCase().includes(q)))
    .sort((a, b) => a.sort_order - b.sort_order);
};

const refresh = () => {
  const sentence = sentenceBuilder.getItems();
  const visibleCards = getVisibleCards();
  const favorites = state.cards.filter((c) => c.favorite && c.active).slice(0, 8);
  const recentIds = readRecent();
  const recent = recentIds.map((id) => state.cards.find((c) => c.id === id)).filter(Boolean);

  renderCategories({
    categories: state.categories,
    activeCategoryId: state.activeCategoryId,
    onSelect: (catId) => {
      state.activeCategoryId = catId;
      const label = catId ? state.categories.find((c) => c.id === catId)?.label : 'すべて表示';
      setFilterText(`${label}${state.query ? ` / 検索: ${state.query}` : ''}`);
      refresh();
    }
  });

  renderCards({
    cards: visibleCards,
    selectedIds: sentence.map((c) => c.id),
    settings: state.settings,
    onAdd: (card) => {
      sentenceBuilder.add(card);
      pushRecent(card.id);
      refresh();
    },
    onSpeak: (card) => {
      const ok = speaker.speakCard(card, state.settings);
      if (!ok) showError('読み上げが利用できません。設定またはブラウザ対応をご確認ください。');
    }
  });

  renderSentence({
    cards: sentence,
    onMoveLeft: (index) => {
      sentenceBuilder.moveLeft(index);
      refresh();
    },
    onMoveRight: (index) => {
      sentenceBuilder.moveRight(index);
      refresh();
    },
    onRemove: (index) => {
      sentenceBuilder.remove(index);
      refresh();
    }
  });

  renderSmallList({ elementId: '#favorites-list', cards: favorites });
  renderSmallList({ elementId: '#recent-list', cards: recent });
};

const bindEvents = () => {
  $('#search-input').addEventListener('input', debounce((event) => {
    state.query = event.target.value;
    refresh();
  }, 150));

  $('#clear-sentence').addEventListener('click', () => {
    sentenceBuilder.clear();
    refresh();
  });

  $('#speak-sentence').addEventListener('click', () => {
    const ok = speaker.speakSentence(sentenceBuilder.getItems(), state.settings);
    if (!ok) showError('文の読み上げに対応していない環境です。');
  });
};

const init = async () => {
  try {
    const { categories, cards, settings } = await loadInitialData();
    state.categories = categories;
    state.cards = cards;
    state.settings = readSettings(settings);

    if (!storageAvailable) {
      showError('この環境では設定保存が利用できないため、一部機能は保存されません。');
    }
    if (!speaker.support) {
      showError('このブラウザは音声読み上げに未対応です。');
    }

    applySettingsToDOM(state.settings);
    bindSettingsDialog(state.settings, (newSettings) => {
      applySettingsToDOM(newSettings);
      refresh();
    });

    bindEvents();
    setFilterText('すべて表示');
    refresh();
  } catch (error) {
    showError(`初期データの読み込みに失敗しました: ${error.message}`);
  }
};

init();
