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
  const states = [...document.querySelectorAll('[data-count-to]')].map(node => ({node, output: node.querySelector('i'), target: Number(node.dataset.countTo), elapsed: 0, started: null, raf: 0, visible: false, begun: false, done: false}));
  const finish = state => {
    cancelAnimationFrame(state.raf); state.raf = 0; state.done = true;
    state.output.textContent = format.format(state.target);
  };
  const pause = state => {
    cancelAnimationFrame(state.raf); state.raf = 0; state.started = null;
  };
  const play = state => {
    if (state.done || state.raf || !state.visible || document.hidden) return;
    if (reduced.matches) { finish(state); return; }
    if (!state.begun) { state.output.textContent = '0'; state.begun = true; }
    state.started = performance.now();
    const tick = now => {
      if (document.hidden || !state.visible) { pause(state); return; }
      state.elapsed += Math.min(100, Math.max(0, now - state.started)); state.started = now;
      const progress = Math.min(1, state.elapsed / duration);
      state.output.textContent = format.format(Math.floor(state.target * (1 - Math.pow(1-progress, 2))));
      if (progress >= 1) finish(state);
      else state.raf = requestAnimationFrame(tick);
    };
    state.raf = requestAnimationFrame(tick);
  };
  if (reduced.matches) { states.forEach(finish); return; }
  let checkRaf = 0;
  // Read six rectangles at most once per scroll frame; retain final text until animation really starts.
  const checkVisible = () => {
    checkRaf = 0;
    const top = Math.max(0, header.getBoundingClientRect().bottom, notice.getBoundingClientRect().bottom) + 12;
    const bottom = innerHeight - (innerWidth <= 1100 ? quick.offsetHeight + 16 : 24);
    states.forEach(state => {
      if (state.done) return;
      const r = state.node.getBoundingClientRect();
      state.visible = r.height > 0 && (Math.min(r.bottom, bottom) - Math.max(r.top, top)) / r.height >= .25;
      if (state.visible) play(state); else pause(state);
    });
  };
  const schedule = () => {
    if (!checkRaf && !document.hidden && states.some(state => !state.done)) checkRaf = requestAnimationFrame(checkVisible);
  };
  const resume = () => {
    cancelAnimationFrame(checkRaf); checkRaf = 0; states.forEach(pause); schedule();
  };
  addEventListener('scroll', schedule, {passive: true});
  addEventListener('resize', schedule);
  addEventListener('pageshow', resume);
  addEventListener('focus', resume);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(checkRaf); checkRaf = 0; states.forEach(pause); }
    else resume();
  });
  reduced.addEventListener('change', () => { if (reduced.matches) { cancelAnimationFrame(checkRaf); states.forEach(finish); } });
  schedule();
})();
