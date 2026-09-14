(() => {
  const el=document.querySelector('.cinema-r62');
  if(!el)return;
  const canvas=el.querySelector('canvas'),ctx=canvas.getContext('2d');
  if(!ctx)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let w=1,h=1,raf=0,visible=false,entranceStart=null;
  // Pixel-boundary vector trace of the supplied source; same paths as clinic-logo-outline-r71.svg.
  const definitions=["M415 17 L654 17 L452 265 L799 267 L811 270 L821 276 L829 286 L832 293 L834 314 L831 324 L826 332 L817 341 L806 357 L778 389 L754 421 L743 432 L723 459 L714 468 L709 477 L701 485 L669 529 L663 540 L660 542 L627 592 L597 632 L590 640 L580 644 L565 647 L312 647 L459 450 L532 359 L537 346 L536 326 L529 312 L520 303 L513 299 L496 295 L445 295 L428 298 L422 301 L412 310 L393 338 L388 342 L384 349 L379 353 L375 360 L370 364 L302 449 L32 446 L65 407 L69 400 L74 396 L78 389 L83 385 L87 378 L92 374 L96 367 L101 363 L105 356 L110 352 L114 345 L119 341 L123 334 L128 330 L132 323 L142 313 L146 306 L151 302 L168 279 L173 275 L177 268 L182 264 L186 257 L196 247 L213 224 L232 203 L236 196 L241 192 L245 185 L250 181 L254 174 L260 169 L268 157 L287 136 L291 129 L310 108 L314 101 L320 96 L357 49 L373 32 L373 30 L387 18 L415 17 Z", "M764 165 L799 166 L830 173 L857 185 L882 202 L902 222 L918 245 L933 281 L938 307 L938 342 L933 368 L920 400 L901 428 L881 448 L858 464 L838 474 L820 480 L791 485 L766 485 L743 482 L719 475 L714 473 L713 470 L718 466 L787 379 L827 332 L835 314 L835 301 L827 282 L818 273 L807 268 L797 266 L626 265 L643 232 L657 217 L657 215 L680 195 L694 186 L720 174 L738 169 L764 165 Z"];
  const contours=definitions.map(d=>{
    const p=document.createElementNS('http://www.w3.org/2000/svg','path');p.setAttribute('d',d);
    const length=p.getTotalLength();
    return Array.from({length:361},(_,i)=>{const q=p.getPointAtLength(length*i/360);return{x:q.x,y:q.y};});
  });
  function draw(ms){
    const t=reduced.matches?0:ms/1000,mobile=innerWidth<=760;
    const elapsed=reduced.matches?99:(entranceStart===null?0:Math.max(0,(ms-entranceStart)/1000));
    ctx.clearRect(0,0,w,h);
    // Large, subdued emblem: enough extends beyond shoulders to remain recognisable.
    const people=el.querySelector('.cinema-people');
    // Layout offsets ignore the portrait's entrance transform and page scrolling.
    let px=0,py=0,node=people;
    while(node && node!==el){px+=node.offsetLeft;py+=node.offsetTop;node=node.offsetParent;}
    let ax=0,ay=0,art=canvas;
    while(art && art!==el){ax+=art.offsetLeft;ay+=art.offsetTop;art=art.offsetParent;}
    const scale=mobile?Math.min(people.clientWidth*.98/907,people.clientHeight*.85/630):Math.min(w*.47/907,h*.76/630);
    const cx=mobile?px+people.clientWidth/2:px+people.clientWidth/2-ax;
    const cy=mobile?py+people.clientHeight*.50:py+people.clientHeight*.46-ay;
    const pos=p=>({x:cx+(p.x-485)*scale,y:cy+(p.y-332)*scale});
    const halo=ctx.createRadialGradient(cx,cy,0,cx,cy,scale*580);
    halo.addColorStop(0,'rgba(177,157,96,.075)');halo.addColorStop(1,'rgba(177,157,96,0)');
    ctx.fillStyle=halo;ctx.fillRect(0,0,w,h);
    contours.forEach((points,k)=>{
      const progress=Math.min(1,Math.max(0,(elapsed-k*.18)/1.55));
      const tip=progress*360,last=Math.floor(tip);
      ctx.beginPath();
      for(let i=0;i<=last;i++){const q=pos(points[i]);i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y);}
      if(last<360){const a=points[last],b=points[last+1],f=tip-last;const q=pos({x:a.x+(b.x-a.x)*f,y:a.y+(b.y-a.y)*f});ctx.lineTo(q.x,q.y);}
      if(progress===1){ctx.closePath();ctx.fillStyle='rgba(206,180,116,.018)';ctx.fill();}
      ctx.strokeStyle=`rgba(219,191,127,${k===0?.46:.38})`;ctx.lineWidth=mobile?.9:1.25;ctx.stroke();
      if(progress>0 && progress<1){const q=pos(points[last]);ctx.shadowColor='#f0d49c';ctx.shadowBlur=10;ctx.fillStyle='rgba(255,238,191,.75)';ctx.beginPath();ctx.arc(q.x,q.y,1.4,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;}
      // Distant pinpoints sit on the outline; no random full-screen star field.
      for(let i=12;i<360*progress;i+=36){
        const q=pos(points[i]);const a=.18+.27*(.5+.5*Math.sin(t*.55+i*.19+k))**3;
        const r=mobile?4:6;
        const glow=ctx.createRadialGradient(q.x,q.y,0,q.x,q.y,r);
        glow.addColorStop(0,`rgba(255,232,178,${a})`);glow.addColorStop(1,'rgba(239,200,120,0)');
        ctx.fillStyle=glow;ctx.fillRect(q.x-r,q.y-r,r*2,r*2);
        ctx.fillStyle=`rgba(255,239,196,${a+.08})`;ctx.beginPath();ctx.arc(q.x,q.y,.65,0,Math.PI*2);ctx.fill();
      }
      if(!reduced.matches && elapsed>=2.7){
        // Three moving highlights per contour (two on mobile), at about twice the previous speed.
        for(let segment=0;segment<(mobile?2:3);segment++){
          const head=((elapsed-2.7)*(k===0?.055:.075)+segment/3+k*.17)%1;
          for(let j=0;j<28;j++){
            const index=Math.floor(((head-j/720+1)%1)*360),q=pos(points[index]),next=pos(points[(index+1)%360]);
            ctx.beginPath();ctx.moveTo(q.x,q.y);ctx.lineTo(next.x,next.y);
            ctx.strokeStyle=`rgba(255,234,179,${.72*(1-j/28)*Math.min(1,(elapsed-2.7)/.6)})`;
            ctx.lineWidth=1.65;ctx.shadowBlur=10;ctx.shadowColor='#ddbb74';ctx.stroke();
          }
        }
        ctx.shadowBlur=0;
      }
    });
    // The emblem is positioned behind the portraits; do not erase its left contour.
    if(visible&&!document.hidden&&!reduced.matches)raf=requestAnimationFrame(draw);
  }
  function size(){cancelAnimationFrame(raf);w=canvas.clientWidth;h=canvas.clientHeight;const d=Math.min(devicePixelRatio||1,1.5);canvas.width=w*d;canvas.height=h*d;ctx.setTransform(d,0,0,d,0,0);draw(performance.now());}
  function run(){cancelAnimationFrame(raf);if(visible&&!document.hidden)draw(performance.now());}
  if(!reduced.matches)el.classList.add('motion-ready');
  if('IntersectionObserver'in window)new IntersectionObserver(es=>{visible=es[0].isIntersecting;if(visible){if(entranceStart===null)entranceStart=performance.now();el.classList.add('entered');}run();},{threshold:.1}).observe(el);
  else{visible=true;entranceStart=performance.now();el.classList.add('entered');}
  const ro=new ResizeObserver(size);ro.observe(canvas);ro.observe(el.querySelector('.cinema-people'));ro.observe(el.querySelector('.cta-r14__inner'));document.addEventListener('visibilitychange',run);
  reduced.addEventListener('change',()=>{el.classList.add('entered');run();});size();run();
})();
