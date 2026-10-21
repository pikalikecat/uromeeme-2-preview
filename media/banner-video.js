'use strict';
(() => {
  const video = document.querySelector('.banner-video');
  if (!video) return;
  const film = video.parentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width: 700px)');
  let visible = true;
  let attempt = 0;
  function update() {
    const currentAttempt = ++attempt;
    if (reduced.matches) {
      video.pause();
      video.removeAttribute('src');
      video.load();
      film.classList.remove('has-frame');
      return;
    }
    if (document.hidden || !visible) {
      video.pause();
      return;
    }
    const source = mobile.matches ? video.dataset.mobile : video.dataset.desktop;
    if (video.getAttribute('src') !== source) {
      film.classList.remove('has-frame');
      video.muted = true;
      video.src = source;
    }
    video.play().then(() => {
      if (currentAttempt === attempt && !reduced.matches) film.classList.add('has-frame');
    }).catch(() => film.classList.remove('has-frame'));
  }
  video.addEventListener('error', () => film.classList.remove('has-frame'));
  reduced.addEventListener('change', update);
  mobile.addEventListener('change', update);
  document.addEventListener('visibilitychange', update);
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    update();
  }).observe(film);
  update();
})();
