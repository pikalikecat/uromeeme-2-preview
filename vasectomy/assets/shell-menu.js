'use strict';
(() => {
  // The markup, menu hierarchy, URLs, SVG icons and order are extracted from r107.
  const menus = [...document.querySelectorAll('details.menu, details.nav-group')];
  menus.forEach(menu => menu.addEventListener('keydown', event => {
    if(event.key !== 'Escape' || !menu.open || !menu.contains(document.activeElement)) return;
    event.preventDefault(); event.stopPropagation(); menu.open = false;
    menu.querySelector(':scope > summary')?.focus();
  }));
  const mobile = document.querySelector('details.menu');
  matchMedia('(min-width:1121px)').addEventListener('change', () => {
    if(mobile){mobile.open=false;mobile.querySelectorAll('details').forEach(x=>x.open=false);}
  });
  // Keep the r107 announcement as a static baseline, avoiding stale-message rotation.
})();
