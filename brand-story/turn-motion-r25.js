/* Five-second story beat, with no skip control or Escape completion handler. */
(() => {
  'use strict';
  const section=document.querySelector('.turn-chapter');
  const story=section?.querySelector('.turn-story'),status=section?.querySelector('.turn-status');
  if(!story||!status||!('IntersectionObserver' in window))return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)'),touch=matchMedia('(hover: none), (pointer: coarse)');
  let state='waiting',inside=false,visible=false,timer=null,candidateTimer=null,lock=false,lastY=0,startedAt=0;
  const listeners=[];
  const listen=(target,name,fn,opts)=>{target.addEventListener(name,fn,opts);listeners.push(()=>target.removeEventListener(name,fn,opts))};
  const letters=[];
  function prepare(){
    const walker=document.createTreeWalker(story,NodeFilter.SHOW_TEXT),nodes=[];
    while(walker.nextNode())nodes.push(walker.currentNode);
    for(const node of nodes){
      const fragment=document.createDocumentFragment();
      for(const letter of Array.from(node.textContent)){
        const span=document.createElement('span');span.className='turn-letter';span.textContent=letter;letters.push(span);fragment.append(span);
      }
      node.replaceWith(fragment);
    }
    letters.forEach((letter,i)=>letter.style.setProperty('--letter-delay',`${Math.round(i*3900/Math.max(1,letters.length-1))}ms`));
  }
  function clearInput(){while(listeners.length)listeners.pop()();lock=false;}
  function finish(reason){
    if(state!=='playing')return;
    clearTimeout(timer);clearTimeout(candidateTimer);clearInput();state='done';section.dataset.turnState='done';section.dataset.turnReason=reason;
    section.classList.remove('turn-playing');observer.disconnect();
    status.textContent=reason==='complete'?'這段故事已呈現完畢，可以繼續往下閱讀。':'';
  }
  function start(){
    if(state!=='waiting'||reduced.matches||document.hidden||document.documentElement.classList.contains('cinema-locked'))return;
    prepare();state='playing';section.dataset.turnState='playing';section.dataset.turnReason=touch.matches?'in-view':'pointer-enter';
    section.classList.add('turn-playing');lastY=scrollY;startedAt=performance.now();
    status.textContent='文字與金色線條將呈現約五秒。';
    lock=true;
    listen(window,'wheel',event=>{if(event.ctrlKey){finish('zoom');return}event.preventDefault()},{passive:false});
    listen(window,'touchmove',event=>{if(event.touches.length>1){finish('zoom');return}event.preventDefault()},{passive:false});
    listen(document,'keydown',event=>{
      if(event.target.closest?.('button,input,textarea,select,a,[contenteditable="true"]'))return;
      if(['ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' '].includes(event.key))event.preventDefault();
    });
    // Independent timeout releases input even if drawing or floating is interrupted.
    timer=setTimeout(()=>finish('complete'),5000);
  }
  function readable(){
    const r=story.getBoundingClientRect(),s=section.getBoundingClientRect();
    return r.top>=12&&r.bottom<=innerHeight-24&&s.bottom<=innerHeight+8;
  }
  function maybeStart(){
    if(state!=='waiting')return;
    clearTimeout(candidateTimer);
    if(visible&&(inside||touch.matches)&&readable())candidateTimer=setTimeout(()=>{
      if(state==='waiting'&&visible&&(inside||touch.matches)&&readable())start();
    },120);
  }
  const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;maybeStart()},{threshold:0});observer.observe(section);
  section.addEventListener('pointerenter',()=>{inside=true;maybeStart()});section.addEventListener('pointerleave',()=>{inside=false});
  section.addEventListener('focusin',()=>{inside=true;maybeStart()});
  addEventListener('scroll',()=>{
    if(lock&&performance.now()-startedAt<180){lastY=scrollY;return}
    if(lock&&Math.abs(scrollY-lastY)>4)finish('user-scroll');else maybeStart();
  },{passive:true});
  addEventListener('resize',()=>{finish('resize');maybeStart()});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)finish('hidden')});
  addEventListener('pagehide',()=>{clearTimeout(candidateTimer);finish('pagehide');observer.disconnect()});
  reduced.addEventListener('change',()=>{if(reduced.matches)finish('reduced-motion')});
  section.dataset.turnState='waiting';
})();
