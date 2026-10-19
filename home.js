'use strict';
(() => {
  document.body.classList.add('home-js');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const menu = document.querySelector('.home-menu');
  const menuSummary = menu.querySelector(':scope > summary');
  const closeMenu = () => { menu.open = false; menuSummary.focus(); };
  menu.querySelector('.home-menu-close').addEventListener('click', closeMenu);
  menu.addEventListener('toggle', () => {
    menuSummary.setAttribute('aria-label', menu.open ? '關閉導覽選單' : '開啟導覽選單');
    if (menu.open) document.querySelectorAll('.home-desktop-nav details[open]').forEach(d => d.open = false);
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (menu.open) closeMenu();
      document.querySelectorAll('.home-desktop-nav details[open]').forEach(d => { d.open = false; d.querySelector('summary').focus(); });
    }
    if (e.key === 'Tab' && menu.open) {
      const focusable = [...menu.querySelectorAll('summary, a, button')].filter(n => n.getClientRects().length);
      const first = focusable[0], last = focusable.at(-1);
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  document.addEventListener('click', e => {
    if (!menu.contains(e.target) && menu.open) menu.open = false;
    document.querySelectorAll('.home-desktop-nav details[open]').forEach(d => { if (!d.contains(e.target)) d.open = false; });
  });
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => menu.open = false));
  matchMedia('(min-width:1251px)').addEventListener('change', e => { if (e.matches) menu.open = false; });

  const notices = document.querySelector('.home-announcement');
  const noticeItems = [...notices.querySelectorAll('li')];
  const noticeHold = 6000, noticeTransition = 180;
  let noticeIndex = 0, timer;
  function noticeRender(animate = false) {
    notices.classList.toggle('home-all-notices', reduced.matches);
    noticeItems.forEach((item, index) => {
      const inactive = !reduced.matches && index !== noticeIndex;
      item.hidden = inactive;
      item.inert = inactive;
      item.classList.toggle('notice-enter-r24', animate && !inactive && !reduced.matches);
    });
  }
  function noticeSchedule(delay = noticeHold) {
    clearTimeout(timer);
    if (!reduced.matches && !document.hidden && !notices.matches(':hover, :focus-within')) {
      timer = setTimeout(() => {
        noticeIndex = (noticeIndex + 1) % noticeItems.length;
        noticeRender(true);
        // Keep the next message fully readable for six seconds after its entrance.
        noticeSchedule(noticeHold + noticeTransition);
      }, delay);
    }
  }
  ['mouseenter', 'focusin'].forEach(name => notices.addEventListener(name, () => clearTimeout(timer)));
  ['mouseleave', 'focusout'].forEach(name => notices.addEventListener(name, () => setTimeout(() => noticeSchedule(), 0)));
  document.addEventListener('visibilitychange', () => noticeSchedule());
  reduced.addEventListener('change', () => { noticeRender(); noticeSchedule(); });
  noticeRender(); noticeSchedule();

  document.querySelectorAll('[data-carousel]').forEach(region => {
    const track = region.querySelector('.home-slides');
    const items = [...track.children];
    const prev = region.querySelector('[data-prev]'), next = region.querySelector('[data-next]');
    const label = region.querySelector('[data-position]');
    let index = 0;
    const nearest = () => Math.max(0, items.findIndex(n => Math.abs(n.offsetLeft - items[0].offsetLeft - track.scrollLeft) < n.clientWidth / 2));
    function render() {
      index = nearest();
      const view = track.getBoundingClientRect();
      items.forEach(item => {
        const r=item.getBoundingClientRect(), off=r.right<=view.left+1 || r.left>=view.right-1;
        item.classList.toggle('home-offscreen',off); item.inert=off;
        item.setAttribute('aria-hidden',String(off));
      });
      const shown = Math.min(items.length-index,Math.max(1,Math.round(track.clientWidth/items[0].clientWidth)));
      label.textContent = shown>1 ? `${index + 1}–${index + shown} / ${items.length}` : `${index + 1} / ${items.length}`;
    }
    function move(delta) {
      const max = track.scrollWidth-track.clientWidth;
      let left;
      if (delta>0 && track.scrollLeft>=max-2) left=0;
      else if (delta<0 && track.scrollLeft<=2) left=max;
      else { index=Math.max(0,Math.min(items.length-1,nearest()+delta)); left=items[index].offsetLeft-items[0].offsetLeft; }
      track.scrollTo({left, behavior: reduced.matches ? 'instant' : 'smooth'});
    }
    prev.addEventListener('click', () => move(-1)); next.addEventListener('click', () => move(1));
    track.addEventListener('scroll', render, {passive:true});
    track.addEventListener('keydown', e => {
      if (e.target !== track) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); move(e.key === 'ArrowRight' ? 1 : -1); }
      if (e.key === 'Home') { e.preventDefault(); track.scrollTo({left:0}); }
      if (e.key === 'End') { e.preventDefault(); track.scrollTo({left:track.scrollWidth}); }
    });
    new ResizeObserver(render).observe(track);
    render();
  });
  const tabs = [...document.querySelectorAll('.home-schedule-mobile [role=tab]')];
  function selectDay(index, focus=false) {
    tabs.forEach((tab,i) => {
      tab.setAttribute('aria-selected', String(i === index)); tab.tabIndex = i === index ? 0 : -1;
      document.getElementById(tab.getAttribute('aria-controls')).hidden = i !== index;
    });
    if (focus) tabs[index].focus();
  }
  tabs.forEach((tab,i) => {
    tab.addEventListener('click', () => selectDay(i));
    tab.addEventListener('keydown', e => {
      let n;
      if (e.key === 'ArrowRight') n=(i+1)%tabs.length;
      if (e.key === 'ArrowLeft') n=(i-1+tabs.length)%tabs.length;
      if (e.key === 'Home') n=0;
      if (e.key === 'End') n=tabs.length-1;
      if (n !== undefined) { e.preventDefault(); selectDay(n,true); }
    });
  });
  document.querySelectorAll('#home-back-top, #home-inline-top').forEach(button => button.addEventListener('click', () => {
    scrollTo({top:0, behavior:reduced.matches?'instant':'smooth'});
    document.querySelector('.home-logo').focus({preventScroll:true});
  }));

  // Once-only, low-amplitude arrivals; nothing is hidden while waiting for JavaScript.
  const arrivals = [
    ...document.querySelectorAll('.home-stats > div, .home-service > summary, .home-doctor-photo'),
    ...document.querySelectorAll('.home-environment h2, .home-gallery, .home-care-photo, .home-journal h2, .home-contact-photo')
  ];
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) {
      observer.unobserve(entry.target);
      if (reduced.matches) continue;
      const photo = entry.target.matches('.home-gallery, .home-care-photo, .home-contact-photo');
      entry.target.classList.add(photo?'home-photo-arrive':'home-text-arrive');
    }
  },{threshold:.15});
  arrivals.forEach(n => observer.observe(n));
  reduced.addEventListener('change', () => { if (reduced.matches) document.getAnimations().forEach(a => a.cancel()); });
})();
