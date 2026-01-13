/*
  Dream Cat Pod LP Script
  - スクロールでフェードイン
  - アニメーションはCSS主体、JSは最小限
*/
const revealTargets = document.querySelectorAll(".reveal");

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.2,
  }
);

revealTargets.forEach((target) => observer.observe(target));
