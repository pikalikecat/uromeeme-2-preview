'use strict';
// The story's root overflow and the shared menu each own a lock. Freeze the
// page while this menu is open so touch cannot leak through the narrow layout.
(() => {
  const menu = document.querySelector('.home-menu');
  let saved;
  menu.addEventListener('toggle', () => {
    const body = document.body, html = document.documentElement;
    if (menu.open && !saved) {
      saved = { y: scrollY, root: html.style.overflow,
        position: body.style.position, top: body.style.top, width: body.style.width };
      html.style.overflow = 'hidden';
      body.style.position = 'fixed';
      body.style.top = `-${saved.y}px`;
      body.style.width = '100%';
    } else if (!menu.open && saved) {
      const previous = saved;
      saved = null;
      html.style.overflow = previous.root;
      body.style.position = previous.position;
      body.style.top = previous.top;
      body.style.width = previous.width;
      scrollTo({ top: previous.y, behavior: 'instant' });
    }
  });
})();
