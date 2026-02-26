document.addEventListener('DOMContentLoaded', () => {
  setupAreaFilter();
  setupAccordion('area-trigger', 'area-list-wrap');
  setupFaqAccordion();
  setupSmoothAnchors();
  setupFormValidation();
});

function setupAreaFilter() {
  const searchInput = document.getElementById('area-search');
  const areaList = document.getElementById('area-list');
  const emptyMessage = document.getElementById('area-empty');

  if (!searchInput || !areaList || !emptyMessage) return;

  const items = Array.from(areaList.querySelectorAll('li'));

  searchInput.addEventListener('input', (event) => {
    const keyword = event.target.value.trim().toLowerCase();
    let visibleCount = 0;

    items.forEach((item) => {
      const match = item.textContent.toLowerCase().includes(keyword);
      item.hidden = !match;
      if (match) visibleCount += 1;
    });

    emptyMessage.hidden = visibleCount !== 0;
  });
}

function setupAccordion(triggerId, panelId) {
  const trigger = document.getElementById(triggerId);
  const panel = document.getElementById(panelId);

  if (!trigger || !panel) return;

  trigger.addEventListener('click', () => {
    const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
    trigger.setAttribute('aria-expanded', String(!isExpanded));
    panel.hidden = isExpanded;
  });
}

function setupFaqAccordion() {
  const faqButtons = document.querySelectorAll('.faq-question');

  faqButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const item = button.closest('.faq-item');
      const answer = item?.querySelector('.faq-answer');
      if (!answer) return;

      const isExpanded = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!isExpanded));
      answer.hidden = isExpanded;
    });
  });
}

function setupSmoothAnchors() {
  const anchorLinks = document.querySelectorAll('a[href^="#"]');

  anchorLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      const targetId = link.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.replaceState(null, '', targetId);
    });
  });
}

function setupFormValidation() {
  const form = document.getElementById('contact-form');
  const message = document.getElementById('form-message');

  if (!form || !message) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const data = new FormData(form);
    const requiredFields = ['name', 'phone', 'email', 'address', 'message'];

    let hasError = false;

    requiredFields.forEach((fieldName) => {
      const field = form.elements[fieldName];
      const value = (data.get(fieldName) || '').toString().trim();

      if (!value) {
        hasError = true;
        field.classList.add('input-error');
        return;
      }

      field.classList.remove('input-error');
    });

    const phoneField = form.elements.phone;
    const emailField = form.elements.email;
    const phoneValue = (data.get('phone') || '').toString().replace(/[-\s]/g, '');
    const emailValue = (data.get('email') || '').toString().trim();

    if (!/^\d{10,11}$/.test(phoneValue)) {
      hasError = true;
      phoneField.classList.add('input-error');
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
      hasError = true;
      emailField.classList.add('input-error');
    }

    if (hasError) {
      message.textContent = '入力内容をご確認ください。必須項目、電話番号、メール形式をチェックしてください。';
      message.className = 'form-message error';
      return;
    }

    message.textContent = '送信準備が完了しました。担当者より折り返しご連絡します。';
    message.className = 'form-message success';
    form.reset();
  });
}
