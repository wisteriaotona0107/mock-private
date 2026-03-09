import { attachImageFallback, clampText, formatCategory, formatPrice, selectImage } from './utils.js';

export function renderStatus(region, kind, message) {
  clearNode(region);
  if (!message) {
    return;
  }

  const box = document.createElement('p');
  box.className = `status-message ${kind === 'error' ? 'status-error' : ''}`.trim();
  box.textContent = message;
  region.appendChild(box);
}

export function renderProductList(listElement, products) {
  clearNode(listElement);

  const fragment = document.createDocumentFragment();
  for (const product of products) {
    const card = document.createElement('li');
    card.className = 'product-card';

    const img = document.createElement('img');
    img.className = 'product-image';
    img.loading = 'lazy';
    img.alt = `${product.name} のサムネイル`;
    img.src = selectImage(product);
    attachImageFallback(img, product.name);

    const body = document.createElement('div');
    body.className = 'product-body';

    const name = document.createElement('h3');
    name.className = 'product-name';
    name.textContent = product.name;

    const price = document.createElement('p');
    price.className = 'product-meta';
    price.textContent = formatPrice(product.price);

    const category = document.createElement('p');
    category.className = 'product-meta';
    category.textContent = formatCategory(product.category);

    const description = document.createElement('p');
    description.textContent = clampText(product.description, 80) || '説明はありません。';

    const link = document.createElement('a');
    link.className = 'product-link';
    link.textContent = '詳細を見る';
    link.href = `/products/index.html?id=${encodeURIComponent(product.id)}`;

    body.append(name, price, category, description, link);
    card.append(img, body);
    fragment.appendChild(card);
  }

  listElement.appendChild(fragment);
}

export function renderProductDetail(container, product) {
  clearNode(container);

  const title = document.createElement('h2');
  title.className = 'product-name';
  title.textContent = product.name;

  const img = document.createElement('img');
  img.className = 'product-image';
  img.loading = 'lazy';
  img.alt = `${product.name} の画像`;
  img.src = selectImage(product);
  attachImageFallback(img, product.name);

  const price = document.createElement('p');
  price.textContent = `価格: ${formatPrice(product.price)}`;

  const category = document.createElement('p');
  category.textContent = `カテゴリ: ${formatCategory(product.category)}`;

  const description = document.createElement('p');
  description.textContent = typeof product.description === 'string' && product.description.trim() !== ''
    ? product.description.trim()
    : '説明はありません。';

  container.append(title, img, price, category, description);
}

function clearNode(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}
