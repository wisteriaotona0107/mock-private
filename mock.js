const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      }
    });
  },
  {
    threshold: 0.2,
    rootMargin: "0px 0px -10% 0px",
  }
);

document.querySelectorAll("[data-animate]").forEach((element, index) => {
  element.style.transitionDelay = `${index * 80}ms`;
  observer.observe(element);
});
