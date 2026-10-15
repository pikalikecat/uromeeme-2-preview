/* Mobile: whole-card effects start on entry. No pointer listeners or tracking. */
(() => {
  'use strict';
  if (!('IntersectionObserver' in window)) return;
  const coarse = matchMedia('(hover: none), (pointer: coarse)');
  const stages = [...document.querySelectorAll('.dr-portrait-stage')];
  const buttons = [...document.querySelectorAll('.dr-booking-cta')];
  const targets = [...stages, ...buttons];
  let observer = null;
  const reset = () => {
    if (observer) observer.disconnect();
    observer = null;
    stages.forEach(stage => stage.classList.remove('is-mobile-lit'));
    buttons.forEach(button => button.classList.remove('is-mobile-shining'));
    document.documentElement.classList.remove('dr-photo-auto-ready');
  };
  const sync = () => {
    reset();
    if (!coarse.matches) return;
    document.documentElement.classList.add('dr-photo-auto-ready');
    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const effect = entry.target.classList.contains('dr-portrait-stage') ? 'is-mobile-lit' : 'is-mobile-shining';
        if (!entry.isIntersecting) entry.target.classList.remove(effect);
        else if (entry.intersectionRatio >= .25) entry.target.classList.add(effect);
      });
    }, {threshold:[0,.25]});
    targets.forEach(target => observer.observe(target));
  };
  coarse.addEventListener('change', sync);
  sync();
})();
