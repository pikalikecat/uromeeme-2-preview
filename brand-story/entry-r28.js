(() => {
  'use strict';
  const hero = document.querySelector('.cinema-hero');
  if (!hero) return;
  const next = hero.querySelector('.intro-next');
  const images = [...hero.querySelectorAll('.cinema-art img, .entry-portal img, .door-front img, .sign-front img, .sign-back img')];
  const status = hero.querySelector('.intro-status');
  const preloader = hero.querySelector('.entry-preloader');
  const wallPanels = [...hero.querySelectorAll('.entry-wall-panel')];
  const door = hero.querySelector('.door-perspective');
  const sign = hero.querySelector('.door-sign');
  const copy = hero.querySelector('.cinema-copy');
  if (!next || images.length !== 5 || !status || !preloader || wallPanels.length !== 4 || !door || !sign || !copy) return;
  // The shared wall texture is separate from the mobile picture source.
  const wallTexture = new Image();
  wallTexture.src = new URL('assets/conversation-room-desktop.webp', document.baseURI).href;
  const criticalImages = [...images, wallTexture];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let state = 'waiting';
  let runId = 0;
  let autoAttempted = false;
  let pageEntered = false;
  let observer;
  let releaseTimer;
  let copyTimer;
  let prepareTimer;
  let loadingTimer;
  let mobileStage = false;
  const originalCopyInert = copy.inert;
  const stageProperties = ['--entry-frozen-height','--entry-stage-height','--entry-stage-origin-y',
    '--entry-portal-x','--entry-portal-y','--entry-portal-width','--entry-portal-height',
    '--entry-door-x','--entry-door-y','--entry-door-width','--entry-door-height'];
  let scrollLock;
  const originalRestoration = history.scrollRestoration;
  let viewportWidth = innerWidth;
  let viewportHeight = innerHeight;
  function prepareMobileStage() {
    if (!matchMedia('(max-width: 760px)').matches) return true;
    const h = hero.getBoundingClientRect();
    const visibleHeight = Math.min(innerHeight, window.visualViewport?.height || innerHeight);
    const available = Math.min(h.height, visibleHeight - Math.max(0, h.top));
    // A very short/zoomed viewport gets the original readable static scene,
    // not an offscreen locked animation. Reserve space for toolbar expansion.
    if (available < 260) return false;
    const reserve = Math.min(64, Math.max(24, available - 300));
    const stageHeight = available - reserve;
    const portalWidth = Math.min(h.width * 1.3, stageHeight * .94 * 1.10);
    const portalHeight = portalWidth / 1.10;
    const portalX = (h.width - portalWidth) / 2;
    const portalY = (stageHeight - portalHeight) / 2;
    // One source of geometry for the wood frame, door, mask and camera pivot.
    // These fractions are the aperture in the existing portal artwork.
    const doorX = portalX + portalWidth * .249;
    const doorY = portalY + portalHeight * .102;
    const doorWidth = portalWidth * .501;
    const doorHeight = portalHeight * .842;
    const geometry = {
      '--entry-frozen-height':h.height,
      '--entry-stage-height':stageHeight,
      '--entry-stage-origin-y':doorY + doorHeight / 2,
      '--entry-portal-x':portalX,'--entry-portal-y':portalY,
      '--entry-portal-width':portalWidth,'--entry-portal-height':portalHeight,
      '--entry-door-x':doorX,'--entry-door-y':doorY,
      '--entry-door-width':doorWidth,'--entry-door-height':doorHeight
    };
    for (const [key,value] of Object.entries(geometry)) hero.style.setProperty(key, `${value.toFixed(3)}px`);
    mobileStage = true;
    hero.classList.add('entry-stage-active');
    copy.inert = true;
    return true;
  }
  function clearMobileStage() {
    clearTimeout(copyTimer);
    mobileStage = false;
    copy.inert = originalCopyInert;
    hero.classList.remove('entry-stage-active','entry-copy-ready');
    for (const key of stageProperties) hero.style.removeProperty(key);
  }
  function fitShell() {
    const shell = document.querySelector('.site-top-r48')?.closest('.site-shell');
    if (shell) hero.style.setProperty('--entry-shell-height', `${Math.ceil(shell.getBoundingClientRect().height)}px`);
    // Preserve the original reading-layout anchor. During the mobile opening,
    // entry-stage-active instead uses the shared independent-stage geometry.
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
    // Four ordinary rectangles leave an actual unpainted doorway. No SVG URL
    // mask can fall back to a solid wall over the door, hardware and logo.
    const clamp = (n,max) => Math.max(0,Math.min(n,max));
    const l = clamp(left,h.width), r = clamp(left + width,h.width);
    const t = clamp(top,h.height), bottom = clamp(top + height,h.height);
    const rectangles = [
      {left:0,top:0,width:h.width,height:t},
      {left:0,top:0,width:l,height:h.height},
      {left:r,top:0,width:h.width-r,height:h.height},
      {left:l,top:bottom,width:r-l,height:h.height-bottom}
    ];
    wallPanels.forEach((panel,index) => {
      const rect = rectangles[index];
      for (const [key,value] of Object.entries(rect)) panel.style[key] = `${value.toFixed(3)}px`;
      panel.style.backgroundSize = `${(h.width * 3).toFixed(3)}px ${h.height.toFixed(3)}px`;
      panel.style.backgroundPosition = `${(-rect.left).toFixed(3)}px ${(-rect.top).toFixed(3)}px`;
    });
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
    clearTimeout(prepareTimer);
    clearTimeout(loadingTimer);
    preloader.hidden = true;
    hero.setAttribute('aria-busy','false');
    unlock();
    clearMobileStage();
    hero.classList.remove('cinema-playing', 'cinema-loading', 'entry-prepaint');
    hero.classList.add('cinema-settled');
    setState('settled', reason);
    if (announce) status.textContent = '開場完成，可以往下閱讀。';
  }
  function decodeImage(image) {
    if (typeof image.decode === 'function') return image.decode();
    if (image.complete) return image.naturalWidth ? Promise.resolve() : Promise.reject(new Error('image-missing'));
    return new Promise((resolve,reject) => {
      image.addEventListener('load',resolve,{once:true});
      image.addEventListener('error',reject,{once:true});
    });
  }
  const nextPaint = () => new Promise(resolve => requestAnimationFrame(resolve));
  function surfaceReady() {
    const wall = getComputedStyle(hero.querySelector('.entry-wall'));
    return wall.backgroundImage === 'none' && wall.maskImage === 'none' &&
      getComputedStyle(wallPanels[0]).position === 'absolute' &&
      getComputedStyle(hero.querySelector('.entry-portal img')).clipPath.startsWith('polygon(');
  }
  async function start() {
    if (state === 'playing' || state === 'preparing') return;
    if (!isVisible()) { settle('not-visible'); return; }
    autoAttempted = true;
    if (reduced.matches) { settle('reduced-motion'); status.textContent = '已呈現靜態空間意象。'; return; }
    if (!surfaceReady()) { settle('surface-fallback'); status.textContent = '已呈現完整閱讀畫面。'; return; }
    const ticket = ++runId;
    setState('preparing');
    hero.classList.add('cinema-loading');
    hero.setAttribute('aria-busy','true');
    copy.inert = true;
    fitShell();
    status.textContent = '正在準備開場空間。';
    // Cached assets start immediately, without flashing a fake loading screen.
    loadingTimer = setTimeout(() => {
      if (ticket === runId && state === 'preparing') preloader.hidden = false;
    },160);
    // This guard also covers image decode or a stalled paint opportunity.
    prepareTimer = setTimeout(() => {
      if (ticket === runId && state === 'preparing') {
        settle('image-timeout');
        status.textContent = '已呈現完整閱讀畫面。';
      }
    },3000);
    try {
      await Promise.all(criticalImages.map(decodeImage));
      if (ticket !== runId) return;
      if (criticalImages.some(image => !image.complete || !image.naturalWidth) || !isVisible() || reduced.matches) { settle('preparation-changed'); return; }
      if (!prepareMobileStage()) { settle('short-viewport'); return; }
      fitShell();
      hero.classList.add('entry-prepaint');
      await nextPaint();
      await nextPaint();
      if (ticket !== runId) return;
      if (!isVisible() || reduced.matches) { settle('preparation-changed'); return; }
      clearTimeout(prepareTimer);
      clearTimeout(loadingTimer);
      preloader.hidden = true;
      hero.setAttribute('aria-busy','false');
      hero.classList.remove('cinema-loading', 'cinema-settled', 'cinema-playing', 'entry-prepaint');
      void hero.offsetWidth;
      // Time-based release is independent of CSS animation completion.
      releaseTimer = setTimeout(() => settle('complete', true), 5600);
      scrollLock = {root:document.documentElement.style.overflow, body:document.body.style.overflow};
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      document.documentElement.classList.add('cinema-locked');
      setState('playing', 'page-entry');
      hero.classList.add('cinema-playing');
      if (mobileStage) copyTimer = setTimeout(() => {
        if (ticket !== runId || state !== 'playing') return;
        copy.inert = originalCopyInert;
        hero.classList.add('entry-copy-ready');
      }, 3850);
      status.textContent = '開場動畫播放中。';
    } catch (_) {
      if (ticket === runId) {
        settle('image-fallback');
        status.textContent = '已呈現完整閱讀畫面。';
      }
    }
  }
  next.addEventListener('click', () => settle('read-next'));
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && (state === 'playing' || state === 'preparing')) settle('hidden');
    else maybeStart();
  });
  window.addEventListener('pagehide', () => {
    pageEntered = false;
    settle('pagehide');
    history.scrollRestoration = originalRestoration;
  });
  window.addEventListener('pageshow', event => {
    // The first entry starts as soon as this end-of-body script runs, while
    // images can still be downloading. Do not restart it on initial pageshow.
    if (event.persisted || !pageEntered) enterPage();
  });
  reduced.addEventListener('change', event => { if (event.matches) settle('reduced-motion'); });
  function maybeStart() {
    if (!pageEntered) return;
    if ((state === 'playing' || state === 'preparing') && !isVisible()) settle('left-view');
    else if (!autoAttempted && state === 'waiting' && isVisible()) start();
  }
  window.addEventListener('resize', () => {
    const widthChanged = Math.abs(innerWidth - viewportWidth) > 1;
    const heightChanged = Math.abs(innerHeight - viewportHeight) > 1;
    viewportWidth = innerWidth;
    viewportHeight = innerHeight;
    // iOS browser chrome changes height without changing document width.
    // Keep the initial stage and aperture fixed through this short animation;
    // the independent timer still releases input. Width/rotation still exits.
    if (mobileStage && !widthChanged && (state === 'playing' || state === 'preparing')) return;
    if (!widthChanged && state === 'preparing' && matchMedia('(max-width: 760px)').matches) {
      fitShell();
      return;
    }
    if ((widthChanged || heightChanged) && (state === 'playing' || state === 'preparing')) settle('viewport-changed');
    fitShell();
    maybeStart();
  }, {passive:true});
  window.addEventListener('orientationchange', () => {
    if (state === 'playing' || state === 'preparing') settle('orientation-changed');
    fitShell();
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
  enterPage();
})();
