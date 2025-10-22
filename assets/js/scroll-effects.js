(function () {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const storySteps = Array.from(document.querySelectorAll('.story-step'));
  let observer;

  function syncStorySteps() {
    if (!storySteps.length) return;
    let activeIndex = storySteps.findIndex((step) => step.classList.contains('visible'));
    if (activeIndex === -1) {
      activeIndex = 0;
    } else {
      const lastVisibleIndex = storySteps.reduce((acc, step, index) => (
        step.classList.contains('visible') ? index : acc
      ), activeIndex);
      activeIndex = lastVisibleIndex;
    }

    storySteps.forEach((step, index) => {
      step.setAttribute('aria-current', index === activeIndex ? 'true' : 'false');
    });
  }

  function markVisible(element) {
    element.classList.add('visible');
    if (element.classList.contains('story-step')) {
      syncStorySteps();
    }
  }

  function observeTargets(targets) {
    targets.forEach((element) => {
      if (element.dataset.observed === 'true') return;
      element.dataset.observed = 'true';
      if (prefersReducedMotion) {
        markVisible(element);
        return;
      }
      if (observer) {
        observer.observe(element);
      }
    });
  }

  if (!prefersReducedMotion) {
    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          markVisible(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.25,
    });
  }

  observeTargets(document.querySelectorAll('.reveal'));

  document.addEventListener('reveal:update', () => {
    observeTargets(document.querySelectorAll('.reveal'));
  });

  if (prefersReducedMotion) {
    syncStorySteps();
    return;
  }

  window.addEventListener('scroll', syncStorySteps, { passive: true });
})();
