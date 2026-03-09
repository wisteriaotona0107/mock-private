export async function fetchProducts() {
  const response = await fetch('/data/products.json', {
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error('FETCH_FAILED');
  }

  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new Error('INVALID_JSON');
  }

  if (!payload || !Array.isArray(payload.items)) {
    throw new Error('INVALID_SCHEMA');
  }

  return payload;
}
