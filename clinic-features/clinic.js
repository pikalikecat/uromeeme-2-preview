(() => {
 'use strict';
 const year=document.getElementById('copyright-year-r92');
 if(year)year.textContent=new Intl.DateTimeFormat('en',{year:'numeric',timeZone:'Asia/Taipei'}).format(new Date());
 const motion=matchMedia('(prefers-reduced-motion: reduce)');
 if(!('IntersectionObserver' in window))return;
 const observer=new IntersectionObserver(entries=>{
  for(const e of entries)if(e.isIntersecting){if(!motion.matches)e.target.classList.add('cf-arriving');observer.unobserve(e.target);}
 },{threshold:.08});
 document.querySelectorAll('.cf-chapter').forEach(e=>observer.observe(e));
 motion.addEventListener('change',()=>{if(motion.matches)document.querySelectorAll('.cf-arriving').forEach(e=>e.classList.remove('cf-arriving'));});
 addEventListener('pagehide',()=>observer.disconnect(),{once:true});
})();
