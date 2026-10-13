/* Static copy remains available without JS. Each card decorates once when seen. */
(() => {
  if(matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  const cards=[...document.querySelectorAll('.care-card')];
  let stagger=0, resetTimer;
  const observer=new IntersectionObserver(entries=>{
    for(const entry of entries){
      if(!entry.isIntersecting || entry.target.classList.contains('care-arriving')) continue;
      // Stagger cards seen together, but never delay a mobile card by its list index.
      entry.target.style.setProperty('--card-delay',`${Math.min(stagger++,2)*120}ms`);
      entry.target.classList.add('care-arriving');
      observer.unobserve(entry.target);
    }
    clearTimeout(resetTimer);resetTimer=setTimeout(()=>{stagger=0},350);
  },{threshold:0,rootMargin:'0px 0px -64px 0px'});
  cards.forEach(card=>observer.observe(card));
  addEventListener('pagehide',()=>{observer.disconnect();clearTimeout(resetTimer)},{once:true});
})();
