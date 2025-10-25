const sections = document.querySelectorAll('.section');
const drawer = document.getElementById('drawer');
const scrim = document.querySelector('.scrim');
const hamburger = document.querySelector('.hamburger');
const sakeGrid = document.getElementById('sake-grid');
const paginationEl = document.getElementById('pagination');
const dataNotice = document.getElementById('data-notice');
const modal = document.getElementById('sake-modal');
const modalClose = modal.querySelector('.modal-close');
const modalImage = document.getElementById('modal-image');
const modalName = document.getElementById('modal-name');
const modalDesc = document.getElementById('modal-desc');
const modalRice = document.getElementById('modal-rice');
const modalPolish = document.getElementById('modal-polish');
const modalAbv = document.getElementById('modal-abv');
const modalPrice = document.getElementById('modal-price');

const PER_PAGE = 6;
let sakes = [];
let currentPage = 1;

const localFallbackData = [
  {
    "id": 1,
    "name": "獺祭 純米大吟醸 45",
    "desc": "華やかな吟醸香とキレの良さ。",
    "rice": "山田錦",
    "polish": 45,
    "abv": 16,
    "img": "./img/img001.jpg",
    "price": 6000
  },
  {
    "id": 2,
    "name": "十四代 吟撰",
    "desc": "蜜のような甘みと透明感のある余韻。",
    "rice": "兵庫産特A山田錦",
    "polish": 40,
    "abv": 15,
    "img": "./img/img002.jpg",
    "price": 7200
  },
  {
    "id": 3,
    "name": "新政 No.6 X-type",
    "desc": "ジューシーな酸とフレッシュな香り。",
    "rice": "秋田県産酒こまち",
    "polish": 45,
    "abv": 14,
    "img": "./img/img003.jpg",
    "price": 5500
  },
  {
    "id": 4,
    "name": "而今 特別純米",
    "desc": "果実味と旨味のバランスが秀逸。",
    "rice": "山田錦",
    "polish": 55,
    "abv": 16,
    "img": "./img/img004.jpg",
    "price": 4800
  },
  {
    "id": 5,
    "name": "田酒 特別純米",
    "desc": "米の旨味が広がる王道の一本。",
    "rice": "華吹雪",
    "polish": 55,
    "abv": 16,
    "img": "./img/img005.jpg",
    "price": 4200
  },
  {
    "id": 6,
    "name": "黒龍 しずく",
    "desc": "柔らかな口当たりと透明感。",
    "rice": "山田錦",
    "polish": 35,
    "abv": 16,
    "img": "./img/img006.jpg",
    "price": 9800
  },
  {
    "id": 7,
    "name": "作 IMPRESSION Type-G",
    "desc": "瑞々しい香りとシャープなキレ。",
    "rice": "三重県産米",
    "polish": 50,
    "abv": 15,
    "img": "./img/img007.jpg",
    "price": 3800
  },
  {
    "id": 8,
    "name": "風の森 ALPHA 風の森愛山",
    "desc": "ミネラル感と甘やかな香りが共鳴。",
    "rice": "愛山",
    "polish": 50,
    "abv": 14,
    "img": "./img/img008.jpg",
    "price": 4500
  },
  {
    "id": 9,
    "name": "花陽浴 八反錦",
    "desc": "トロピカルで艶やかな甘み。",
    "rice": "八反錦",
    "polish": 50,
    "abv": 16,
    "img": "./img/img009.jpg",
    "price": 4300
  },
  {
    "id": 10,
    "name": "醸し人九平次 別誂",
    "desc": "熟した果実の香りとエレガントな酸。",
    "rice": "山田錦",
    "polish": 40,
    "abv": 16,
    "img": "./img/img010.jpg",
    "price": 6800
  },
  {
    "id": 11,
    "name": "飛露喜 特別純米",
    "desc": "旨味とキレが調和する食中酒の定番。",
    "rice": "五百万石",
    "polish": 55,
    "abv": 16,
    "img": "./img/img011.jpg",
    "price": 3900
  },
  {
    "id": 12,
    "name": "仙禽 かぶとむし",
    "desc": "ジューシーな酸と軽快なボディ。",
    "rice": "栃木県産亀ノ尾",
    "polish": 50,
    "abv": 13,
    "img": "./img/img012.jpg",
    "price": 3600
  }
];

function updateSections() {
  const hash = window.location.hash || '#intro';
  sections.forEach(section => {
    section.classList.toggle('active', `#${section.id}` === hash);
  });
}

function toggleDrawer(open) {
  const isOpen = open ?? !drawer.classList.contains('open');
  drawer.classList.toggle('open', isOpen);
  hamburger.classList.toggle('active', isOpen);
  hamburger.setAttribute('aria-expanded', String(isOpen));
  drawer.setAttribute('aria-hidden', String(!isOpen));
  if (isOpen) {
    scrim.hidden = false;
  } else {
    scrim.hidden = true;
  }
}

function renderSakes() {
  sakeGrid.innerHTML = '';
  if (!sakes.length) {
    sakeGrid.innerHTML = '<p>表示できる日本酒がありません。</p>';
    return;
  }
  const start = (currentPage - 1) * PER_PAGE;
  const pageItems = sakes.slice(start, start + PER_PAGE);

  pageItems.forEach(item => {
    const card = document.createElement('article');
    card.className = 'sake-card';
    card.tabIndex = 0;
    card.innerHTML = `
      <img src="${item.img}" alt="${item.name}">
      <div class="sake-card-content">
        <h3>${item.name}</h3>
        <p>${item.desc}</p>
      </div>
    `;
    card.addEventListener('click', () => openModal(item));
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openModal(item);
      }
    });
    sakeGrid.appendChild(card);
  });
}

function renderPagination() {
  paginationEl.innerHTML = '';
  const pageCount = Math.ceil(sakes.length / PER_PAGE);
  if (pageCount <= 1) return;

  for (let i = 1; i <= pageCount; i += 1) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = i;
    button.classList.toggle('active', i === currentPage);
    button.addEventListener('click', () => {
      currentPage = i;
      renderSakes();
      renderPagination();
      sakeGrid.scrollIntoView({ behavior: 'smooth' });
    });
    paginationEl.appendChild(button);
  }
}

function openModal(item) {
  modalImage.src = item.img;
  modalImage.alt = item.name;
  modalName.textContent = item.name;
  modalDesc.textContent = item.desc;
  modalRice.textContent = item.rice;
  modalPolish.textContent = item.polish;
  modalAbv.textContent = item.abv;
  modalPrice.textContent = item.price.toLocaleString();

  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

async function loadSakes() {
  dataNotice.textContent = 'データを取得しています…';
  try {
    const response = await fetch('/api/sakes');
    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }
    const data = await response.json();
    sakes = Array.isArray(data) ? data : [];
    dataNotice.textContent = 'サーバAPIから取得したデータを表示しています。';
  } catch (error) {
    console.warn('API fetch failed. Falling back to local mock.', error);
    try {
      const localResponse = await fetch('sakes.json');
      if (!localResponse.ok) {
        throw new Error('Local JSON failed');
      }
      const localData = await localResponse.json();
      sakes = Array.isArray(localData) ? localData : localFallbackData;
      dataNotice.textContent = 'ローカルモックデータを表示しています。';
    } catch (localError) {
      console.warn('Local JSON fetch failed. Using inline mock data.', localError);
      sakes = localFallbackData;
      dataNotice.textContent = 'ローカルモックデータを表示しています。';
    }
  }
  currentPage = 1;
  renderSakes();
  renderPagination();
}

hamburger.addEventListener('click', () => toggleDrawer());
scrim.addEventListener('click', () => toggleDrawer(false));
drawer.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => toggleDrawer(false));
});

modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', (event) => {
  if (event.target === modal) {
    closeModal();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && modal.classList.contains('open')) {
    closeModal();
  }
});

window.addEventListener('hashchange', updateSections);
window.addEventListener('load', () => {
  if (!window.location.hash) {
    window.location.hash = '#intro';
  } else {
    updateSections();
  }
  loadSakes();
});
