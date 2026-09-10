'use strict';
(() => {
  const root = document.querySelector('.m19-home-preview');
  if (!root) return;
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
  root.addEventListener('keydown', event => {
    const menu = root.querySelector('.menu');
    if (event.key === 'Escape' && menu.open && menu.contains(document.activeElement)) {
      menu.open = false;
      menu.querySelector('summary').focus();
    }
  });

})();
