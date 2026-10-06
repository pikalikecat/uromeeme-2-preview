(()=>{const stage=document.querySelector('#stage'),button=document.querySelector('#motion'),reduce=matchMedia('(prefers-reduced-motion: reduce)');let paused=false;function sync(){stage.dataset.paused=String(paused||reduce.matches||document.hidden);if(button)button.disabled=reduce.matches;button?.setAttribute('aria-pressed',String(paused||reduce.matches));if(button)button.textContent=reduce.matches?'已依系統減少動態':paused?'播放微光':'暫停微光'}button?.addEventListener('click',()=>{paused=!paused;sync()});reduce.addEventListener('change',sync);document.addEventListener('visibilitychange',sync);sync();
const shell=document.querySelector('.site-shell'),top=shell.querySelector('.site-top-r48'),root=document.documentElement;function measure(){const nav=shell.querySelector('.production-nav');if(nav.offsetWidth&&(nav.scrollWidth>nav.clientWidth+2||top.scrollWidth>top.clientWidth+2))shell.classList.add('nav-compact');const height=Math.ceil(top.getBoundingClientRect().height),tall=height>innerHeight*.4;shell.classList.toggle('header-tall',tall);root.style.setProperty('--m19-sticky-height',height+'px');root.style.setProperty('--female-header-height',(tall?0:height)+'px')}let pending=false;function schedule(){if(!pending){pending=true;requestAnimationFrame(()=>{pending=false;measure()})}}shell.querySelectorAll('details').forEach(d=>d.addEventListener('keydown',e=>{if(e.key==='Escape'&&d.open){e.preventDefault();d.open=false;d.querySelector('summary')?.focus()}}));addEventListener('resize',()=>{shell.classList.remove('nav-compact');schedule()});if('ResizeObserver'in window)new ResizeObserver(schedule).observe(top);root.classList.add('header-ready');measure();document.fonts?.ready.then(schedule);})();
// Treatment timeline only; no original content is removed or aria-hidden.
(()=>{
 const track=document.querySelector('.care-steps');if(!track)return;
 const cards=[...track.children],reduce=matchMedia('(prefers-reduced-motion: reduce)');let queued=false;
 function update(){
  queued=false;const line=innerHeight*.78;let current=-1;
  track.classList.toggle('care-motion',!reduce.matches);
  cards.forEach((card,i)=>{if(card.getBoundingClientRect().top<line){card.classList.add('care-entered');current=i}});
  cards.forEach((card,i)=>card.classList.toggle('care-current',i===current));
  const end=cards.at(-1).offsetTop;track.style.setProperty('--care-track',end+'px');track.style.setProperty('--care-fill',(current<0?0:cards[current].offsetTop)+'px');
 }
 function schedule(){if(!queued){queued=true;requestAnimationFrame(update)}}
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);reduce.addEventListener('change',update);track.addEventListener('focusin',e=>e.target.closest('article')?.classList.add('care-entered'));update();
})();


