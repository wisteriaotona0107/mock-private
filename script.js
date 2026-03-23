const root = document.documentElement;
const toggle = document.getElementById('theme-toggle');
const storageKey = 'mock-private-theme';

const savedTheme = window.localStorage.getItem(storageKey);
if (savedTheme) {
  root.dataset.theme = savedTheme;
}

toggle?.addEventListener('click', () => {
  const nextTheme = root.dataset.theme === 'light' ? 'dark' : 'light';
  root.dataset.theme = nextTheme;
  window.localStorage.setItem(storageKey, nextTheme);
});
