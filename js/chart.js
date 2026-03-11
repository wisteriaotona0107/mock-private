import { loadSakeData } from './app.js';

function plotPoint(container, sake) {
  const point = document.createElement('div');
  point.className = 'dot';
  point.style.left = `${sake.sweetDry}%`;
  point.style.top = `${100 - sake.body}%`;

  const label = document.createElement('span');
  label.className = 'dot-label';
  label.textContent = sake.name;

  point.appendChild(label);
  container.appendChild(point);
}

async function renderFlavorMap() {
  const container = document.getElementById('flavor-map');
  if (!container) return;

  const data = await loadSakeData();
  data.forEach((sake) => plotPoint(container, sake));
}

renderFlavorMap().catch(console.error);
