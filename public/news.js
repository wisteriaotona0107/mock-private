async function renderNews() {
  const res = await fetch('data/news.json');
  const data = await res.json();
  const container = document.getElementById('newsFull');
  container.innerHTML = data.items
    .map(
      (item) => `
      <article class="news-card">
        <p class="meta">${item.date}</p>
        <h3>${item.title}</h3>
        <p>${item.body}</p>
        <p class="meta">タグ: ${item.tags.join(', ')}</p>
      </article>
    `
    )
    .join('');
}

document.addEventListener('DOMContentLoaded', renderNews);
