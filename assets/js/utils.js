const FALLBACK_IMAGE = '/assets/img/fallback-product.svg';

export function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

export function formatPrice(value) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return `¥${value.toLocaleString('ja-JP')}`;
  }

  if (typeof value === 'string' && value.trim() !== '' && !Number.isNaN(Number(value))) {
    return `¥${Number(value).toLocaleString('ja-JP')}`;
  }

  return '価格未設定';
}

export function formatCategory(value) {
  if (typeof value === 'string' && value.trim() !== '') {
    return value.trim();
  }

  return 'カテゴリ未設定';
}

export function clampText(value, max = 70) {
  if (typeof value !== 'string') {
    return '';
  }

  const normalized = value.trim();
  if (normalized.length <= max) {
    return normalized;
  }

  return `${normalized.slice(0, max)}…`;
}

export function selectImage(product) {
  const candidates = [product?.thumbImage, product?.mainImage];
  for (const candidate of candidates) {
    if (isSafeImagePath(candidate)) {
      return candidate;
    }
  }
  return FALLBACK_IMAGE;
}

function isSafeImagePath(value) {
  if (typeof value !== 'string') {
    return false;
  }

  const trimmed = value.trim();
  if (!trimmed.startsWith('/')) {
    return false;
  }

  return !trimmed.startsWith('//') && !trimmed.includes('javascript:');
}

export function attachImageFallback(img, altText = '商品画像') {
  img.addEventListener('error', () => {
    if (img.src.endsWith(FALLBACK_IMAGE)) {
      return;
    }

    img.src = FALLBACK_IMAGE;
    img.alt = `${altText}（代替画像）`;
  });
}

export function normalizeProducts(items) {
  return items
    .filter((item) => item && typeof item === 'object')
    .filter((item) => item.visible === true)
    .filter((item) => typeof item.id === 'string' && item.id.trim() !== '')
    .filter((item) => typeof item.name === 'string' && item.name.trim() !== '')
    .map((item, index) => ({ ...item, _index: index }))
    .sort((a, b) => {
      const aSort = Number.isFinite(a.sortOrder) ? a.sortOrder : Number.POSITIVE_INFINITY;
      const bSort = Number.isFinite(b.sortOrder) ? b.sortOrder : Number.POSITIVE_INFINITY;
      if (aSort !== bSort) {
        return aSort - bSort;
      }
      return a._index - b._index;
    });
}
