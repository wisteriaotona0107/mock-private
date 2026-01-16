const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');

if (navToggle && navMenu) {
  navToggle.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });
}

const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach((item) => {
  item.addEventListener('click', () => {
    const panel = item.nextElementSibling;
    const isExpanded = item.getAttribute('aria-expanded') === 'true';
    item.setAttribute('aria-expanded', String(!isExpanded));

    if (panel && panel.classList.contains('faq-panel')) {
      panel.classList.toggle('open', !isExpanded);
      const icon = item.querySelector('.icon');
      if (icon) {
        icon.textContent = isExpanded ? '+' : '−';
      }
    }
  });
});
