import { $, createEl } from './utils.js';

export const renderCategories = ({ categories, activeCategoryId, onSelect }) => {
  const wrap = $('#category-nav');
  wrap.innerHTML = '';

  const allBtn = createEl('button', 'category-btn', 'すべて');
  allBtn.style.background = '#8e7d63';
  allBtn.classList.toggle('active', !activeCategoryId);
  allBtn.addEventListener('click', () => onSelect(null));
  wrap.appendChild(allBtn);

  categories.filter((c) => c.active).sort((a,b) => a.sort_order - b.sort_order).forEach((cat) => {
    const btn = createEl('button', 'category-btn', cat.label);
    btn.style.background = cat.color;
    btn.classList.toggle('active', activeCategoryId === cat.id);
    btn.setAttribute('aria-label', `${cat.label}カテゴリ`);
    btn.addEventListener('click', () => onSelect(cat.id));
    wrap.appendChild(btn);
  });
};

export const renderCards = ({ cards, selectedIds, onAdd, onSpeak, settings }) => {
  const grid = $('#cards-grid');
  const tpl = $('#card-template');
  grid.innerHTML = '';

  cards.forEach((card) => {
    const frag = tpl.content.cloneNode(true);
    const cardEl = frag.querySelector('.card-item');
    const img = frag.querySelector('.card-image');
    const label = frag.querySelector('.card-label');
    const speakBtn = frag.querySelector('.speak-card');

    cardEl.classList.toggle('selected', selectedIds.includes(card.id));
    cardEl.setAttribute('aria-label', `${card.label}カード`);
    label.textContent = settings.showLabels ? card.label : '';
    img.src = card.image_src || 'assets/ui/placeholder-card.svg';
    img.alt = card.label;
    img.onerror = () => { img.src = 'assets/ui/placeholder-card.svg'; };

    cardEl.addEventListener('click', () => onAdd(card));
    cardEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onAdd(card);
      }
    });
    speakBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      onSpeak(card);
    });

    grid.appendChild(frag);
  });
};

export const renderSmallList = ({ elementId, cards }) => {
  const wrap = $(elementId);
  wrap.innerHTML = '';
  cards.forEach((card) => {
    const item = createEl('div', 'small-card', card.label);
    wrap.appendChild(item);
  });
};

export const renderSentence = ({ cards, onMoveLeft, onMoveRight, onRemove }) => {
  const sentenceCards = $('#sentence-cards');
  const sentenceText = $('#sentence-text');
  sentenceCards.innerHTML = '';

  cards.forEach((card, index) => {
    const chip = createEl('div', 'sentence-chip');
    chip.appendChild(createEl('span', '', card.label));

    const left = createEl('button', 'btn', '←');
    left.setAttribute('aria-label', '左へ移動');
    left.addEventListener('click', () => onMoveLeft(index));

    const right = createEl('button', 'btn', '→');
    right.setAttribute('aria-label', '右へ移動');
    right.addEventListener('click', () => onMoveRight(index));

    const del = createEl('button', 'btn danger', '✕');
    del.setAttribute('aria-label', '削除');
    del.addEventListener('click', () => onRemove(index));

    chip.append(left, right, del);
    sentenceCards.appendChild(chip);
  });

  sentenceText.textContent = cards.length ? cards.map((c) => c.reading || c.label).join(' ') : 'ここに文が表示されます。';
};

export const setFilterText = (text) => {
  $('#active-filter').textContent = text;
};

export const showError = (text) => {
  const banner = $('#error-banner');
  banner.textContent = text;
  banner.hidden = !text;
};
