'use strict';
(() => {
  document.body.classList.add('home-js');
  const menu = document.querySelector('.home-menu');
  const trigger = menu.querySelector(':scope > summary');
  const header = document.querySelector('.home-header');
  const quick = document.querySelector('.quick-r98');
  const main = document.querySelector('main');
  const footer = document.querySelector('footer');
  // Hit-test the moving finger without cancelling native scroll or link activation.
  const hero = document.querySelector('.visit-entrance');
  let touchedLink = null, touchGlowTimer;
  const setTouchGlow = link => {
    clearTimeout(touchGlowTimer);
    touchedLink?.classList.remove('is-touch-glowing');
    touchedLink = link;
    touchedLink?.classList.add('is-touch-glowing');
  };
  const trackTouch = event => {
    const touch = event.touches.length === 1 ? event.touches[0] : null;
    const link = touch ? document.elementFromPoint(touch.clientX, touch.clientY)?.closest('.hero-glow-link') : null;
    setTouchGlow(link && hero.contains(link) ? link : null);
    // A browser-owned pan may stop sending moves; never leave its last link lit.
    if (event.type === 'touchmove') touchGlowTimer = setTimeout(() => setTouchGlow(null), 360);
  };
  hero.addEventListener('touchstart', trackTouch, { passive: true });
  hero.addEventListener('touchmove', trackTouch, { passive: true });
  hero.addEventListener('touchend', () => { touchGlowTimer = setTimeout(() => setTouchGlow(null), 180); }, { passive: true });
  hero.addEventListener('touchcancel', () => setTouchGlow(null), { passive: true });
  window.addEventListener('blur', () => setTouchGlow(null));
  document.addEventListener('visibilitychange', () => { if (document.hidden) setTouchGlow(null); });
  new ResizeObserver(() => document.documentElement.style.setProperty('--contact-header-height', `${header.getBoundingClientRect().height}px`)).observe(header);
  const video = document.querySelector('.hero-video');
  const media = document.querySelector('.hero-media');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let wantsPlayback = !motion.matches && !navigator.connection?.saveData;
  let heroVisible = true;
  if (video.canPlayType('video/webm')) {
    const syncPlayback = () => {
      if (!wantsPlayback || !heroVisible || document.hidden) { video.pause(); return; }
      if (!video.getAttribute('src')) video.src = innerWidth <= 768 ? video.dataset.mobile : video.dataset.desktop;
      video.muted = true;
      video.play().catch(() => { wantsPlayback = false; });
    };
    video.addEventListener('playing', () => media.classList.add('has-frame'));
    video.addEventListener('error', () => { media.classList.add('video-failed'); wantsPlayback = false; });
    new IntersectionObserver(entries => { heroVisible = entries[0].isIntersecting; syncPlayback(); }, {threshold: 0}).observe(document.querySelector('.visit-entrance'));
    document.addEventListener('visibilitychange', syncPlayback);
    motion.addEventListener('change', e => { wantsPlayback = !e.matches && !navigator.connection?.saveData; syncPlayback(); });
    syncPlayback();
  }
  const closeMenu = (restore = true) => {
    menu.open = false;
    if (restore) trigger.focus({ preventScroll: true });
  };
  menu.querySelector('.home-menu-close').addEventListener('click', () => closeMenu());
  menu.addEventListener('toggle', () => {
    document.body.classList.toggle('menu-is-open', menu.open);
    trigger.setAttribute('aria-expanded', String(menu.open));
    trigger.setAttribute('aria-label', menu.open ? '關閉導覽選單' : '開啟導覽選單');
    [main, footer, quick, ...header.querySelectorAll('.home-logo,.home-desktop-nav,.home-header-actions > a')].forEach(el => { el.inert = menu.open; });
    if (menu.open) menu.querySelector('.home-menu-close').focus({ preventScroll: true });
  });
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => closeMenu(false)));
  document.addEventListener('click', e => {
    if (menu.open && !menu.contains(e.target)) closeMenu();
    document.querySelectorAll('.home-desktop-nav details[open]').forEach(group => { if (!group.contains(e.target)) group.open = false; });
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (menu.open) closeMenu();
      document.querySelectorAll('.home-desktop-nav details[open]').forEach(group => { group.open = false; group.querySelector('summary').focus(); });
    }
    if (e.key !== 'Tab' || !menu.open) return;
    const items = [...menu.querySelectorAll('summary,a,button')].filter(el => el.getClientRects().length);
    const first = items[0], last = items.at(-1);
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
  matchMedia('(min-width:1251px)').addEventListener('change', e => { if (e.matches) closeMenu(false); });

  const tabs = [...document.querySelectorAll('.home-schedule-mobile [role="tab"]')];
  function selectDay(index, focus = false) {
    tabs.forEach((tab, i) => {
      tab.setAttribute('aria-selected', String(i === index));
      tab.tabIndex = i === index ? 0 : -1;
      document.getElementById(tab.getAttribute('aria-controls')).hidden = i !== index;
    });
    if (focus) tabs[index].focus();
  }
  tabs.forEach((tab, i) => {
    tab.setAttribute('aria-label', `星期${['一','二','三','四','五','六'][i]}`);
    tab.addEventListener('click', () => selectDay(i));
    tab.addEventListener('keydown', e => {
      const target = { ArrowRight: (i + 1) % tabs.length, ArrowLeft: (i + tabs.length - 1) % tabs.length, Home: 0, End: tabs.length - 1 }[e.key];
      if (target !== undefined) { e.preventDefault(); selectDay(target, true); }
    });
  });
  document.querySelector('#quick-top-r98').addEventListener('click', () => {
    scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    document.querySelector('.home-logo').focus({ preventScroll: true });
  });
  // Keep keyboard targets clear of the retained sticky header and quick-service bar.
  document.addEventListener('focusin', e => {
    if (menu.open || !e.target.matches('a,button,summary') || header.contains(e.target) || quick.contains(e.target)) return;
    const rect = e.target.getBoundingClientRect();
    const top = header.getBoundingClientRect().bottom + 12;
    const bottom = innerWidth <= 1100 ? quick.getBoundingClientRect().top - 16 : innerHeight - 16;
    if (rect.bottom > bottom) scrollBy({ top: rect.bottom - bottom, behavior: 'instant' });
    else if (rect.top < top) scrollBy({ top: rect.top - top, behavior: 'instant' });
  });
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visit-reveal');
      observer.unobserve(entry.target);
    }), { threshold: .15 });
    document.querySelectorAll('.home-schedule h2,.home-schedule tbody tr,.schedule-guide-copy-r6 > div,.contact-source-note,.contact-import-r14 h2,.contact-import-r14 .booking-actions-r26').forEach(el => observer.observe(el));
  }
})();
