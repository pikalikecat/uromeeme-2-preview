(() => {
 const copy=document.querySelector('#announcement-copy'),button=document.querySelector('#ticker-pause');if(!copy)return;
 // Exact messages from the saved homepage; their currency remains unverified.
 const messages=['📢  歡迎肛門直腸外科 周杰倫 醫師加入津久診所醫療團隊💯','📢  寒假期間，本院手術量較大，請盡早預約😇','📢  本院正在招募GG增大手術素人，歡迎加入官方 LINE 諮詢'];
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),area=copy.closest('.announcement');
 const sizing=document.createElement('div');sizing.className='announcement-sizing';sizing.setAttribute('aria-hidden','true');
 messages.forEach(text=>{const span=document.createElement('span');span.textContent=text;sizing.append(span)});copy.parentElement.append(sizing);
 let index=0,timer,animation,paused=false,hover=false;
 const stopped=()=>paused||hover||area.contains(document.activeElement)||reduced.matches||document.hidden;
 function schedule(){clearTimeout(timer);if(!stopped())timer=setTimeout(next,5000)}
 async function next(){if(stopped())return;try{
  animation=copy.animate([{transform:'translateX(0)',opacity:1},{transform:'translateX(-100%)',opacity:0}],{duration:180});await animation.finished;
  if(stopped())return;index=(index+1)%messages.length;copy.textContent=messages[index];
  animation=copy.animate([{transform:'translateX(100%)',opacity:0},{transform:'translateX(0)',opacity:1}],{duration:180});await animation.finished;schedule();
 }catch{}}
 function sync(){clearTimeout(timer);animation?.cancel();copy.textContent=reduced.matches?messages.join(' ｜ '):messages[index];button.disabled=reduced.matches;button.setAttribute('aria-pressed',String(paused));button.textContent=reduced.matches?'公告已靜止':paused?'繼續跑馬燈':'暫停跑馬燈';schedule()}
 button.addEventListener('click',()=>{paused=!paused;sync()});area.addEventListener('mouseenter',()=>{hover=true;sync()});area.addEventListener('mouseleave',()=>{hover=false;sync()});area.addEventListener('focusin',sync);area.addEventListener('focusout',()=>setTimeout(sync,0));document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',sync);sync();
})();
