/* Idle floating is paused off-screen or in the background; no input interception. */
(() => {
  const section=document.querySelector('.turn-chapter'),art=section?.querySelector('.turn-gold');
  if(!section||!art)return;
  const update=()=>{
    const r=art.getBoundingClientRect();
    section.dataset.artInView=String(!document.hidden&&r.bottom>0&&r.top<innerHeight);
  };
  const observer='IntersectionObserver' in window?new IntersectionObserver(update,{threshold:0}):null;
  observer?.observe(art);
  if(!observer)addEventListener('scroll',update,{passive:true});
  document.addEventListener('visibilitychange',update);
  addEventListener('resize',update,{passive:true});
  addEventListener('pagehide',()=>{section.dataset.artInView='false';observer?.disconnect()});
  addEventListener('pageshow',()=>{observer?.observe(art);update()});
  update();
})();
