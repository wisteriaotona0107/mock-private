const header = document.querySelector('[data-header]');
const nav = document.querySelector('[data-nav]');
const menuToggle = document.querySelector('[data-menu-toggle]');
const revealItems = document.querySelectorAll('.reveal');
const interactiveItems = document.querySelectorAll('.card, .mock-card, .mini-panel, .button');
const motionReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const closeMenu = () => {
  if (!nav || !menuToggle) return;
  nav.classList.remove('is-open');
  menuToggle.setAttribute('aria-expanded', 'false');
};

if (menuToggle && nav) {
  menuToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });
}

const updateHeader = () => {
  if (!header) return;
  header.classList.toggle('is-scrolled', window.scrollY > 12);
};

updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

// Smooth scrolling for in-page anchors while accounting for sticky header.
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (event) => {
    const targetId = anchor.getAttribute('href');
    if (!targetId || targetId === '#') return;

    const target = document.querySelector(targetId);
    if (!target) return;

    event.preventDefault();
    const offset = header ? header.offsetHeight + 16 : 0;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;

    window.scrollTo({
      top,
      behavior: motionReduced ? 'auto' : 'smooth',
    });
  });
});

if (!motionReduced && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.18,
      rootMargin: '0px 0px -8% 0px',
    }
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('is-visible'));
}

interactiveItems.forEach((item) => {
  item.addEventListener('pointerenter', () => item.classList.add('is-hovered'));
  item.addEventListener('pointerleave', () => item.classList.remove('is-hovered'));
  item.addEventListener('focus', () => item.classList.add('is-hovered'));
  item.addEventListener('blur', () => item.classList.remove('is-hovered'));
});

window.addEventListener('resize', () => {
  if (window.innerWidth >= 960) {
    closeMenu();
  }
});
