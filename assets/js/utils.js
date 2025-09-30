export const qs = (selector, scope = document) => scope.querySelector(selector);
export const qsa = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

export const createEl = (tag, options = {}) => {
  const el = document.createElement(tag);
  const { className, text, html, attrs } = options;
  if (className) {
    el.className = className;
  }
  if (text) {
    el.textContent = text;
  }
  if (html) {
    el.innerHTML = html;
  }
  if (attrs) {
    Object.entries(attrs).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        el.setAttribute(key, value);
      }
    });
  }
  return el;
};

export const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const smoothScrollTo = (target) => {
  if (!target) return;
  const top = target.getBoundingClientRect().top + window.pageYOffset - 80;
  if (prefersReducedMotion()) {
    window.scrollTo(0, top);
  } else {
    window.scrollTo({ top, behavior: 'smooth' });
  }
};

export const trapFocus = (container) => {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
  ];
  const focusable = () => qsa(focusableSelectors.join(','), container);
  const handleKeydown = (event) => {
    if (event.key !== 'Tab') return;
    const items = focusable();
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey) {
      if (document.activeElement === first) {
        event.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  };
  container.addEventListener('keydown', handleKeydown);
  return () => container.removeEventListener('keydown', handleKeydown);
};

export const toast = ({ title, message, duration = 6000 }) => {
  const container = qs('#toast-container') || createToastContainer();
  const toastEl = createEl('div', { className: 'toast', attrs: { role: 'status' } });
  if (title) {
    toastEl.appendChild(createEl('p', { className: 'toast__title', text: title }));
  }
  if (message) {
    toastEl.appendChild(createEl('p', { className: 'toast__message', text: message }));
  }
  container.appendChild(toastEl);
  if (duration > 0) {
    setTimeout(() => {
      toastEl.classList.add('is-leaving');
      toastEl.addEventListener('transitionend', () => toastEl.remove(), { once: true });
      toastEl.style.opacity = '0';
      toastEl.style.transform = 'translateY(10px)';
    }, duration);
  }
  return toastEl;
};

const createToastContainer = () => {
  const container = createEl('div', {
    className: 'toast-container',
    attrs: { id: 'toast-container', role: 'status', 'aria-live': 'polite' }
  });
  document.body.appendChild(container);
  return container;
};
