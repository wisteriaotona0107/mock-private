const navButtons = document.querySelectorAll('.nav__item');
const screens = document.querySelectorAll('.screen');

navButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.screen;
    navButtons.forEach((b) => b.classList.toggle('is-active', b === btn));
    screens.forEach((section) => {
      section.classList.toggle('is-visible', section.id === `screen-${target}`);
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
});

const gachaCards = document.querySelectorAll('.gacha-card');

gachaCards.forEach((card) => {
  card.addEventListener('click', () => {
    card.classList.toggle('is-flipped');
  });
});

const spreadTabs = document.querySelectorAll('.spread-tab');

spreadTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    const siblings = tab.parentElement.querySelectorAll('.spread-tab');
    siblings.forEach((s) => s.classList.remove('is-active'));
    tab.classList.add('is-active');
  });
});

const orientationTabs = document.querySelectorAll('.orientation-tab');
orientationTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    const siblings = tab.parentElement.querySelectorAll('.orientation-tab');
    siblings.forEach((s) => s.classList.remove('is-active'));
    tab.classList.add('is-active');
  });
});

const toggles = document.querySelectorAll('.toggle');
toggles.forEach((toggle) => {
  toggle.addEventListener('click', () => {
    const group = toggle.parentElement.querySelectorAll('.toggle');
    group.forEach((t) => t.classList.remove('is-active'));
    toggle.classList.add('is-active');
  });
});
