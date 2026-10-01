// Existing local header markup; no remote requests, timers, storage or tracking.
(() => {
 const shell=document.querySelector('.site-shell'),top=shell?.querySelector('.site-top-r48');
 if(!top)return;
 const root=document.documentElement,menu=shell.querySelector('details.menu');
 const windowEl=shell.querySelector('.announcement-window'),copy=shell.querySelector('#announcement-copy'),pause=shell.querySelector('#ticker-pause');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');let paused=false,scheduled=false;
 function measure(){
  scheduled=false;
  const nav=shell.querySelector('.production-nav');
  if(nav.offsetWidth && (nav.scrollWidth>nav.clientWidth+2 || top.scrollWidth>top.clientWidth+2))shell.classList.add('nav-compact');
  const height=Math.ceil(top.getBoundingClientRect().height),tall=height>innerHeight*.4;
  shell.classList.toggle('header-tall',tall);
  root.style.setProperty('--m19-sticky-height',height+'px');
  root.style.setProperty('--female-header-height',(tall?0:height)+'px');
  shell.style.setProperty('--ticker-window',windowEl.clientWidth+'px');
  shell.style.setProperty('--ticker-text',copy.scrollWidth+'px');
 }
 const schedule=()=>{if(!scheduled){scheduled=true;requestAnimationFrame(measure)}};
 shell.querySelectorAll('details').forEach(detail=>detail.addEventListener('keydown',event=>{if(event.key==='Escape'&&detail.open){event.preventDefault();event.stopPropagation();detail.open=false;detail.querySelector(':scope > summary')?.focus()}}));
 menu?.addEventListener('click',event=>{if(event.target.closest('a[href]'))menu.open=false});
 addEventListener('resize',()=>{shell.classList.remove('nav-compact');if(innerWidth>1280&&menu)menu.open=false;schedule()},{passive:true});
 if('ResizeObserver' in window){const observer=new ResizeObserver(schedule);observer.observe(top);observer.observe(copy)}
 shell.classList.add('ticker-ready');root.classList.add('header-ready');measure();document.fonts?.ready.then(schedule);
})();
