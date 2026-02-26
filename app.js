const services = [
  { name: '外壁', desc: '塗装・ひび補修・防水まで、建物を長持ちさせる外壁メンテナンス。' },
  { name: '屋根', desc: '雨漏り診断、カバー工法、葺き替えなど屋根の状態に合わせて対応。' },
  { name: '水回り', desc: 'キッチン・浴室・トイレ・洗面台の交換や使い勝手改善。' },
  { name: '内装', desc: 'クロス・床材・間取り変更など、暮らしに合わせた内装改修。' },
  { name: '外構', desc: '門扉・フェンス・駐車場・アプローチの整備やデザイン提案。' },
  { name: '小修繕', desc: '建具調整、コーキング、軽微な雨漏りなど小さなお困りごとにも対応。' }
];

const cases = [
  { id: 1, title: '外壁塗装・防水改修', category: '外壁', area: '〇〇市中央', ageRange: '21〜30', costMin: 72, costMax: 98, durationDays: 14, highlights: ['高耐候塗料', 'ひび補修', '近隣挨拶'] },
  { id: 2, title: '屋根カバー工法', category: '屋根', area: '△△町東', ageRange: '31〜', costMin: 88, costMax: 130, durationDays: 11, highlights: ['遮熱材', '雨漏り対策', '短工期'] },
  { id: 3, title: '浴室リニューアル', category: '水回り', area: '□□区南', ageRange: '11〜20', costMin: 55, costMax: 94, durationDays: 7, highlights: ['断熱浴槽', '段差解消', '清掃性向上'] },
  { id: 4, title: '店舗内装刷新', category: '店舗', area: '〇〇市駅前', ageRange: '11〜20', costMin: 120, costMax: 220, durationDays: 20, highlights: ['営業動線改善', '照明更新', '短期施工'] },
  { id: 5, title: '外構フェンス新設', category: '外構', area: '△△町西', ageRange: '〜10', costMin: 38, costMax: 70, durationDays: 6, highlights: ['目隠し性向上', '防犯性', '景観調和'] },
  { id: 6, title: '和室から洋室へ改装', category: '内装', area: '□□区北', ageRange: '21〜30', costMin: 48, costMax: 110, durationDays: 10, highlights: ['床断熱', '収納増設', 'バリアフリー'] },
  { id: 7, title: '外壁部分補修', category: '外壁', area: '〇〇市西', ageRange: '31〜', costMin: 26, costMax: 48, durationDays: 4, highlights: ['漏水予防', '色合わせ', '最短着工'] },
  { id: 8, title: '屋根塗装メンテナンス', category: '屋根', area: '△△町中央', ageRange: '11〜20', costMin: 40, costMax: 72, durationDays: 8, highlights: ['遮熱塗装', '下地洗浄', '足場設置'] },
  { id: 9, title: 'キッチン入替工事', category: '水回り', area: '□□区中央', ageRange: '21〜30', costMin: 68, costMax: 140, durationDays: 9, highlights: ['収納改善', '省エネ設備', '配管更新'] },
  { id: 10, title: 'マンション内装改修', category: '内装', area: '〇〇市南', ageRange: '31〜', costMin: 80, costMax: 170, durationDays: 16, highlights: ['騒音配慮', '工程管理', '共用部養生'] },
  { id: 11, title: '駐車場土間打ち', category: '外構', area: '△△町北', ageRange: '〜10', costMin: 42, costMax: 90, durationDays: 5, highlights: ['排水勾配', '耐久仕上げ', '車止め設置'] },
  { id: 12, title: '店舗ファサード補修', category: '店舗', area: '□□区駅前', ageRange: '31〜', costMin: 60, costMax: 120, durationDays: 7, highlights: ['意匠維持', '防水強化', '営業配慮'] }
];

const faq = [
  { q: '見積は無料ですか？', a: 'はい、現地確認を含めて無料です。内容と費用を明確にご説明します。', tags: ['費用', '見積'] },
  { q: '工期はどのくらいかかりますか？', a: '内容により異なりますが、外壁で1〜2週間、水回りで3日〜10日程度が目安です。', tags: ['工期'] },
  { q: '保証はありますか？', a: '施工内容に応じて保証書を発行し、最長10年の保証に対応しています。', tags: ['保証'] },
  { q: '近隣への配慮はしてくれますか？', a: '着工前のご挨拶、騒音時間帯の管理、日々の清掃を徹底しています。', tags: ['近隣', '騒音'] },
  { q: '支払い方法を教えてください。', a: '銀行振込に対応しています。工事規模により分割タイミングをご相談いただけます。', tags: ['支払い'] },
  { q: '小さな修繕でも頼めますか？', a: 'はい、ドア調整やコーキング補修などの小修繕も承ります。', tags: ['小修繕'] },
  { q: '雨漏りの緊急対応は可能ですか？', a: '状況次第で当日対応も可能です。まずはお電話ください。', tags: ['屋根', '緊急'] },
  { q: '工事中は在宅が必要ですか？', a: '外部工事は不在でも進められる場合があります。内装工事は工程ごとにご相談します。', tags: ['工期', '内装'] },
  { q: '追加料金が心配です。', a: '追加が必要な場合は事前説明と合意を徹底し、勝手に進めることはありません。', tags: ['費用', '見積'] },
  { q: '店舗工事の夜間対応はできますか？', a: '営業への影響を抑えるため、工程次第で夜間・休日対応をご提案できます。', tags: ['店舗', '工期'] }
];

const estimateMatrix = {
  base: { 外壁: 60, 屋根: 50, 水回り: 40, 内装: 45, 外構: 35, 小修繕: 8 },
  scale: { 小: 0.8, 中: 1.1, 大: 1.5 },
  age: { '〜10': 0.95, '11〜20': 1.0, '21〜30': 1.15, '31〜': 1.3 },
  property: { 戸建: 1.0, マンション: 1.12, 店舗: 1.25 }
};

const state = {
  caseFilter: 'all',
  chatOpen: false,
  estimateDraft: { type: null, scale: null, age: null, property: null },
  chatStep: 'menu'
};

const els = {
  serviceCards: document.getElementById('service-cards'),
  casesGrid: document.getElementById('cases-grid'),
  filterBtns: document.querySelectorAll('.filter-btn'),
  faqList: document.getElementById('faq-list'),
  chatToggle: document.getElementById('chat-toggle'),
  chatPanel: document.getElementById('chat-panel'),
  chatClose: document.getElementById('chat-close'),
  chatLog: document.getElementById('chat-log'),
  chatActions: document.getElementById('chat-quick-actions'),
  chatForm: document.getElementById('chat-form'),
  chatInput: document.getElementById('chat-input'),
  chatShortcut: document.getElementById('chat-shortcut'),
  contactForm: document.getElementById('contact-form'),
  toast: document.getElementById('toast')
};

const STORAGE_KEY = 'local-construction-chat';

function init() {
  renderServices();
  renderCases();
  bindCaseFilter();
  renderFaq();
  setupAccordion();
  setupSmoothAnchors();
  setupChat();
  setupFormValidation();
  setupReveals();
}

function renderServices() {
  const frag = document.createDocumentFragment();
  services.forEach((service) => {
    const article = document.createElement('article');
    article.className = 'card';
    article.innerHTML = `<span class="service-badge">対応工事</span><h3>${service.name}</h3><p>${service.desc}</p>`;
    frag.appendChild(article);
  });
  els.serviceCards.appendChild(frag);
}

function renderCases() {
  const filtered = state.caseFilter === 'all' ? cases : cases.filter((item) => item.category === state.caseFilter);
  const frag = document.createDocumentFragment();
  filtered.forEach((item) => {
    const article = document.createElement('article');
    article.className = 'card';
    article.innerHTML = `
      <div class="placeholder-image"><span>${item.category} 施工写真</span></div>
      <h3>${item.title}</h3>
      <p class="case-meta">
        <span>地域：${item.area}</span>
        <span>築年数：${item.ageRange}</span>
        <span>費用：${item.costMin}〜${item.costMax}万円</span>
        <span>工期：約${item.durationDays}日</span>
      </p>
      <ul class="highlights">${item.highlights.map((h) => `<li>${h}</li>`).join('')}</ul>
    `;
    frag.appendChild(article);
  });
  els.casesGrid.replaceChildren(frag);
}

function bindCaseFilter() {
  els.filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      state.caseFilter = btn.dataset.filter;
      els.filterBtns.forEach((item) => item.classList.toggle('active', item === btn));
      renderCases();
    });
  });
}

function renderFaq() {
  const frag = document.createDocumentFragment();
  faq.forEach((item, index) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'accordion-item';
    wrapper.innerHTML = `
      <h3>
        <button class="accordion-trigger" type="button" aria-expanded="false" aria-controls="faq-panel-${index}" id="faq-trigger-${index}">
          ${item.q}
        </button>
      </h3>
      <div class="accordion-panel" id="faq-panel-${index}" role="region" aria-labelledby="faq-trigger-${index}" hidden>
        ${item.a}
      </div>
    `;
    frag.appendChild(wrapper);
  });
  els.faqList.appendChild(frag);
}

function setupAccordion() {
  els.faqList.addEventListener('click', (event) => {
    const trigger = event.target.closest('.accordion-trigger');
    if (!trigger) return;
    toggleAccordion(trigger);
  });

  els.faqList.addEventListener('keydown', (event) => {
    const trigger = event.target.closest('.accordion-trigger');
    if (!trigger) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleAccordion(trigger);
    }
  });
}

function toggleAccordion(trigger) {
  const expanded = trigger.getAttribute('aria-expanded') === 'true';
  const panel = document.getElementById(trigger.getAttribute('aria-controls'));
  trigger.setAttribute('aria-expanded', String(!expanded));
  panel.hidden = expanded;
}

function setupSmoothAnchors() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (event) => {
      const targetId = anchor.getAttribute('href');
      const target = document.querySelector(targetId);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

function setupChat() {
  loadChatState();
  renderInitialChat();

  els.chatToggle.addEventListener('click', () => toggleChat());
  els.chatClose.addEventListener('click', () => toggleChat(false));
  els.chatShortcut.addEventListener('click', () => toggleChat(true));

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && state.chatOpen) toggleChat(false);
  });

  els.chatActions.addEventListener('click', (event) => {
    const btn = event.target.closest('button[data-action]');
    if (!btn) return;
    handleChatAction(btn.dataset.action, btn.dataset.value);
  });

  els.chatForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const value = els.chatInput.value.trim();
    if (!value) return;
    appendChat('user', value);
    els.chatInput.value = '';
    replyFaqByKeyword(value);
  });
}

function toggleChat(force) {
  state.chatOpen = typeof force === 'boolean' ? force : !state.chatOpen;
  els.chatPanel.hidden = !state.chatOpen;
  els.chatToggle.setAttribute('aria-expanded', String(state.chatOpen));
  if (state.chatOpen) {
    els.chatInput.focus();
  } else {
    els.chatToggle.focus();
  }
  saveChatState();
}

function renderInitialChat() {
  if (!els.chatLog.children.length) {
    appendChat('bot', 'こんにちは。かんたん質問へようこそ。ご希望に合わせてすぐご案内します。');
  }
  renderMenuActions();
  if (state.chatOpen) {
    els.chatPanel.hidden = false;
    els.chatToggle.setAttribute('aria-expanded', 'true');
  }
}

function renderMenuActions() {
  state.chatStep = 'menu';
  els.chatActions.innerHTML = `
    <button type="button" class="quick-btn" data-action="startEstimate">概算を知りたい</button>
    <button type="button" class="quick-btn" data-action="recommendCases">近い施工事例を見たい</button>
    <button type="button" class="quick-btn" data-action="showFaq">よくある質問</button>
    <button type="button" class="quick-btn" data-action="goContact">オペレーターに相談</button>
  `;
}

function handleChatAction(action, value = '') {
  switch (action) {
    case 'startEstimate':
      appendChat('bot', '概算チェックを始めます。まず工事タイプを選んでください。');
      state.chatStep = 'estimate_type';
      renderOptions(['外壁', '屋根', '水回り', '内装', '外構', '小修繕'], 'estimateType');
      break;
    case 'estimateType':
      state.estimateDraft.type = value;
      appendChat('user', `工事タイプ：${value}`);
      appendChat('bot', '規模を選んでください。');
      state.chatStep = 'estimate_scale';
      renderOptions(['小', '中', '大'], 'estimateScale');
      break;
    case 'estimateScale':
      state.estimateDraft.scale = value;
      appendChat('user', `規模：${value}`);
      appendChat('bot', '築年数を選んでください。');
      state.chatStep = 'estimate_age';
      renderOptions(['〜10', '11〜20', '21〜30', '31〜'], 'estimateAge');
      break;
    case 'estimateAge':
      state.estimateDraft.age = value;
      appendChat('user', `築年数：${value}`);
      appendChat('bot', '物件種別を選んでください。');
      state.chatStep = 'estimate_property';
      renderOptions(['戸建', 'マンション', '店舗'], 'estimateProperty');
      break;
    case 'estimateProperty':
      state.estimateDraft.property = value;
      appendChat('user', `物件種別：${value}`);
      showEstimateResult();
      saveChatState();
      break;
    case 'recommendCases':
      appendChat('bot', '工事タイプ別のおすすめ事例を表示します。');
      renderOptions(['外壁', '屋根', '水回り', '内装', '外構', '店舗'], 'pickCaseType');
      break;
    case 'pickCaseType':
      appendChat('user', `事例タイプ：${value}`);
      recommendCases(value);
      break;
    case 'showFaq':
      appendChat('bot', '気になる項目を選んでください。');
      renderOptions(['費用', '工期', '保証', '近隣', '支払い', '騒音'], 'faqTopic');
      break;
    case 'faqTopic':
      appendChat('user', `質問カテゴリ：${value}`);
      replyFaqByKeyword(value);
      break;
    case 'moreCases':
      document.getElementById('cases').scrollIntoView({ behavior: 'smooth' });
      state.caseFilter = value;
      els.filterBtns.forEach((btn) => btn.classList.toggle('active', btn.dataset.filter === value));
      renderCases();
      appendChat('bot', `「${value}」の実績一覧へ移動しました。`);
      renderMenuActions();
      break;
    case 'goContact':
      appendChat('bot', '担当者へ引き継ぎます。お問い合わせフォームへご案内します。');
      document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
      renderMenuActions();
      break;
    default:
      renderMenuActions();
  }
}

function renderOptions(options, actionName) {
  els.chatActions.innerHTML = options
    .map((option) => `<button type="button" class="quick-btn" data-action="${actionName}" data-value="${option}">${option}</button>`)
    .join('');
}

function showEstimateResult() {
  const { type, scale, age, property } = state.estimateDraft;
  const base = estimateMatrix.base[type];
  const multiplier = estimateMatrix.scale[scale] * estimateMatrix.age[age] * estimateMatrix.property[property];
  const center = base * multiplier;
  const min = Math.round(center * 0.85);
  const max = Math.round(center * 1.2);
  appendChat('bot', `概算レンジ：${min}〜${max}万円です。\n※ 現地調査・下地状況で金額は変動します。`);
  renderMenuActions();
}

function recommendCases(category) {
  const picks = cases.filter((item) => item.category === category).slice(0, 3);
  if (!picks.length) {
    appendChat('bot', '条件に近い事例が見つかりませんでした。フォームからご相談ください。');
    renderMenuActions();
    return;
  }

  picks.forEach((item) => {
    appendChat('bot', `${item.title}\n${item.area} / ${item.costMin}〜${item.costMax}万円 / 約${item.durationDays}日\n要点: ${item.highlights.join('・')}`);
  });

  els.chatActions.innerHTML = `<button type="button" class="quick-btn" data-action="moreCases" data-value="${category}">もっと見る</button>`;
}

function replyFaqByKeyword(input) {
  const normalized = input.trim();
  const matched = faq.find((item) => item.tags.some((tag) => normalized.includes(tag)) || item.q.includes(normalized));
  if (matched) {
    appendChat('bot', `${matched.q}\n${matched.a}`);
  } else {
    appendChat('bot', '該当回答が見つかりませんでした。内容を詳しく入力いただくか、フォームからご相談ください。');
  }
  renderMenuActions();
}

function appendChat(type, text) {
  const msg = document.createElement('p');
  msg.className = `chat-msg ${type}`;
  msg.innerText = text;
  els.chatLog.appendChild(msg);
  els.chatLog.scrollTop = els.chatLog.scrollHeight;
}

function saveChatState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    open: state.chatOpen,
    estimateDraft: state.estimateDraft
  }));
}

function loadChatState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    state.chatOpen = Boolean(parsed.open);
    if (parsed.estimateDraft) {
      state.estimateDraft = { ...state.estimateDraft, ...parsed.estimateDraft };
    }
  } catch {
    // ignore broken localStorage
  }
}

function setupFormValidation() {
  els.contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const email = String(data.get('email') || '');
    const consent = data.get('consent');

    if (!form.checkValidity()) {
      showToast('入力内容をご確認ください。必須項目が未入力です。');
      form.reportValidity();
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast('メールアドレスの形式をご確認ください。');
      return;
    }

    if (!consent) {
      showToast('個人情報の取扱いへの同意が必要です。');
      return;
    }

    form.reset();
    showToast('送信しました。担当者よりご連絡します。');
  });
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.hidden = false;
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    els.toast.hidden = true;
  }, 2600);
}

function setupReveals() {
  const revealTargets = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    revealTargets.forEach((el) => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  revealTargets.forEach((el) => observer.observe(el));
}

init();
