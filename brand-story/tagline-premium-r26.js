/* Decorative, once-per-visit reveal. No scroll interception or added controls. */
(() => {
  const stage=document.querySelector('.tagline-stage');
  if(!stage || !('IntersectionObserver' in window)) return;
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  if(motion.matches) return;
  const observer=new IntersectionObserver(entries=>{
    if(!entries.some(entry=>entry.isIntersecting)) return;
    stage.classList.add('is-revealed');
    observer.disconnect();
  },{threshold:.2});
  observer.observe(stage);
  addEventListener('pagehide',()=>observer.disconnect(),{once:true});
})();
