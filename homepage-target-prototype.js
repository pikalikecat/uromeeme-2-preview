'use strict';
(() => {
  const root = document.querySelector('.m19-home-preview');
  if (!root) return;
  // Local image diagnostics only; never retry through another URL or service.
  root.querySelectorAll('img').forEach(image => {
    let notice = null;
    function renderImageState() {
      if (!image.complete) return;
      if (image.naturalWidth > 0) {
        if (notice) { notice.remove(); notice = null; }
        image.hidden = false;
        return;
      }
      if (notice) return;
      notice = document.createElement('p');
      notice.className = 'image-load-notice';
      notice.textContent = `${image.alt || '圖片'}尚未載入。請稍後重新整理頁面。`;
      image.insertAdjacentElement('afterend', notice);
      image.hidden = true;
    }
    image.addEventListener('load', renderImageState);
    image.addEventListener('error', renderImageState);
    renderImageState();
  });
  // Counter demo: static final values remain the no-JS/no-observer baseline.
  (() => {
    const values = Array.from(root.querySelectorAll('[data-count-demo]'));
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduced.matches || typeof IntersectionObserver === 'undefined') return;
    const formatter = new Intl.NumberFormat('zh-TW');
    const states = values.map(element => ({ element, end: Number(element.dataset.countDemo), started: false, done: false, frame: null }));
    if (states.some(state => !Number.isSafeInteger(state.end) || state.end < 0 || state.end > 1000000)) return;
    function finish(state) {
      state.done = true;
      if (state.frame !== null) cancelAnimationFrame(state.frame);
      state.element.textContent = formatter.format(state.end);
    }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const state = states.find(item => item.element === entry.target);
        if (!entry.isIntersecting || !state || state.started || state.done) return;
        state.started = true;
        observer.unobserve(state.element);
        state.element.textContent = '0';
        let start = null;
        function tick(time) {
          if (state.done) return;
          if (start === null) start = time;
          const progress = Math.min(1, Math.max(0, (time - start) / 1200));
          state.element.textContent = formatter.format(Math.floor(state.end * (1 - Math.pow(1 - progress, 3))));
          if (progress === 1) finish(state);
          else state.frame = requestAnimationFrame(tick);
        }
        state.frame = requestAnimationFrame(tick);
      });
    }, { threshold: 0.4 });
    states.forEach(state => observer.observe(state.element));
    reduced.addEventListener('change', () => {
      if (reduced.matches) { observer.disconnect(); states.forEach(finish); }
    });
  })();
  // Memory-only preview feedback. No navigation, requests, storage, or WordPress.
  const feedback = root.querySelector('#preview-feedback');
  root.querySelectorAll('[data-preview]').forEach(button => {
    button.disabled = false;
    button.addEventListener('click', () => {
      feedback.textContent = `已操作「${button.dataset.preview}」預覽按鈕；未開啟外部服務。`;
    });
  });
  const banner = root.querySelector('.announcement');
  const motion = root.querySelector('#motion-toggle');
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  let playing = false;
  function renderMotion() {
    banner.classList.toggle('is-playing', playing);
    // Action label describes the next action; this is not a fixed-label toggle.
    motion.textContent = playing ? '暫停公告' : '播放公告';
    motion.disabled = preference.matches;
    if (preference.matches) motion.textContent = '靜態公告';
  }
  motion.hidden = false;
  motion.addEventListener('click', () => { playing = !playing && !preference.matches; renderMotion(); });
  preference.addEventListener('change', () => { playing = false; renderMotion(); });
  renderMotion();
  root.querySelectorAll('details.menu, details.nav-group').forEach(menu => {
    menu.addEventListener('keydown', event => {
      if (event.key !== 'Escape' || !menu.open || !menu.contains(document.activeElement)) return;
      const summary = menu.querySelector(':scope > summary');
      if (!summary) return;
      event.preventDefault();
      event.stopPropagation();
      menu.open = false;
      summary.focus();
    });
  });

})();
