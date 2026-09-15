(()=>{
 const frame=document.getElementById('treatment-banner'),root=document.documentElement;
 let locked=false,scroll=0,timer=0;
 function notify(type,detail){const w=frame.contentWindow;w.dispatchEvent(new w.CustomEvent(type,{detail}));}
 function measure(){
  root.classList.remove('intro-locked');
  window.scrollTo(0,scroll);
  const r=frame.getBoundingClientRect(),style=getComputedStyle(frame);
  const width=frame.contentWindow.innerWidth,left=r.left+parseFloat(style.borderLeftWidth),top=r.top+parseFloat(style.borderTopWidth);
  root.style.setProperty('--landing-width',width+'px');
  root.style.setProperty('--landing-left',left+'px');
  root.style.setProperty('--intro-scroll-top',-scroll+'px');
  root.classList.add('intro-locked');
  notify('m19-layout',{top,width,height:window.innerHeight});
 }
 function unlock(){
  root.style.removeProperty('--intro-backdrop');
  if(locked){locked=false;clearTimeout(timer);root.classList.remove('intro-locked');root.style.removeProperty('--intro-scroll-top');window.scrollTo(0,scroll);}
  notify('m19-layout-restored');
 }
 function cancel(){frame.contentWindow.postMessage({type:'m19-intro-cancel'},'*');}
 window.addEventListener('message',e=>{
  if(e.source!==frame.contentWindow||!e.data)return;
  if(e.data.type==='m19-intro-start'){
   if(locked)return;root.style.setProperty('--intro-backdrop','#000');scroll=window.scrollY;locked=true;measure();timer=setTimeout(cancel,18000);
  }else if(e.data.type==='m19-intro-end')unlock();
  else if(e.data.type==='m19-banner-height'){
   const h=Number(e.data.height);if(Number.isFinite(h)&&h>=300&&h<=3000)frame.style.height=Math.ceil(h)+'px';
  }
 });
 window.addEventListener('m19-backdrop',e=>{
  if(!locked||e.detail?.source!==frame.contentWindow)return;
  const t=e.detail.reveal;if(!Number.isFinite(t)||t<0||t>1)return;
  root.style.setProperty('--intro-backdrop',`rgb(${248*t} ${250*t} ${247*t})`);
 });
 window.addEventListener('resize',()=>{if(locked)measure();});
 document.addEventListener('keydown',e=>{if(locked&&e.key==='Escape')cancel();});
 window.addEventListener('pagehide',()=>{if(locked)unlock();});
})();

