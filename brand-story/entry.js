(() => {
  'use strict';
  const hero = document.querySelector('.cinema-hero');
  if (!hero) return;
  const control = hero.querySelector('.intro-control');
  const next = hero.querySelector('.intro-next');
  const images = [...hero.querySelectorAll('.cinema-art img, .entry-portal img, .door-front img, .sign-front img, .sign-back img')];
  const status = hero.querySelector('.intro-status');
  const aperture = hero.querySelector('.entry-aperture-mask');
  const door = hero.querySelector('.door-perspective');
  const sign = hero.querySelector('.door-sign');
  if (!control || !next || images.length !== 5 || !status || !aperture || !door || !sign) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let state = 'waiting';
  let runId = 0;
  let autoAttempted = false;
  let pageEntered = false;
  let observer;
  let releaseTimer;
  let scrollLock;
  const originalRestoration = history.scrollRestoration;
  let viewportWidth = innerWidth;
  let viewportHeight = innerHeight;
  function fitShell() {
    const shell = document.querySelector('.site-top-r48')?.closest('.site-shell');
    if (shell) hero.style.setProperty('--entry-shell-height', `${Math.ceil(shell.getBoundingClientRect().height)}px`);
    // Keep the mobile foreground below the actual reading control, not a
    // hard-coded device height. The two layers share this entrance anchor.
    const copyBottom = next.getBoundingClientRect().bottom - hero.getBoundingClientRect().top;
    hero.style.setProperty('--entry-copy-bottom', `${Math.ceil(copyBottom)}px`);
    // Read untransformed layout coordinates; a same-size viewport event may
    // arrive during passage, so projected bounding boxes must not move the hole.
    const h = hero.getBoundingClientRect();
    const layout = getComputedStyle(door);
    const left = parseFloat(layout.left), top = parseFloat(layout.top);
    const width = parseFloat(layout.width), height = parseFloat(layout.height);
    // Hardware is a genuine separate mesh in the same door coordinate space.
    // Keep a minimum diameter/projection on phones; never flatten it into the
    // overflow-clipped photographic face. All intermediate groups preserve 3D.
    const radius = Math.min(8, Math.max(4.8, width * .0135));
    const projection = Math.min(38, Math.max(25, width * .060));
    const postRadius = radius * .43;
    const postLength = projection - 9;
    const props = {
      '--pull-r':radius,
      '--pull-face':2 * radius * Math.sin(Math.PI / 16) + .18,
      '--pull-apothem':radius * Math.cos(Math.PI / 16),
      '--pull-z':projection,
      '--post-r':postRadius,
      '--post-face':2 * postRadius * Math.sin(Math.PI / 8) + .12,
      '--post-apothem':postRadius * Math.cos(Math.PI / 8),
      '--post-length':postLength,
      '--post-z':9 + postLength / 2,
      '--mount-r':radius * .76,
      '--mount-face':2 * radius * .76 * Math.sin(Math.PI / 8) + .12,
      '--mount-apothem':radius * .76 * Math.cos(Math.PI / 8)
    };
    for (const [key,value] of Object.entries(props)) hero.style.setProperty(key, `${value.toFixed(3)}px`);
    // Raised sign contours use exactly the same door-local coordinates as the
    // hardware. No bitmap stack: each perimeter has a real perpendicular wall.
    // Resolve the sign's own untransformed CSS width so size/placement stay a
    // single design source; projected boxes during opening must not shrink it.
    const signWidth = parseFloat(getComputedStyle(sign).width);
    const signDepth = Math.min(13, Math.max(5, signWidth * .041));
    hero.style.setProperty('--sign-scale', (signWidth / Number(sign.dataset.sourceWidth)).toFixed(6));
    hero.style.setProperty('--sign-depth', `${signDepth.toFixed(3)}px`);
    hero.style.setProperty('--sign-front-z', `${(6.6 + signDepth).toFixed(3)}px`);
    hero.style.setProperty('--sign-shadow-x', `${Math.min(5, Math.max(2, signWidth * .016)).toFixed(3)}px`);
    hero.style.setProperty('--sign-shadow-y', `${Math.min(7, Math.max(3, signWidth * .021)).toFixed(3)}px`);
    const x = left / h.width;
    const y = top / h.height;
    const w = width / h.width;
    const b = (top + height) / h.height;
    const rx = w * .09575;
    const ry = height / h.height * .05582;
    aperture.setAttribute('d', `M${x + rx} ${y} H${x + w - rx} Q${x + w} ${y} ${x + w} ${y + ry} V${b} H${x} V${y + ry} Q${x} ${y} ${x + rx} ${y} Z`);
    hero.dataset.aperture = JSON.stringify({x,y,w,height:height / h.height,rx,ry});
  }
  function setState(value, reason = '') {
    state = value;
    hero.dataset.introState = value;
    hero.dataset.introReason = reason;
  }
  function isVisible() {
    if (document.hidden) return false;
    const rect = hero.getBoundingClientRect();
    const visible = Math.max(0, Math.min(rect.bottom, innerHeight) - Math.max(rect.top, 0));
    return visible >= Math.min(rect.height, innerHeight) * .45;
  }
  function unlock() {
    if (!scrollLock) return;
    document.documentElement.style.overflow = scrollLock.root;
    document.body.style.overflow = scrollLock.body;
    document.documentElement.classList.remove('cinema-locked');
    scrollLock = null;
  }
  function settle(reason, announce = false) {
    ++runId;
    clearTimeout(releaseTimer);
    unlock();
    hero.classList.remove('cinema-playing', 'cinema-loading');
    hero.classList.add('cinema-settled');
    setState('settled', reason);
    control.textContent = '略過開場';
    control.disabled = false;
    if (document.activeElement === control) next.focus({preventScroll:true});
    control.hidden = true;
    if (announce) status.textContent = '開場完成，可以往下閱讀。';
  }
  async function start() {
    if (state === 'playing' || state === 'preparing') return;
    if (!isVisible()) { settle('not-visible'); return; }
    autoAttempted = true;
    if (reduced.matches) { settle('reduced-motion'); status.textContent = '已呈現靜態空間意象。'; return; }
    const ticket = ++runId;
    setState('preparing');
    hero.classList.add('cinema-loading');
    fitShell();
    control.textContent = '略過開場';
    control.hidden = false;
    let prepareTimer;
    try {
      await Promise.race([
        Promise.all(images.map(image => image.decode())),
        new Promise((_, reject) => { prepareTimer = setTimeout(() => reject(new Error('image-timeout')), 2000); })
      ]);
      clearTimeout(prepareTimer);
      if (ticket !== runId) return;
      if (images.some(image => !image.naturalWidth) || !isVisible() || reduced.matches) { settle('preparation-changed'); return; }
      hero.classList.remove('cinema-loading', 'cinema-settled', 'cinema-playing');
      void hero.offsetWidth;
      // Time-based release is independent of CSS animation completion.
      releaseTimer = setTimeout(() => settle('complete', true), 5600);
      scrollLock = {root:document.documentElement.style.overflow, body:document.body.style.overflow};
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      document.documentElement.classList.add('cinema-locked');
      setState('playing', 'page-entry');
      hero.classList.add('cinema-playing');
      status.textContent = '開場約五點五秒，可略過或直接往下閱讀。';
    } catch (_) {
      clearTimeout(prepareTimer);
      if (ticket === runId) settle('image-fallback');
    }
  }
  control.addEventListener('click', () => {
    if (state === 'playing' || state === 'preparing') settle('skip', true);
  });
  next.addEventListener('click', () => settle('read-next'));
  document.addEventListener('keydown', event => {
    if ((state === 'playing' || state === 'preparing') && event.key === 'Escape') settle('escape', true);
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && (state === 'playing' || state === 'preparing')) settle('hidden');
    else maybeStart();
  });
  window.addEventListener('pagehide', () => {
    pageEntered = false;
    settle('pagehide');
    history.scrollRestoration = originalRestoration;
  });
  window.addEventListener('pageshow', enterPage);
  reduced.addEventListener('change', event => { if (event.matches) settle('reduced-motion'); });
  function maybeStart() {
    if (!pageEntered) return;
    if ((state === 'playing' || state === 'preparing') && !isVisible()) settle('left-view');
    else if (!autoAttempted && state === 'waiting' && isVisible()) start();
  }
  window.addEventListener('resize', () => {
    const changed = Math.abs(innerWidth - viewportWidth) > 1 || Math.abs(innerHeight - viewportHeight) > 1;
    viewportWidth = innerWidth;
    viewportHeight = innerHeight;
    if (changed && (state === 'playing' || state === 'preparing')) settle('viewport-changed');
    fitShell();
    maybeStart();
  }, {passive:true});
  window.addEventListener('scroll', maybeStart, {passive:true});
  function enterPage() {
    settle('new-entry');
    pageEntered = true;
    autoAttempted = false;
    setState('waiting');
    status.textContent = '';
    // Every document entry starts at the opening, including reloads after
    // reading a section. In-page reading/skip links remain unchanged.
    history.scrollRestoration = 'manual';
    window.scrollTo({top:0,left:0,behavior:'instant'});
    fitShell();
    if (reduced.matches) { autoAttempted = true; settle('reduced-motion'); return; }
    maybeStart();
  }
  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver(maybeStart, {threshold:[0,.1,.25,.45,.6,.8,1]});
    observer.observe(hero);
  }
  fitShell();
  setState('waiting');
  if (document.readyState === 'complete') enterPage();
})();
