'use strict';
(() => {
  const header = document.querySelector('.home-header');
  const notice = document.querySelector('.home-announcement');
  const quick = document.querySelector('.quick-r98');
  const measure = () => {
    document.documentElement.style.setProperty('--entry-chrome-height', `${header.offsetHeight + notice.offsetHeight}px`);
    document.documentElement.style.setProperty('--entry-quick-height', `${quick.offsetHeight}px`);
  };
  new ResizeObserver(measure).observe(header);
  new ResizeObserver(measure).observe(notice);
  new ResizeObserver(measure).observe(quick);
  measure();

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const duration = 2500;
  const format = new Intl.NumberFormat('en-US');
  const states = [...document.querySelectorAll('[data-count-to]')].map(node => ({node, output: node.querySelector('i'), target: Number(node.dataset.countTo), elapsed: 0, started: null, raf: 0, visible: false, done: false}));
  const finish = state => {
    cancelAnimationFrame(state.raf); state.raf = 0; state.done = true;
    state.output.textContent = format.format(state.target);
  };
  const pause = state => {
    if (state.raf) { state.elapsed += performance.now() - state.started; cancelAnimationFrame(state.raf); state.raf = 0; }
  };
  const play = state => {
    if (state.done || state.raf || !state.visible || document.hidden) return;
    if (reduced.matches) { finish(state); return; }
    state.started = performance.now();
    const tick = now => {
      const progress = Math.min(1, (state.elapsed + now - state.started) / duration);
      state.output.textContent = format.format(Math.floor(state.target * (1 - Math.pow(1-progress, 2))));
      if (progress >= 1) finish(state);
      else state.raf = requestAnimationFrame(tick);
    };
    state.raf = requestAnimationFrame(tick);
  };
  if (reduced.matches || !('IntersectionObserver' in window)) { states.forEach(finish); return; }
  states.forEach(state => { state.output.textContent = '0'; });
  // Each mobile row starts only when visible; off-screen/tab-hidden time does not consume the 2.5 seconds.
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      const state = states.find(state => state.node === entry.target);
      state.visible = entry.isIntersecting && entry.intersectionRatio >= .65;
      if (state.visible) play(state); else pause(state);
    }
  }, {threshold: [0,.65], rootMargin: `-${header.offsetHeight + 12}px 0px -${innerWidth <= 1100 ? quick.offsetHeight + 16 : 24}px 0px`});
  states.forEach(state => observer.observe(state.node));
  document.addEventListener('visibilitychange', () => states.forEach(state => document.hidden ? pause(state) : play(state)));
  reduced.addEventListener('change', () => { if (reduced.matches) { observer.disconnect(); states.forEach(finish); } });
})();
