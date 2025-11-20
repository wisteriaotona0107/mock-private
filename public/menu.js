async function renderMenuTable() {
  const res = await fetch('data/menu.json');
  const data = await res.json();
  const tbody = document.querySelector('#menuTable tbody');
  tbody.innerHTML = data.items
    .map(
      (item, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${item.category}</td>
        <td>${item.name}</td>
        <td>${item.price}</td>
        <td>${item.pairing}</td>
      </tr>
    `
    )
    .join('');
}

document.addEventListener('DOMContentLoaded', renderMenuTable);
