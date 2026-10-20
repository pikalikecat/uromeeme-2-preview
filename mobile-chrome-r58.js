'use strict';
(() => {
  const header = document.querySelector('.m19-home-preview .home-header');
  if (!header) return;
  const measure = () => document.documentElement.style.setProperty(
    '--mobile-header-height-r58', `${header.getBoundingClientRect().height}px`
  );
  measure();
  new ResizeObserver(measure).observe(header);
})();
