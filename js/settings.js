import { saveSettings } from './store.js';

export const applySettingsToDOM = (settings) => {
  document.body.dataset.theme = settings.highContrast ? 'high-contrast' : settings.theme;
  document.body.dataset.cardSize = settings.cardSize;
  document.body.dataset.hideLabels = String(!settings.showLabels);
};

export const bindSettingsDialog = (settings, onChange) => {
  const dialog = document.getElementById('settings-dialog');
  const toggle = document.getElementById('settings-toggle');
  const inputs = {
    cardSize: document.getElementById('setting-card-size'),
    theme: document.getElementById('setting-theme'),
    speechRate: document.getElementById('setting-speech-rate'),
    speechEnabled: document.getElementById('setting-speech-enabled'),
    highContrast: document.getElementById('setting-high-contrast'),
    showLabels: document.getElementById('setting-show-labels')
  };
  const speechRateValue = document.getElementById('speech-rate-value');

  const syncForm = () => {
    inputs.cardSize.value = settings.cardSize;
    inputs.theme.value = settings.theme;
    inputs.speechRate.value = settings.speechRate;
    inputs.speechEnabled.checked = settings.speechEnabled;
    inputs.highContrast.checked = settings.highContrast;
    inputs.showLabels.checked = settings.showLabels;
    speechRateValue.textContent = String(settings.speechRate);
  };

  syncForm();
  toggle.addEventListener('click', () => dialog.showModal());

  inputs.speechRate.addEventListener('input', () => {
    speechRateValue.textContent = inputs.speechRate.value;
  });

  document.getElementById('save-settings').addEventListener('click', (event) => {
    event.preventDefault();
    settings.cardSize = inputs.cardSize.value;
    settings.theme = inputs.theme.value;
    settings.speechRate = Number(inputs.speechRate.value);
    settings.speechEnabled = inputs.speechEnabled.checked;
    settings.highContrast = inputs.highContrast.checked;
    settings.showLabels = inputs.showLabels.checked;

    saveSettings(settings);
    onChange(settings);
    dialog.close();
  });
};
