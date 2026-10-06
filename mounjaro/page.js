(() => {
 const shell=document.querySelector('.site-top-r48');
 function measure(){document.documentElement.style.setProperty('--fixed-height',(shell? shell.getBoundingClientRect().height:0)+'px')}
 if(shell)new ResizeObserver(measure).observe(shell);measure();
 document.querySelectorAll('.jump a').forEach(a=>a.addEventListener('click',()=>{const t=document.querySelector(a.getAttribute('href'));if(t)t.focus({preventScroll:true})}));
})();
// Reveal right-top, right-middle, right-bottom in a single bounded reading sequence.
(() => {
 const flow=document.querySelector('.efficacy-flow');if(!flow)return;
 const cards=[...flow.querySelectorAll('.efficacy-card')],reduce=matchMedia('(prefers-reduced-motion: reduce)');
 if(reduce.matches||!('IntersectionObserver' in window))return;
 let started=false;const timers=[];flow.classList.add('pairs-ready');
 function showAll(){timers.forEach(clearTimeout);cards.forEach(c=>c.classList.add('is-reached'));flow.classList.remove('pairs-ready')}
 const o=new IntersectionObserver(entries=>{
  if(started||!entries.some(e=>e.isIntersecting))return;
  started=true;o.disconnect();cards.forEach((card,i)=>timers.push(setTimeout(()=>card.classList.add('is-reached'),i*850)));
 },{threshold:.12,rootMargin:'0px 0px -18% 0px'});
 o.observe(flow);
 reduce.addEventListener('change',e=>{if(e.matches){o.disconnect();showAll()}});
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&started)showAll()});
})();
// Bounded decorative reveal; source content remains visible without JavaScript.
(()=>{if(matchMedia('(prefers-reduced-motion: reduce)').matches||!('IntersectionObserver' in window))return;const cards=document.querySelectorAll('.symptom-card');const o=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.remove('reveal-pending');o.unobserve(e.target)}}),{threshold:.12});cards.forEach(e=>{e.classList.add('reveal-pending');o.observe(e)})})();
