(function () {
  const grid = document.getElementById('project-grid');
  if (!grid) return;

  fetch('assets/data/projects.json')
    .then((res) => res.json())
    .then((projects) => {
      grid.innerHTML = '';
      projects.forEach((project) => {
        const card = document.createElement('article');
        card.className = 'project-card reveal';
        card.setAttribute('role', 'listitem');
        card.innerHTML = `
          <img src="${project.thumbnail}" alt="${project.title}のサムネイル">
          <div>
            <h3>${project.title}</h3>
            <p class="project-meta">${project.location} / ${project.year}</p>
            <p>${project.summary}</p>
            <a class="btn" href="project-detail.html?id=${encodeURIComponent(project.id)}">詳細を見る</a>
          </div>
        `;
        grid.appendChild(card);
      });
      document.dispatchEvent(new CustomEvent('reveal:update'));
    })
    .catch(() => {
      const message = document.createElement('p');
      message.textContent = 'プロジェクト情報を読み込めませんでした。';
      grid.appendChild(message);
    });
})();
