'use strict';
document.querySelectorAll('.space-gallery-r29').forEach(gallery => {
  const track = gallery.querySelector('.space-gallery-r29__track');
  const controls = gallery.querySelector('.space-gallery-r29__controls');
  if (!track || !controls) return;
  const originals = [...track.querySelectorAll('figure')];
  const prev = controls.querySelector('[data-gallery-prev]');
  const next = controls.querySelector('[data-gallery-next]');
  if (!originals.length || !prev || !next) { controls.hidden = true; return; }
  const n = originals.length;
  if (n === 1) { controls.hidden = true; return; }
  // Boundary copies preserve forward/backward motion, including native swipes.
  function clone(slide) {
    const copy = slide.cloneNode(true);
    copy.setAttribute('aria-hidden', 'true'); copy.setAttribute('inert', '');
    copy.removeAttribute('id');
    copy.querySelectorAll('[id]').forEach(node => node.removeAttribute('id'));
    copy.querySelectorAll('img').forEach(img => { img.loading = 'eager'; img.alt = ''; });
    return copy;
  }
  const before = clone(originals[n-1]), after = clone(originals[0]);
  track.prepend(before); track.append(after);
  const slides = [before, ...originals, after];
  let position = 1, timer, busy = false;
  const jump = (index, behavior = 'instant') => {
    const left = track.scrollLeft + slides[index].getBoundingClientRect().left - track.getBoundingClientRect().left;
    track.scrollTo({left, behavior});
  };
  const nearest = () => {
    const left = track.getBoundingClientRect().left;
    return slides.reduce((best, slide, i) => Math.abs(slide.getBoundingClientRect().left-left) < Math.abs(slides[best].getBoundingClientRect().left-left) ? i : best, 0);
  };
  const settle = () => {
    clearTimeout(timer);
    position = nearest();
    if (position === 0) { position = n; jump(position); }
    else if (position === n+1) { position = 1; jump(position); }
    busy = false;
  };
  const go = delta => {
    if (busy) return;
    settle();
    position += delta;
    busy = true;
    jump(position, matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth');
    clearTimeout(timer); timer = setTimeout(settle, 250);
  };
  prev.disabled = false; next.disabled = false;
  prev.addEventListener('click', () => go(-1));
  next.addEventListener('click', () => go(1));
  track.addEventListener('keydown', event => {
    if (event.target !== track || !['ArrowLeft','ArrowRight'].includes(event.key)) return;
    event.preventDefault(); go(event.key === 'ArrowLeft' ? -1 : 1);
  });
  track.addEventListener('scroll', () => { clearTimeout(timer); timer = setTimeout(settle, 160); }, {passive:true});
  track.addEventListener('scrollend', settle);
  window.addEventListener('resize', () => { clearTimeout(timer); busy = false; jump(position); });
  controls.hidden = false; jump(1);
});
