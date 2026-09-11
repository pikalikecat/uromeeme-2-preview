'use strict';
document.querySelectorAll('.space-gallery-r29').forEach(gallery => {
  const track = gallery.querySelector('.space-gallery-r29__track');
  const slides = [...track.querySelectorAll('figure')];
  const controls = gallery.querySelector('.space-gallery-r29__controls');
  const prev = controls.querySelector('[data-gallery-prev]');
  const next = controls.querySelector('[data-gallery-next]');
  const count = controls.querySelector('[data-gallery-count]');
  if (!slides.length) return;
  let current = 0;
  let timer;
  const update = () => {
    const left = track.getBoundingClientRect().left;
    current = slides.reduce((best, slide, i) =>
      Math.abs(slide.getBoundingClientRect().left - left) <
      Math.abs(slides[best].getBoundingClientRect().left - left) ? i : best, 0);
    count.textContent = String(current + 1).padStart(2, '0') + ' / ' + String(slides.length).padStart(2, '0');
    prev.disabled = current === 0;
    next.disabled = current === slides.length - 1;
  };
  const go = delta => {
    const target = slides[Math.max(0, Math.min(slides.length - 1, current + delta))];
    track.scrollBy({
      left: target.getBoundingClientRect().left - track.getBoundingClientRect().left,
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
    });
  };
  prev.addEventListener('click', () => go(-1));
  next.addEventListener('click', () => go(1));
  track.addEventListener('keydown', event => {
    if (event.target !== track || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    go(event.key === 'ArrowLeft' ? -1 : 1);
  });
  track.addEventListener('scroll', () => {
    clearTimeout(timer);
    timer = setTimeout(update, 120);
  }, { passive: true });
  window.addEventListener('resize', update);
  controls.hidden = false;
  update();
});