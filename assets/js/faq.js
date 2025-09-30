import { qs, createEl } from './utils.js';

const FAQS = [
  {
    id: 'f1',
    category: 'estimate',
    question: '概算見積はどのくらいで提示いただけますか？',
    answer: 'ご相談内容をヒアリング後、3営業日以内に概算見積をご提示いたします。現地調査が必要な場合はその旨をご案内いたします。'
  },
  {
    id: 'f2',
    category: 'estimate',
    question: '設計から施工まで一括で依頼する場合の流れを教えてください。',
    answer: '企画ヒアリング→基本設計→実施設計→見積→契約→施工→引き渡しの流れとなります。各フェーズで進捗報告と承認プロセスを設けています。'
  },
  {
    id: 'f3',
    category: 'schedule',
    question: '工期の短縮はどの範囲まで対応可能ですか？',
    answer: '施工条件や規模により異なりますが、工程の並行化や夜間施工などで最大20%程度の短縮実績があります。安全性を損なわない範囲で最適化いたします。'
  },
  {
    id: 'f4',
    category: 'schedule',
    question: '悪天候時の工程遅延対策はありますか？',
    answer: '気象予報データを活用した事前計画と、仮設屋根・除雪機器の手配により遅延リスクを最小化しています。状況に応じた工程見直しをご提案します。'
  },
  {
    id: 'f5',
    category: 'warranty',
    question: '竣工後の保証期間はどれくらいですか？',
    answer: '構造躯体は10年、防水は10年、設備は2年を基本保証期間としております。延長保証についてもご相談ください。'
  },
  {
    id: 'f6',
    category: 'warranty',
    question: '定期点検の頻度と内容を教えてください。',
    answer: '引き渡し後1年・2年・5年・10年のタイミングで、構造・外装・設備を対象とした総合点検を実施いたします。'
  },
  {
    id: 'f7',
    category: 'estimate',
    question: '他社設計の図面でも施工依頼できますか？',
    answer: '可能です。構造安全性や仕様の確認を行い、必要に応じて改善提案を差し上げたうえで施工いたします。'
  },
  {
    id: 'f8',
    category: 'schedule',
    question: '夜間や休日の施工は対応可能ですか？',
    answer: '近隣環境への配慮が可能な範囲で、夜間・休日施工にも対応しております。行政手続きが必要な場合は弊社で代行いたします。'
  }
];

const CATEGORY_LABELS = {
  all: 'すべて',
  estimate: '見積',
  schedule: '工期',
  warranty: '保証'
};

export const initFaq = () => {
  const filtersContainer = qs('#faq-filters');
  const list = qs('#faq-list');
  if (!filtersContainer || !list) return;

  let activeCategory = 'all';
  const closeStates = new Map();

  const renderFilters = () => {
    filtersContainer.innerHTML = '';
    Object.entries(CATEGORY_LABELS).forEach(([value, label]) => {
      if (value !== 'all' && !FAQS.some((item) => item.category === value)) return;
      const chip = createEl('button', {
        className: 'faq-chip',
        text: label,
        attrs: {
          type: 'button',
          'data-category': value,
          'aria-pressed': String(activeCategory === value)
        }
      });
      chip.addEventListener('click', () => {
        activeCategory = value;
        renderFilters();
        renderList();
      });
      filtersContainer.appendChild(chip);
    });
  };

  const renderList = () => {
    list.innerHTML = '';
    const items = FAQS.filter((item) => activeCategory === 'all' || item.category === activeCategory);
    if (!items.length) {
      list.appendChild(createEl('p', { text: '該当する質問はありません。' }));
      return;
    }
    items.forEach((item) => {
      const isOpen = closeStates.get(item.id) ?? false;
      const wrapper = createEl('div', { className: 'accordion-item', attrs: { 'data-faq-id': item.id } });
      const button = createEl('button', {
        className: 'accordion-button',
        text: item.question,
        attrs: {
          type: 'button',
          'aria-expanded': String(isOpen),
          'aria-controls': `faq-panel-${item.id}`,
          id: `faq-button-${item.id}`
        }
      });
      const panel = createEl('div', {
        className: 'accordion-panel',
        attrs: {
          id: `faq-panel-${item.id}`,
          role: 'region',
          'aria-labelledby': `faq-button-${item.id}`,
          'aria-hidden': String(!isOpen)
        }
      });
      panel.appendChild(createEl('p', { text: item.answer }));
      button.addEventListener('click', () => {
        const currentlyOpen = button.getAttribute('aria-expanded') === 'true';
        button.setAttribute('aria-expanded', String(!currentlyOpen));
        panel.setAttribute('aria-hidden', String(currentlyOpen));
        closeStates.set(item.id, !currentlyOpen);
        if (!currentlyOpen) {
          panel.style.display = 'block';
        } else {
          panel.style.display = 'none';
        }
      });
      panel.style.display = isOpen ? 'block' : 'none';
      wrapper.append(button, panel);
      list.appendChild(wrapper);
    });
  };

  renderFilters();
  renderList();
};
