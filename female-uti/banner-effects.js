// One brief decorative pass, no visible controls, requests, tracking or storage.
(() => {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let started = false, finished = false, timer;
  const finish = () => {
    finished = true;
    clearTimeout(timer);
    hero.dataset.fxState = 'finished';
  };
  const start = () => {
    if (started || finished || document.hidden || reduced.matches) return;
    started = true;
    hero.dataset.fxState = 'playing';
    timer = setTimeout(finish, 4500);
  };
  hero.dataset.fxState = 'waiting';
  document.documentElement.classList.add('female-fx-ready');
  if (reduced.matches) finish();
  reduced.addEventListener('change', () => { if (reduced.matches) finish(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden && started) finish(); });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) start();
      else if (started) finish();
    }).observe(hero);
  } else start();
})();
