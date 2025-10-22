(function () {
  const navToggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.primary-nav');

  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      nav.classList.toggle('open');
    });
  }

  // Comparison toggle buttons
  document.querySelectorAll('.comparison').forEach((comparison) => {
    const images = comparison.querySelectorAll('.comparison-image');
    const buttons = comparison.querySelectorAll('.comparison-controls .btn.toggle');

    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        const targetState = button.dataset.show;
        buttons.forEach((btn) => {
          btn.classList.toggle('active', btn === button);
          btn.setAttribute('aria-pressed', String(btn === button));
        });

        images.forEach((image) => {
          const isActive = image.dataset.state === targetState;
          image.classList.toggle('is-active', isActive);
        });
      });
    });
  });

  // Fetch latest news
  const newsList = document.getElementById('news-list');
  if (newsList) {
    fetch('assets/data/news.json')
      .then((res) => res.json())
      .then((newsItems) => {
        newsList.innerHTML = '';
        newsItems.slice(0, 4).forEach((item) => {
          const li = document.createElement('li');
          li.innerHTML = `<time datetime="${item.date}">${item.displayDate}</time><p>${item.title}</p>`;
          newsList.appendChild(li);
        });
      })
      .catch(() => {
        const li = document.createElement('li');
        li.textContent = 'ニュースを読み込めませんでした。';
        newsList.appendChild(li);
      });
  }
})();
