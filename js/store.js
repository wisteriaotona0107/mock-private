import { safeJSONParse } from './utils.js';

const SETTINGS_KEY = 'aac_settings';
const RECENT_KEY = 'aac_recent';

const hasStorage = () => {
  try {
    localStorage.setItem('__test__', '1');
    localStorage.removeItem('__test__');
    return true;
  } catch {
    return false;
  }
};

export const storageAvailable = hasStorage();

export const readSettings = (defaults) => {
  if (!storageAvailable) return defaults;
  const val = localStorage.getItem(SETTINGS_KEY);
  return val ? { ...defaults, ...safeJSONParse(val, {}) } : defaults;
};

export const saveSettings = (settings) => {
  if (!storageAvailable) return;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

export const readRecent = () => {
  if (!storageAvailable) return [];
  return safeJSONParse(localStorage.getItem(RECENT_KEY), []);
};

export const pushRecent = (cardId) => {
  if (!storageAvailable) return;
  const now = readRecent().filter((id) => id !== cardId);
  now.unshift(cardId);
  localStorage.setItem(RECENT_KEY, JSON.stringify(now.slice(0, 12)));
};
