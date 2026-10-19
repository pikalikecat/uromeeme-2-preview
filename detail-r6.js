'use strict';
(() => {
  const link = document.querySelector('.faq-contact-r104 a');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const ripple = (x,y) => {
    if (reduced.matches) return;
    link.querySelector('.line-ripple-r6')?.remove();
    const rect = link.getBoundingClientRect(), dot = document.createElement('span');
    dot.className = 'line-ripple-r6'; dot.setAttribute('aria-hidden','true');
    dot.style.setProperty('--ripple-x',`${x ?? rect.width/2}px`);
    dot.style.setProperty('--ripple-y',`${y ?? rect.height/2}px`);
    link.append(dot);
    dot.addEventListener('animationend',()=>dot.remove(),{once:true});
    setTimeout(()=>dot.remove(),750);
  };
  link.addEventListener('pointerdown',e=>{const r=link.getBoundingClientRect();ripple(e.clientX-r.left,e.clientY-r.top);});
  link.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.repeat)ripple();});
})();
