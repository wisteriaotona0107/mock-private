import { loadGameConfig } from './data.js';
import { PoseMasterGame } from './game.js';

async function bootstrap() {
  const app = document.querySelector('#app');
  const status = document.querySelector('[data-role="status"]');

  try {
    status.textContent = 'Loading data...';
    const config = await loadGameConfig();
    const game = new PoseMasterGame({ root: app, config });
    window.poseMaster = game;
    status.textContent = 'Ready. Data loaded from poses.json / rules.json';
  } catch (error) {
    console.error(error);
    status.textContent = `Failed to start: ${error.message}`;
  }
}

bootstrap();
