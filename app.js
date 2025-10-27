// Data definitions - URLs are placeholders and can be replaced with /img/NNN.jpg in production.
const SAKE_LIST = [
  {
    id: 'kyoto-01',
    name: '京の雫 純米吟醸',
    type: 'Junmai Ginjo',
    aroma: '白桃・白い花',
    taste: 'やわらかな旨みと上品な余韻',
    temp: '10-12℃',
    pairing: '練り切り / 出汁巻き',
    brewery: '洛中酒造',
    origin: '京都・伏見',
    story: '町家の井戸水を用い、木桶で醸した限定品。淡い香りと透明感のある旨味が特徴。',
    abv: '15%',
    serve: '花冷え',
    imageUrl: 'https://images.unsplash.com/photo-1543512214-318c7553f230'
  },
  {
    id: 'kyoto-02',
    name: '霞路 生酛純米',
    type: 'Kimoto Junmai',
    aroma: '炊き立ての米・麹',
    taste: '旨味の層が重なり、余韻に酸が伸びる',
    temp: '40-45℃',
    pairing: '鴨ロース / 西京焼き',
    brewery: '古町醸造',
    origin: '京都・宮津',
    story: '杉の酒槽で搾った生酛仕込み。温めると麹の甘い香りが開きます。',
    abv: '16%',
    serve: 'ぬる燗',
    imageUrl: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1c'
  },
  {
    id: 'kyoto-03',
    name: '川霧 しぼりたて',
    type: 'Nama Genshu',
    aroma: '青リンゴ・若草',
    taste: '瑞々しい甘みと爽快なガス感',
    temp: '6-8℃',
    pairing: '旬野菜の天ぷら / 造里',
    brewery: '加茂川酒造',
    origin: '京都・加茂',
    story: '搾りたてをそのまま瓶詰め。川霧を思わせるような微発泡感が魅力。',
    abv: '17%',
    serve: '雪冷え',
    imageUrl: 'https://images.unsplash.com/photo-1582819230470-74b5530b7365'
  },
  {
    id: 'kyoto-04',
    name: '宵星 大吟醸',
    type: 'Daiginjo',
    aroma: 'ライチ・白い花・ラムネ',
    taste: '透明感のある甘みと凛としたキレ',
    temp: '8-10℃',
    pairing: '鮑の肝和え / 季節の和菓子',
    brewery: '嵯峨蔵',
    origin: '京都・嵯峨野',
    story: '扇状地の棚田で育てた山田錦を35%まで磨いた贅沢な仕込み。',
    abv: '16%',
    serve: '花冷え',
    imageUrl: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62'
  }
];

const DISH_LIST = [
  {
    id: 'dish-01',
    name: '出汁巻き玉子 山椒餡',
    description: '鰹と昆布の合わせ出汁をたっぷり含ませたふわとろの一品。',
    tags: ['霞路 生酛純米'],
    imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836'
  },
  {
    id: 'dish-02',
    name: '初夏の八寸',
    description: '万願寺唐辛子、鱧寿司、胡麻豆腐を少しずつ。季節の香りを一皿に。',
    tags: ['京の雫 純米吟醸', '川霧 しぼりたて'],
    imageUrl: 'https://images.unsplash.com/photo-1466637574441-749b8f19452f'
  },
  {
    id: 'dish-03',
    name: '黒豆きなこ最中',
    description: '香ばしい最中に黒豆餡ときなこクリームを忍ばせた締めの甘味。',
    tags: ['宵星 大吟醸'],
    imageUrl: 'https://images.unsplash.com/photo-1604908177076-8aa1c017a831'
  },
  {
    id: 'dish-04',
    name: '季節の和菓子 二十四節気',
    description: '和三盆のやさしい甘さと旬の果実を合わせた小菓子。',
    tags: ['京の雫 純米吟醸'],
    imageUrl: 'https://images.unsplash.com/photo-1573878735868-8f942c3c86d5'
  }
];

const body = document.body;
const menuToggle = document.querySelector('.menu-toggle');
const offcanvas = document.querySelector('.offcanvas');
const offcanvasClose = document.querySelector('.offcanvas-close');
const offcanvasBackdrop = document.querySelector('.offcanvas-backdrop');
const navLinks = offcanvas.querySelectorAll('a');
const sakeCarousel = document.querySelector('.sake-carousel');
const sakeDialog = document.querySelector('.sake-dialog');
const reservationDialog = document.querySelector('.reservation-dialog');
const reservationForm = document.getElementById('reservation-form');
const reserveSakeInput = reservationForm.elements['sake'];

let activeDialog = null;
let lastFocusedElement = null;

function lockScroll() {
  body.dataset.scrollLock = 'true';
  body.style.top = `-${window.scrollY}px`;
  body.style.position = 'fixed';
  body.style.width = '100%';
}

function unlockScroll() {
  const scrollY = body.style.top;
  body.style.position = '';
  body.style.top = '';
  body.style.width = '';
  body.removeAttribute('data-scroll-lock');
  if (scrollY) {
    window.scrollTo(0, parseInt(scrollY || '0') * -1);
  }
}

function toggleOffcanvas(open) {
  const isOpen = typeof open === 'boolean' ? open : offcanvas.classList.contains('open');
  if (!isOpen) {
    offcanvas.classList.add('open');
    offcanvas.setAttribute('aria-hidden', 'false');
    menuToggle.setAttribute('aria-expanded', 'true');
    offcanvasBackdrop.hidden = false;
    lockScroll();
    lastFocusedElement = document.activeElement;
    offcanvas.querySelector('a').focus();
  } else {
    offcanvas.classList.remove('open');
    offcanvas.setAttribute('aria-hidden', 'true');
    menuToggle.setAttribute('aria-expanded', 'false');
    offcanvasBackdrop.hidden = true;
    unlockScroll();
    if (lastFocusedElement) {
      lastFocusedElement.focus();
    }
  }
}

menuToggle.addEventListener('click', () => toggleOffcanvas(false));
offcanvasClose.addEventListener('click', () => toggleOffcanvas(true));
offcanvasBackdrop.addEventListener('click', () => toggleOffcanvas(true));

offcanvas.addEventListener('keydown', (event) => {
  if (event.key === 'Tab') {
    const focusable = offcanvas.querySelectorAll('button, a');
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  } else if (event.key === 'Escape') {
    toggleOffcanvas(true);
  }
});

navLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    const targetId = link.getAttribute('href');
    const target = document.querySelector(targetId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
    toggleOffcanvas(true);
  });
});

// IntersectionObserver for fade-in animations
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.2 }
);

document.querySelectorAll('[data-observe]').forEach((el) => observer.observe(el));

// Render sake carousel
function createSakeCard(sake) {
  const card = document.createElement('article');
  card.className = 'sake-card';
  card.innerHTML = `
    <img src="${sake.imageUrl}?auto=format&fit=crop&w=800&q=80" alt="${sake.name}" loading="lazy" width="320" height="200" />
    <div class="tag">${sake.type}</div>
    <h3>${sake.name}</h3>
    <p><strong>香り：</strong>${sake.aroma}</p>
    <p><strong>味わい：</strong>${sake.taste}</p>
    <p><strong>提供温度：</strong>${sake.temp}</p>
    <button class="btn-secondary sake-detail" data-sake-id="${sake.id}">詳細</button>
  `;
  return card;
}

function renderSakeCarousel() {
  SAKE_LIST.forEach((sake) => {
    const card = createSakeCard(sake);
    sakeCarousel.appendChild(card);
  });
}

renderSakeCarousel();

// Carousel controls
const carouselButtons = document.querySelectorAll('.carousel-btn');
carouselButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const direction = btn.classList.contains('next') ? 1 : -1;
    const scrollAmount = sakeCarousel.clientWidth * 0.8;
    sakeCarousel.scrollBy({ left: scrollAmount * direction, behavior: 'smooth' });
  });
});

// Sake modal handling
function openDialog(dialog) {
  if (!dialog.open) {
    lastFocusedElement = document.activeElement;
    dialog.showModal();
    activeDialog = dialog;
    lockScroll();
    trapDialogFocus(dialog);
  }
}

function closeDialog(dialog) {
  if (dialog.open) {
    dialog.close();
    activeDialog = null;
    unlockScroll();
    if (lastFocusedElement) {
      lastFocusedElement.focus();
    }
  }
}

function trapDialogFocus(dialog) {
  if (dialog.dataset.trap === 'true') return;
  dialog.dataset.trap = 'true';
  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'Tab') {
      const focusable = dialog.querySelectorAll('button, [href], input, textarea');
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    } else if (event.key === 'Escape') {
      closeDialog(dialog);
    }
  });
}

function populateSakeDialog(sake) {
  const title = sakeDialog.querySelector('#sake-dialog-title');
  const img = sakeDialog.querySelector('.dialog-image');
  const details = sakeDialog.querySelector('.dialog-details');
  title.textContent = sake.name;
  img.src = `${sake.imageUrl}?auto=format&fit=crop&w=800&q=80`;
  img.alt = `${sake.name}のボトル`;
  details.innerHTML = `
    <dt>タイプ</dt><dd>${sake.type}</dd>
    <dt>香り</dt><dd>${sake.aroma}</dd>
    <dt>味わい</dt><dd>${sake.taste}</dd>
    <dt>提供温度</dt><dd>${sake.temp}</dd>
    <dt>蔵元</dt><dd>${sake.brewery}</dd>
    <dt>産地</dt><dd>${sake.origin}</dd>
    <dt>ストーリー</dt><dd>${sake.story}</dd>
    <dt>ABV</dt><dd>${sake.abv}</dd>
    <dt>推奨温度</dt><dd>${sake.serve}</dd>
    <dt>ペアリング</dt><dd>${sake.pairing}</dd>
  `;
  const reserveButton = sakeDialog.querySelector('.dialog-reserve');
  reserveButton.dataset.sakeName = sake.name;
}

sakeCarousel.addEventListener('click', (event) => {
  const button = event.target.closest('.sake-detail');
  if (!button) return;
  const sakeId = button.dataset.sakeId;
  const sake = SAKE_LIST.find((item) => item.id === sakeId);
  if (!sake) return;
  populateSakeDialog(sake);
  openDialog(sakeDialog);
});

sakeDialog.querySelector('.dialog-close').addEventListener('click', () => closeDialog(sakeDialog));
sakeDialog.addEventListener('close', () => unlockScroll());

sakeDialog.querySelector('.dialog-reserve').addEventListener('click', (event) => {
  const sakeName = event.target.dataset.sakeName;
  reserveSakeInput.value = sakeName;
  closeDialog(sakeDialog);
  document.getElementById('reservation').scrollIntoView({ behavior: 'smooth' });
  reserveSakeInput.focus({ preventScroll: true });
});

// Render dishes
function createDishCard(dish) {
  const card = document.createElement('article');
  card.className = 'dish-card';
  const tags = dish.tags
    .map((tag) => `<span class="tag">${tag}</span>`)
    .join('');
  card.innerHTML = `
    <img src="${dish.imageUrl}?auto=format&fit=crop&w=800&q=80" alt="${dish.name}" loading="lazy" width="320" height="220" />
    <h3>${dish.name}</h3>
    <p>${dish.description}</p>
    <div class="dish-tags">${tags}</div>
  `;
  return card;
}

const dishGrid = document.querySelector('.dish-grid');
DISH_LIST.forEach((dish) => dishGrid.appendChild(createDishCard(dish)));

// Reservation form validation and submission
reservationForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(reservationForm);
  let isValid = true;

  reservationForm.querySelectorAll('[required]').forEach((field) => {
    if (!field.value.trim()) {
      field.setCustomValidity('必須項目です');
      field.reportValidity();
      isValid = false;
    } else {
      field.setCustomValidity('');
    }
  });

  if (!isValid) {
    return;
  }

  const payload = Object.fromEntries(formData.entries());
  console.log('Reservation submitted:', payload);

  openDialog(reservationDialog);
});

reservationDialog.querySelector('.dialog-close').addEventListener('click', () => closeDialog(reservationDialog));
reservationDialog.addEventListener('close', () => unlockScroll());

// Global ESC for dialogs/offcanvas
window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    if (activeDialog) {
      closeDialog(activeDialog);
    } else if (offcanvas.classList.contains('open')) {
      toggleOffcanvas(true);
    }
  }
});

// Close offcanvas when focus leaves and moves to content via ESC handled above

document.addEventListener('click', (event) => {
  if (offcanvas.classList.contains('open')) {
    const isClickInside = offcanvas.contains(event.target) || menuToggle.contains(event.target);
    if (!isClickInside) {
      toggleOffcanvas(true);
    }
  }
});

// Restore scroll behavior when dialogs close via native methods
sakeDialog.addEventListener('cancel', (event) => {
  event.preventDefault();
  closeDialog(sakeDialog);
});

reservationDialog.addEventListener('cancel', (event) => {
  event.preventDefault();
  closeDialog(reservationDialog);
});

// Accessibility: ensure carousel is focusable via keyboard and arrow keys
sakeCarousel.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
    const direction = event.key === 'ArrowRight' ? 1 : -1;
    const scrollAmount = sakeCarousel.clientWidth * 0.6;
    sakeCarousel.scrollBy({ left: scrollAmount * direction, behavior: 'smooth' });
  }
});

// Polyfill for smooth scrolling focus on older browsers (optional fallback)
if (!('scrollBehavior' in document.documentElement.style)) {
  HTMLElement.prototype.scrollIntoView = function () {
    window.scrollTo(0, this.getBoundingClientRect().top + window.scrollY);
  };
}
