import { fetchProducts } from './api.js';
import { renderProductDetail, renderProductList, renderStatus } from './dom.js';
import { getQueryParam, normalizeProducts } from './utils.js';

const UI_MESSAGES = {
  loading: '商品情報を読み込んでいます…',
  noItems: '現在公開中の商品はありません。',
  failed: '商品情報の取得に失敗しました。時間をおいて再度お試しください。',
  detailNotFound: '指定された商品が見つかりませんでした。',
};

document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;
  if (page === 'list') {
    initListPage();
    return;
  }

  if (page === 'detail') {
    initDetailPage();
  }
});

async function initListPage() {
  const statusRegion = document.getElementById('status-region');
  const listElement = document.getElementById('product-list');

  if (!statusRegion || !listElement) {
    return;
  }

  renderStatus(statusRegion, 'info', UI_MESSAGES.loading);

  try {
    const payload = await fetchProducts();
    const products = normalizeProducts(payload.items);

    if (products.length === 0) {
      renderStatus(statusRegion, 'info', UI_MESSAGES.noItems);
      return;
    }

    renderStatus(statusRegion, 'info', '');
    renderProductList(listElement, products);
  } catch (error) {
    console.error('[public-site] product list load error', error);
    renderStatus(statusRegion, 'error', UI_MESSAGES.failed);
  }
}

async function initDetailPage() {
  const statusRegion = document.getElementById('status-region');
  const detailElement = document.getElementById('product-detail');

  if (!statusRegion || !detailElement) {
    return;
  }

  const productId = getQueryParam('id');
  if (!productId) {
    renderStatus(statusRegion, 'error', UI_MESSAGES.detailNotFound);
    return;
  }

  renderStatus(statusRegion, 'info', UI_MESSAGES.loading);

  try {
    const payload = await fetchProducts();
    const products = normalizeProducts(payload.items);
    const target = products.find((item) => item.id === productId);

    if (!target) {
      renderStatus(statusRegion, 'error', UI_MESSAGES.detailNotFound);
      return;
    }

    renderStatus(statusRegion, 'info', '');
    renderProductDetail(detailElement, target);
  } catch (error) {
    console.error('[public-site] product detail load error', error);
    renderStatus(statusRegion, 'error', UI_MESSAGES.failed);
  }
}
