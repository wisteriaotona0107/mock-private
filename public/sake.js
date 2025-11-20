async function initSake() {
  const data = await (await fetch('data/sake.json')).json();
  const prefFilter = document.getElementById('prefFilter');
  const typeFilter = document.getElementById('typeFilter');
  const container = document.getElementById('sakeCards');

  const uniquePrefs = [...new Set(data.map((s) => s.prefecture))];
  uniquePrefs.forEach((pref) => {
    const option = document.createElement('option');
    option.value = pref;
    option.textContent = pref;
    prefFilter.appendChild(option);
  });

  function createCard(item) {
    return `
      <article class="card">
        <span class="tag">${item.type}</span>
        <img src="${item.image}" alt="${item.name}" />
        <h3>${item.name}</h3>
        <p class="meta">${item.brewery} / ${item.prefecture}・${item.polishing}%</p>
        <p>${item.tasting}</p>
        <p class="meta">提供温度: ${item.serving} / グラス: ${item.glass}</p>
      </article>
    `;
  }

  function render() {
    const pref = prefFilter.value;
    const type = typeFilter.value;
    const filtered = data.filter((s) => (!pref || s.prefecture === pref) && (!type || s.type === type));
    container.innerHTML = filtered.map(createCard).join('');
  }

  prefFilter.addEventListener('change', render);
  typeFilter.addEventListener('change', render);
  render();
}

document.addEventListener('DOMContentLoaded', initSake);
