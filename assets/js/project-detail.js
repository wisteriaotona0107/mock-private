(function () {
  const params = new URLSearchParams(window.location.search);
  const projectId = params.get('id');

  const titleEl = document.getElementById('project-title');
  const summaryEl = document.getElementById('project-summary');
  const locationEl = document.getElementById('project-location');
  const yearEl = document.getElementById('project-year');
  const divisionEl = document.getElementById('project-division');
  const descriptionEl = document.getElementById('project-description');
  const resultsEl = document.getElementById('project-results');
  const beforeEl = document.getElementById('detail-before');
  const afterEl = document.getElementById('detail-after');
  const breadcrumb = document.getElementById('project-breadcrumb');

  if (!projectId) {
    summaryEl.textContent = 'プロジェクトIDが指定されていません。';
    return;
  }

  fetch('assets/data/projects.json')
    .then((res) => res.json())
    .then((projects) => {
      const project = projects.find((item) => item.id === projectId);
      if (!project) {
        summaryEl.textContent = '指定されたプロジェクトが見つかりませんでした。';
        return;
      }

      titleEl.textContent = project.title;
      summaryEl.textContent = project.summary;
      locationEl.textContent = project.location;
      yearEl.textContent = project.year;
      divisionEl.textContent = project.division;
      descriptionEl.innerHTML = project.description
        .map((paragraph) => `<p>${paragraph}</p>`)
        .join('');

      resultsEl.innerHTML = project.results
        .map((result) => `<li>${result}</li>`)
        .join('');

      beforeEl.src = project.before;
      afterEl.src = project.after;
      beforeEl.alt = `${project.title} 施工前`;
      afterEl.alt = `${project.title} 施工後`;

      if (breadcrumb && breadcrumb.lastElementChild) {
        breadcrumb.lastElementChild.textContent = project.title;
      }
    })
    .catch(() => {
      summaryEl.textContent = 'プロジェクト情報を読み込めませんでした。';
    });
})();
