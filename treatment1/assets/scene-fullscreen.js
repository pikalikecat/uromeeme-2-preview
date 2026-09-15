(()=>{'use strict';const root=document.body,scene=document.querySelector('.scene'),viewport=scene.querySelector('.viewport'),track=scene.querySelector('.track'),cards=[...track.children],layer=scene.querySelector('.model-layer'),canvas=layer.querySelector('canvas'),black=scene.querySelector('.blackout'),phase=document.querySelector('#phase'),pause=document.querySelector('#pause'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
let ready=false,index=0,intro=false,stopped=false,visible=true,elapsed=0,last=0,raf=0,userInteracted=false,revealTimer=0;let yaw=.25,pitch=.2;
const clamp=t=>Math.max(0,Math.min(1,t)),smooth=t=>{t=clamp(t);return t*t*(3-2*t)},lerp=(a,b,t)=>a+(b-a)*t;
function frame(data){canvas.dispatchEvent(new CustomEvent('device-frame',{detail:data}));}
function target(){
 const c=cards[index],s=c.querySelector(innerWidth<=800?'.mobile-model-slot':'.model-slot');
 const box=s.getBoundingClientRect(),origin=scene.getBoundingClientRect();
 return {x:box.left-origin.left,y:box.top-origin.top,w:box.width,h:box.height};
}function place(r){layer.style.left=r.x+'px';layer.style.top=r.y+'px';layer.style.width=r.w+'px';layer.style.height=r.h+'px';}
function dockScale(r){return Math.min(index===0?.60:.49,r.w/r.h*.34);}
function dock(){const r=target();place(r);frame({yaw,pitch,roll:0,mix:1,scale:dockScale(r)});}
function ambient(){root.classList.toggle('ambient',!stopped&&!reduced.matches&&!intro);}
let layoutReady=false,ending=false,fullHeight=0;
function center(){const c=cards[0];track.style.transform='translateX('+((viewport.clientWidth-c.offsetWidth)/2-c.offsetLeft)+'px)';}
function complete(){
 cancelAnimationFrame(raf);intro=false;ending=false;layoutReady=false;
 root.classList.remove('intro','intro-fullscreen','intro-building');root.style.removeProperty('--landing-top');
 black.style.opacity='0';center();dock();root.classList.add('revealed');
 phase.textContent='雙主治主視覺';clearTimeout(revealTimer);
 revealTimer=setTimeout(()=>{root.classList.remove('revealed');ambient();},2200);
 if(reduced.matches||stopped){root.classList.remove('revealed');ambient();}
}
function finish(){
 if(ending)return;cancelAnimationFrame(raf);
 if(intro&&parent!==window){ending=true;parent.postMessage({type:'m19-intro-end'},'*');}
 else complete();
}
window.addEventListener('m19-layout-restored',complete);
window.addEventListener('m19-layout',e=>{
 root.style.setProperty('--landing-top',e.detail.top+'px');
 fullHeight=e.detail.height;center();layoutReady=true;last=performance.now();
});
function tick(now){
 if(!intro||ending)return;
 const blocked=stopped||document.hidden||!visible||!layoutReady;
 if(!blocked)elapsed+=Math.min(now-last,64);last=now;
 if(!blocked){
  if(elapsed>=5200)root.classList.remove('intro-building');
  // Fixed timeline: build 2s, material 0.7s, hold 2.5s, flight 2s.
  const grow=smooth(elapsed/2000),color=smooth((elapsed-2000)/700),settle=smooth((elapsed-5200)/2000);
  const origin=scene.getBoundingClientRect(),dest=target();
  const full={x:-origin.left,y:-origin.top,w:innerWidth,h:fullHeight||innerHeight};
  const fit=Math.min(full.w/full.h*.34,.84);
  place({x:lerp(full.x,dest.x,settle),y:lerp(full.y,dest.y,settle),w:lerp(full.w,dest.w,settle),h:lerp(full.h,dest.h,settle)});
  frame({yaw:lerp(lerp(1.15,.04,grow),.25,settle),pitch:lerp(lerp(.65,0,grow),.2,settle),roll:lerp(-.85,0,grow),scale:lerp(lerp(.03,fit,grow),dockScale(dest),settle),mix:color});
  const reveal=smooth((elapsed-5200)/1000);
  black.style.opacity=String(1-reveal);
  if(parent!==window)parent.dispatchEvent(new parent.CustomEvent('m19-backdrop',{detail:{source:window,reveal}}));
  scene.dataset.progress=(elapsed/7200).toFixed(3);
  phase.textContent=elapsed<2000?'白線建構・翻轉放大':elapsed<2700?'材質渲染':elapsed<5200?'水平滿版展示':elapsed<7200?'器械縮回定位':'雙主治主視覺';
  if(elapsed>=7200){finish();return;}
 }
 raf=requestAnimationFrame(tick);
}
function start(){
 userInteracted=true;if(!ready||reduced.matches){finish();return;}
 cancelAnimationFrame(raf);clearTimeout(revealTimer);index=0;center();
 root.classList.remove('ambient','revealed');yaw=.25;pitch=.2;
 root.classList.add('intro','intro-fullscreen','intro-building');intro=true;ending=false;elapsed=0;
 layoutReady=parent===window;fullHeight=innerHeight;last=performance.now();
 black.style.opacity='1';phase.textContent='白線建構・翻轉放大';
 if(parent!==window)parent.postMessage({type:'m19-intro-start'},'*');
 raf=requestAnimationFrame(tick);
}
function show(){center();if(!intro){dock();phase.textContent='雙主治主視覺';}}
let resizeFrame=0;
function syncLayout(){cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(()=>{center();if(!intro)dock();});}
new ResizeObserver(syncLayout).observe(cards[0]);
new ResizeObserver(syncLayout).observe(viewport);
document.querySelector('#replay').addEventListener('click',()=>{stopped=false;root.classList.remove('paused');pause.setAttribute('aria-pressed','false');pause.textContent='暫停動態';layer.style.transition='none';start();});document.querySelector('#skip').addEventListener('click',()=>{userInteracted=true;finish();});pause.addEventListener('click',()=>{stopped=!stopped;root.classList.toggle('paused',stopped);pause.setAttribute('aria-pressed',String(stopped));pause.textContent=stopped?'繼續動態':'暫停動態';ambient();});reduced.addEventListener('change',()=>{if(reduced.matches)finish();ambient();});
// Canvas owns rotation gestures; carousel gestures never consume device drag.
let id=null,x=0,y=0;canvas.addEventListener('pointerdown',e=>{if(intro||!ready||id!==null||!e.isPrimary||e.button!==0)return;id=e.pointerId;x=e.clientX;y=e.clientY;canvas.setPointerCapture(id);canvas.classList.add('dragging');canvas.focus({preventScroll:true});});canvas.addEventListener('pointermove',e=>{if(e.pointerId!==id)return;yaw+=(e.clientX-x)*.012;pitch=Math.max(-1.35,Math.min(1.35,pitch+(e.clientY-y)*.009));x=e.clientX;y=e.clientY;frame({yaw,pitch});});function release(e){if(id===null||e&&e.pointerId!==id)return;const n=id;id=null;canvas.classList.remove('dragging');if(canvas.hasPointerCapture(n))canvas.releasePointerCapture(n);}['pointerup','pointercancel','lostpointercapture'].forEach(n=>canvas.addEventListener(n,release));canvas.addEventListener('keydown',e=>{const m={ArrowLeft:[-.12,0],ArrowRight:[.12,0],ArrowUp:[0,-.1],ArrowDown:[0,.1]}[e.key];if(m){e.preventDefault();yaw+=m[0];pitch=Math.max(-1.35,Math.min(1.35,pitch+m[1]));frame({yaw,pitch});}else if(e.key==='Home'){e.preventDefault();yaw=.25;pitch=.2;dock();}});
document.addEventListener('visibilitychange',()=>{last=performance.now();root.classList.toggle('paused',stopped||document.hidden||!visible);if(document.hidden)release();});new IntersectionObserver(e=>{visible=e[0].isIntersecting;last=performance.now();root.classList.toggle('paused',stopped||!visible||document.hidden);}).observe(scene);
window.addEventListener('resize',syncLayout);document.addEventListener('device-ready',async()=>{ready=true;show(0);await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})));if(!userInteracted){layer.style.transition='none';start();}});document.addEventListener('device-error',()=>{ready=false;finish();layer.hidden=true;phase.textContent='模型未載入・顯示靜態主視覺';});show(0);
})();




