import { qs, qsa } from './utils.js';

export const initTabs = () => {
  const tabContainers = qsa('[data-tabs]');
  tabContainers.forEach((container) => {
    const tabs = qsa('[role="tab"]', container);
    const panels = qsa('[role="tabpanel"]', container);
    const activateTab = (newTab) => {
      tabs.forEach((tab) => {
        const selected = tab === newTab;
        tab.setAttribute('aria-selected', String(selected));
        tab.setAttribute('tabindex', selected ? '0' : '-1');
        const panelId = tab.getAttribute('aria-controls');
        const panel = panelId ? qs(`#${panelId}`) : null;
        if (panel) {
          if (selected) {
            panel.removeAttribute('hidden');
          } else {
            panel.setAttribute('hidden', '');
          }
        }
      });
      newTab.focus();
    };

    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => activateTab(tab));
      tab.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          event.preventDefault();
          const direction = event.key === 'ArrowLeft' ? -1 : 1;
          const nextIndex = (index + direction + tabs.length) % tabs.length;
          activateTab(tabs[nextIndex]);
        } else if (event.key === 'Home') {
          event.preventDefault();
          activateTab(tabs[0]);
        } else if (event.key === 'End') {
          event.preventDefault();
          activateTab(tabs[tabs.length - 1]);
        } else if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          activateTab(tab);
        }
      });
    });
  });
};
