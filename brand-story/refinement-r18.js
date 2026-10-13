/* A single, silent highlight of the clinic's core promise; no scroll locking. */
(() => {
  const tagline=document.querySelector('.core-tagline');
  if(!tagline || matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  const observer=new IntersectionObserver(entries=>{
    if(!entries.some(entry=>entry.isIntersecting)) return;
    tagline.classList.add('tagline-arriving');
    observer.disconnect();
  },{threshold:.3});
  observer.observe(tagline);
  addEventListener('pagehide',()=>observer.disconnect(),{once:true});
})();
