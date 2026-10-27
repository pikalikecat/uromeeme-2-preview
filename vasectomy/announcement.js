'use strict';
// Keep R72 timing without a visible control; hover/focus, lifecycle and reduced motion still pause.
(() => {
 const notices=document.querySelector('.home-announcement');
 if(!notices)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),items=[...notices.querySelectorAll('li')];
 let index=0,timer,suspended=false;
 function render(animate=false){
  notices.classList.toggle('home-all-notices',reduced.matches);
  items.forEach((item,i)=>{const inactive=!reduced.matches&&i!==index;item.hidden=inactive;item.inert=inactive;item.classList.toggle('notice-enter-r24',animate&&!inactive&&!reduced.matches)});
 }
 function schedule(delay=6000){
  clearTimeout(timer);
  if(reduced.matches||document.hidden||suspended||notices.inert||notices.matches(':hover,:focus-within'))return;
  timer=setTimeout(()=>{index=(index+1)%items.length;render(true);schedule(6180)},delay);
 }
 ['mouseenter','focusin'].forEach(name=>notices.addEventListener(name,()=>clearTimeout(timer)));
 ['mouseleave','focusout'].forEach(name=>notices.addEventListener(name,()=>setTimeout(()=>schedule(),0)));
 document.addEventListener('visibilitychange',()=>schedule());
 reduced.addEventListener('change',()=>{render();schedule()});
 const menu=document.querySelector('.home-menu');
 menu.addEventListener('toggle',()=>{notices.inert=menu.open;schedule()});
 addEventListener('pagehide',()=>{suspended=true;clearTimeout(timer)});
 addEventListener('pageshow',()=>{suspended=false;notices.inert=menu.open;render();schedule()});
 render();schedule();
})();
