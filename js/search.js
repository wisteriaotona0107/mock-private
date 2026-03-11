function inPriceRange(price, band) {
  if (!band) return true;
  if (band === 'low') return price < 800;
  if (band === 'mid') return price >= 800 && price < 1000;
  return price >= 1000;
}

function inSweetBand(value, select) {
  if (!select) return true;
  if (select === 'sweet') return value <= 45;
  return value > 45;
}

function inBodyBand(value, select) {
  if (!select) return true;
  if (select === 'light') return value < 50;
  return value >= 50;
}

export function applyFilters(data, controls) {
  const text = controls.searchInput.value.trim().toLowerCase();

  return data.filter((item) => {
    const textMatch = !text
      || item.name.toLowerCase().includes(text)
      || item.desc.toLowerCase().includes(text)
      || item.aroma.toLowerCase().includes(text);

    return textMatch
      && (!controls.typeSelect.value || item.type === controls.typeSelect.value)
      && (!controls.riceSelect.value || item.rice === controls.riceSelect.value)
      && (!controls.regionSelect.value || item.region === controls.regionSelect.value)
      && inSweetBand(item.sweetDry, controls.sweetSelect.value)
      && inBodyBand(item.body, controls.bodySelect.value)
      && inPriceRange(item.price, controls.priceSelect.value);
  });
}

export function setupSearchController(controls, onChange) {
  Object.values(controls).forEach((control) => {
    control.addEventListener('input', onChange);
    control.addEventListener('change', onChange);
  });
}
