import { qs, qsa, createEl, smoothScrollTo } from './utils.js';
import { initTabs } from './tabs.js';
import { initNews } from './news.js';
import { initFaq } from './faq.js';
import { initContact } from './contact.js';

const SERVICES = [
  {
    id: 'design',
    name: '建築設計',
    description: '最新のBIMモデリングと環境分析で、機能性と美しさを両立した設計を提案します。',
    icon: '📐'
  },
  {
    id: 'construction',
    name: '施工管理',
    description: '熟練の施工管理チームが品質・安全・工程を総合的に統制し、確かな成果を実現します。',
    icon: '🏗️'
  },
  {
    id: 'infrastructure',
    name: 'インフラ整備',
    description: '道路・橋梁・上下水道など地域インフラの整備で持続可能な都市基盤づくりに貢献します。',
    icon: '🌉'
  },
  {
    id: 'maintenance',
    name: '保守点検',
    description: '完成後も定期点検とメンテナンスを実施し、施設価値を長期的に守り抜きます。',
    icon: '🛠️'
  }
];

const REPRESENTATIVE = {
  name: '田中 光司',
  title: '代表取締役社長',
  bio: [
    '2002年 建設工学修士取得後、大手ゼネコンに入社',
    '2012年 当社技術統括本部長に就任',
    '2018年 代表取締役に就任しDX推進を主導'
  ],
  credentials: ['一級建築士', 'コンクリート診断士'],
  message:
    '建設は街と人の未来を形づくる仕事です。安全と品質はもちろん、地域の皆さまと共に歩む姿勢を貫き、次世代につながる価値創造に挑み続けます。'
};

const initSmoothScroll = () => {
  const links = qsa('a[href^="#"]');
  links.forEach((link) => {
    link.addEventListener('click', (event) => {
      const hash = link.getAttribute('href');
      if (!hash || hash.length <= 1) return;
      const target = qs(hash);
      if (!target) return;
      event.preventDefault();
      smoothScrollTo(target);
      closeMobileNav();
    });
  });
};

const closeMobileNav = () => {
  const nav = qs('#primary-nav');
  const toggle = qs('.nav-toggle');
  if (nav && toggle) {
    nav.setAttribute('aria-hidden', 'true');
    toggle.setAttribute('aria-expanded', 'false');
  }
};

const initHamburger = () => {
  const nav = qs('#primary-nav');
  const toggle = qs('.nav-toggle');
  if (!nav || !toggle) return;
  nav.setAttribute('aria-hidden', 'true');
  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    nav.setAttribute('aria-hidden', String(expanded));
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      nav.removeAttribute('aria-hidden');
      toggle.setAttribute('aria-expanded', 'false');
    } else {
      nav.setAttribute('aria-hidden', 'true');
    }
  });
};

const initServices = () => {
  const grid = qs('#services-grid');
  if (!grid) return;
  SERVICES.forEach((service) => {
    const card = createEl('article', { className: 'service-card', attrs: { 'data-service-id': service.id } });
    const icon = createEl('div', { className: 'service-card__icon', text: service.icon });
    const title = createEl('h3', { text: service.name });
    const desc = createEl('p', { text: service.description });
    card.append(icon, title, desc);
    grid.appendChild(card);
  });
};

const initRepresentative = () => {
  const nameEl = qs('#representative-name');
  const titleEl = qs('#representative-title-text');
  const bioEl = qs('#representative-bio');
  const credEl = qs('#representative-credentials');
  const messageEl = qs('#representative-message');
  if (!nameEl || !titleEl || !bioEl || !credEl || !messageEl) return;
  nameEl.textContent = REPRESENTATIVE.name;
  titleEl.textContent = REPRESENTATIVE.title;
  bioEl.innerHTML = '';
  REPRESENTATIVE.bio.forEach((item) => {
    bioEl.appendChild(createEl('li', { text: item }));
  });
  credEl.innerHTML = '';
  REPRESENTATIVE.credentials.forEach((item) => {
    credEl.appendChild(createEl('li', { text: item }));
  });
  messageEl.textContent = REPRESENTATIVE.message;
};

const initStickyPhone = () => {
  const sticky = qs('.sticky-phone');
  if (!sticky) return;
  const hero = qs('#hero');
  const updateVisibility = () => {
    if (window.innerWidth > 768) {
      sticky.classList.remove('is-visible');
      return;
    }
    const threshold = hero ? hero.offsetHeight / 2 : 200;
    if (window.scrollY > threshold) {
      sticky.classList.add('is-visible');
    } else {
      sticky.classList.remove('is-visible');
    }
  };
  updateVisibility();
  window.addEventListener('scroll', updateVisibility, { passive: true });
  window.addEventListener('resize', updateVisibility);
};

document.addEventListener('DOMContentLoaded', () => {
  initSmoothScroll();
  initHamburger();
  initTabs();
  initNews();
  initFaq();
  initServices();
  initRepresentative();
  initContact();
  initStickyPhone();
});
