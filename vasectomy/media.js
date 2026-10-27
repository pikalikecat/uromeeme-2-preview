'use strict';
(() => {
  document.body.classList.add('home-js');
  const menu = document.querySelector('.home-menu');
  const trigger = menu.querySelector(':scope > summary');
  const header = document.querySelector('.home-header');
  const outside = [...document.querySelectorAll('main,footer,.quick-r98,.home-logo,.home-desktop-nav,.home-header-actions > a')];
  const close = (focus = true) => { menu.open = false; if (focus) trigger.focus({preventScroll:true}); };
  new ResizeObserver(() => document.documentElement.style.setProperty('--mobile-header-height-r58', `${header.getBoundingClientRect().height}px`)).observe(header);
  menu.addEventListener('toggle', () => {
    document.body.classList.toggle('menu-is-open', menu.open);
    trigger.setAttribute('aria-expanded', String(menu.open));
    trigger.setAttribute('aria-label', menu.open ? '關閉導覽選單' : '開啟導覽選單');
    outside.forEach(el => { el.inert = menu.open; });
    if (menu.open) menu.querySelector('.home-menu-panel > a').focus({preventScroll:true});
  });
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => close(false)));
  document.addEventListener('click', e => {
    if (menu.open && !menu.contains(e.target)) close();
    document.querySelectorAll('.home-desktop-nav details[open]').forEach(d => { if (!d.contains(e.target)) d.open = false; });
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (menu.open) close();
      document.querySelectorAll('.home-desktop-nav details[open]').forEach(d => { d.open=false; d.querySelector('summary').focus(); });
    }
    if (e.key !== 'Tab' || !menu.open) return;
    const items = [...menu.querySelectorAll('summary,a,button')].filter(el => el.getClientRects().length);
    const first=items[0], last=items.at(-1);
    if (e.shiftKey && document.activeElement===first) { e.preventDefault();last.focus(); }
    else if (!e.shiftKey && document.activeElement===last) { e.preventDefault();first.focus(); }
  });
  matchMedia('(min-width:1251px)').addEventListener('change', e => { if(e.matches) close(false); });
  document.querySelector('#quick-top-r98').addEventListener('click', () => {
    scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
    document.querySelector('#main').focus({preventScroll:true});
  });
})();
