export function getQueryParam(key) {
  return new URLSearchParams(window.location.search).get(key);
}

export function inPriceRange(price, range) {
  if (!range) return true;
  if (range === 'low') return price <= 899;
  if (range === 'mid') return price >= 900 && price <= 1199;
  if (range === 'high') return price >= 1200;
  return true;
}

export function isSweetDryMatch(value, mode) {
  if (!mode) return true;
  if (mode === 'sweet') return value <= 49;
  if (mode === 'dry') return value >= 50;
  return true;
}

export function isBodyMatch(value, mode) {
  if (!mode) return true;
  if (mode === 'light') return value <= 49;
  if (mode === 'full') return value >= 50;
  return true;
}

export function applyFilters(items, filter) {
  const keyword = filter.keyword.trim().toLowerCase();
  const rice = filter.rice.trim().toLowerCase();
  const region = filter.region.trim().toLowerCase();

  return items.filter((item) => {
    const hitKeyword =
      !keyword ||
      item.name.toLowerCase().includes(keyword) ||
      item.desc.toLowerCase().includes(keyword);

    return (
      hitKeyword &&
      (!filter.type || item.type === filter.type) &&
      (!rice || item.rice.toLowerCase().includes(rice)) &&
      (!region || item.region.toLowerCase().includes(region)) &&
      inPriceRange(item.price, filter.priceRange) &&
      isSweetDryMatch(item.sweetDry, filter.sweetness) &&
      isBodyMatch(item.body, filter.body)
    );
  });
}
