'use strict';
(() => {
  const top = document.querySelector('.site-top-r48');
  if (!top) return;
  const update = () => {
    const height = Math.ceil(top.getBoundingClientRect().height);
    document.documentElement.style.setProperty('--m19-sticky-height', height + 'px');
  };
  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(update).observe(top);
  window.addEventListener('resize', update);
  window.addEventListener('load', update);
  document.fonts?.ready.then(update);
  update();
  // A menu selection closes the mobile panel; Escape remains handled by r25.
  const menu = top.querySelector('details.menu');
  menu?.addEventListener('click', event => {
    if (event.target.closest('a[href]')) menu.open = false;
  });
})();
