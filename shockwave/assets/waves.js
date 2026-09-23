(() => {
 const art=document.querySelector('.visual .art'),img=art.querySelector(':scope > img'),stage=document.querySelector('.vessel-stage'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
 img.decode().then(()=>{
 const w=img.naturalWidth,h=img.naturalHeight,base=document.createElement('canvas');base.width=w;base.height=h;const b=base.getContext('2d',{willReadFrequently:true});b.drawImage(img,0,0);const src=b.getImageData(0,0,w,h),original=new Uint8ClampedArray(src.data),mask=new Uint8Array(w*h);
 for(let y=600;y<h;y++)for(let x=0;x<1150;x++){const n=y*w+x,i=n*4,r=original[i],g=original[i+1],blue=original[i+2];if(r>150&&g>95&&r-blue>8&&g-blue>5&&r>=g){mask[n]=1;src.data[i+3]=0}}
 // Segment each original gold stripe without changing its shape or coordinates.
 const stripes=[];for(let n=0;n<mask.length;n++){if(!mask[n])continue;let stack=[n],points=[],minX=w,maxX=0,minY=h,maxY=0;mask[n]=0;while(stack.length){const q=stack.pop(),x=q%w,y=Math.floor(q/w);points.push(q);minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);for(const t of [q-1,q+1,q-w,q+w]){if(t>=0&&t<mask.length&&mask[t]&&Math.abs(t%w-x)<=1){mask[t]=0;stack.push(t)}}}if(points.length<100){continue}const c=document.createElement('canvas');c.width=maxX-minX+1;c.height=maxY-minY+1;const cx=c.getContext('2d'),p=cx.createImageData(c.width,c.height);for(const q of points){const i=q*4,j=((Math.floor(q/w)-minY)*c.width+q%w-minX)*4;p.data.set(original.subarray(i,i+4),j)}cx.putImageData(p,0,0);stripes.push({canvas:c,x:minX,y:minY})}
 stripes.sort((a,b)=>a.y-b.y);if(stripes.length<3)return;canvasBaseCleanCheck: { let residual=0;for(let y=600;y<h;y++)for(let x=0;x<1150;x++){const i=(y*w+x)*4;if(src.data[i+3]&&src.data[i]>150&&src.data[i+1]>95&&src.data[i]-src.data[i+2]>8&&src.data[i+1]-src.data[i+2]>5&&src.data[i]>=src.data[i+1])residual++}art.dataset.residualGold=residual;} b.putImageData(src,0,0);
 const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;canvas.setAttribute('aria-hidden','true');canvas.dataset.stripes=stripes.length;art.append(canvas);const ctx=canvas.getContext('2d');let frame,last=0,time=0,running=false,paused=false;
 const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x)};
 function paint(){ctx.clearRect(0,0,w,h);ctx.drawImage(base,0,0);const t=time%1600,alphas=[];stripes.forEach((s,i)=>{const age=t-i*120;const a=smooth(age/210)*(1-smooth((age-575)/390));ctx.globalAlpha=a;ctx.drawImage(s.canvas,s.x,s.y);alphas.push(+a.toFixed(3))});ctx.globalAlpha=1;canvas.dataset.alphas=JSON.stringify(alphas)}
 function tissue(){const progress=smooth(((time%20000)-8400)/1600);stage.querySelector('.vessel-before').style.opacity=1-progress;stage.querySelector('.vessel-after').style.opacity=progress;stage.dataset.progress=progress.toFixed(3);const emphasis=smooth(((time%20000)-10000)/900);stage.style.setProperty('--emphasis',emphasis);const secondEmphasis=smooth(((time%20000)-11900)/900);stage.querySelector('.vessel-after').style.transform='scale('+(1+.1*emphasis+.1*secondEmphasis)+')';stage.dataset.secondEmphasis=secondEmphasis.toFixed(3);stage.dataset.emphasis=emphasis.toFixed(3)}
 function tick(now){if(!running)return;time+=Math.min(now-last,70);last=now;stage.classList.remove('is-final');paint();tissue();canvas.dataset.cycle=String(Math.floor(time/20000));frame=requestAnimationFrame(tick)}
 function sync(){cancelAnimationFrame(frame);running=!paused&&!reduced.matches&&!document.hidden;art.classList.toggle('canvas-ready',!reduced.matches);if(reduced.matches){stage.classList.add('is-final');stage.querySelector('.vessel-before').style.opacity=0;stage.querySelector('.vessel-after').style.opacity=1}else if(running){last=performance.now();frame=requestAnimationFrame(tick)}}
 const visual=document.querySelector('.visual');function toggle(){paused=!paused;visual.setAttribute('aria-pressed',String(paused));sync()}visual.addEventListener('click',toggle);visual.addEventListener('keydown',e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();toggle()}}); reduced.addEventListener('change',sync);document.addEventListener('visibilitychange',sync);sync();
 }).catch(()=>{});
})();





