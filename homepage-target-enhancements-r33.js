'use strict';
(() => {
 const copy=document.getElementById('announcement-copy');
 const messages=['test 123','test 234','test 345'], reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let index=0,timer,paused=reduced.matches,animation;
 
 const label=()=>{copy.textContent=reduced.matches?messages.join(' ｜ '):messages[index];};
 const schedule=()=>{clearTimeout(timer);if(!paused&&!document.hidden)timer=setTimeout(next,5000);};
 async function next(){
  if(paused||document.hidden)return;
  if(!reduced.matches){animation=copy.animate([{transform:'translateX(0)',opacity:1},{transform:'translateX(-100%)',opacity:0}],{duration:180});try{await animation.finished;}catch{return;}}
  if(paused||document.hidden)return;
  index=(index+1)%messages.length;copy.textContent=messages[index];
  if(!reduced.matches){animation=copy.animate([{transform:'translateX(100%)',opacity:0},{transform:'translateX(0)',opacity:1}],{duration:180});try{await animation.finished;}catch{return;}}
  schedule();
 }
 document.addEventListener('visibilitychange',()=>{clearTimeout(timer);animation?.cancel();if(!document.hidden)schedule();});
 reduced.addEventListener('change',()=>{paused=reduced.matches;animation?.cancel();label();schedule();});
 label();schedule();
 const track=document.querySelector('.reviews-track-r31'),controls=document.querySelector('.review-controls-r31');
 const [prev,nextButton]=controls.querySelectorAll('button');
 const update=()=>{prev.disabled=track.scrollLeft<2;nextButton.disabled=track.scrollLeft+track.clientWidth>=track.scrollWidth-2;};
 const move=direction=>track.scrollBy({left:direction*(track.querySelector('article').getBoundingClientRect().width+(parseFloat(getComputedStyle(track).columnGap)||0)),behavior:reduced.matches?'auto':'smooth'});
 prev.addEventListener('click',()=>move(-1));nextButton.addEventListener('click',()=>move(1));
 track.addEventListener('keydown',e=>{if(e.target===track&&['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();move(e.key==='ArrowLeft'?-1:1);}});
 track.addEventListener('scroll',update,{passive:true});window.addEventListener('resize',update);
 controls.hidden=false;update();
})();