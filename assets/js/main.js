(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const navToggle = document.querySelector('.menu-toggle');
  const navList = document.getElementById('nav-list');

  if (navToggle && navList) {
    navToggle.addEventListener('click', () => {
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      navList.classList.toggle('open');
    });
  }

  const navLinks = document.querySelectorAll('a[href^="#"]');
  navLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      const targetId = link.getAttribute('href');
      if (!targetId || targetId === '#') {
        return;
      }

      const targetElement = document.querySelector(targetId);
      if (!targetElement) {
        return;
      }

      event.preventDefault();
      targetElement.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });

      if (navList && navList.classList.contains('open')) {
        navList.classList.remove('open');
      }
      if (navToggle) {
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  });

  const filterButtons = document.querySelectorAll('.filter-btn');
  const workCards = document.querySelectorAll('.work-card');

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const selected = button.dataset.filter || 'all';

      filterButtons.forEach((btn) => {
        const isActive = btn === button;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-selected', String(isActive));
      });

      workCards.forEach((card) => {
        const category = card.dataset.category;
        const shouldShow = selected === 'all' || category === selected;
        card.hidden = !shouldShow;
      });
    });
  });

  const faqQuestions = document.querySelectorAll('.faq-question');
  faqQuestions.forEach((question) => {
    question.addEventListener('click', () => {
      const expanded = question.getAttribute('aria-expanded') === 'true';
      question.setAttribute('aria-expanded', String(!expanded));
      const answer = question.closest('.faq-item')?.querySelector('.faq-answer');
      if (answer) {
        answer.hidden = expanded;
      }
    });
  });

  const form = document.getElementById('contact-form');
  const modal = document.getElementById('modal');
  const modalClose = document.getElementById('modal-close');

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function setError(fieldName, message) {
    const errorNode = document.getElementById(`error-${fieldName}`);
    if (errorNode) {
      errorNode.textContent = message;
    }
  }

  function clearErrors() {
    const errorNodes = document.querySelectorAll('.error-message');
    errorNodes.forEach((node) => {
      node.textContent = '';
    });
  }

  function openModal() {
    if (!modal) {
      return;
    }

    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (modalClose) {
      modalClose.focus();
    }
  }

  function closeModal() {
    if (!modal) {
      return;
    }

    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (modalClose) {
    modalClose.addEventListener('click', closeModal);
  }

  if (modal) {
    modal.addEventListener('click', (event) => {
      if (event.target === modal) {
        closeModal();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !modal.hidden) {
        closeModal();
      }
    });
  }

  if (form) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      clearErrors();

      let hasError = false;

      const name = form.elements.namedItem('name');
      const phone = form.elements.namedItem('phone');
      const email = form.elements.namedItem('email');
      const message = form.elements.namedItem('message');
      const consent = form.elements.namedItem('consent');
      const methodChecked = form.querySelector('input[name="contactMethod"]:checked');

      if (!(name instanceof HTMLInputElement) || !name.value.trim()) {
        setError('name', '氏名を入力してください。');
        hasError = true;
      }

      if (!(phone instanceof HTMLInputElement) || !phone.value.trim()) {
        setError('phone', '電話番号を入力してください。');
        hasError = true;
      }

      if (!(email instanceof HTMLInputElement) || !email.value.trim()) {
        setError('email', 'メールアドレスを入力してください。');
        hasError = true;
      } else if (!emailPattern.test(email.value.trim())) {
        setError('email', 'メールアドレスの形式をご確認ください。');
        hasError = true;
      }

      if (!(message instanceof HTMLTextAreaElement) || !message.value.trim()) {
        setError('message', 'ご相談内容を入力してください。');
        hasError = true;
      }

      if (!methodChecked) {
        setError('contactMethod', '希望連絡方法を選択してください。');
        hasError = true;
      }

      if (!(consent instanceof HTMLInputElement) || !consent.checked) {
        setError('consent', '同意チェックが必要です。');
        hasError = true;
      }

      if (hasError) {
        return;
      }

      form.reset();
      openModal();
    });
  }
})();
