
(()=>{const root=document.querySelector(".care-r59");if(!root)return;const viewport=root.querySelector('.viewport'),track=root.querySelector('.track'),cards=[...track.children],labels=cards.map(c=>c.querySelector('h3').textContent),status=root.querySelector('.status');let index=0,start=null,dragged=false;

cards.forEach((card,i)=>{
 const nav=document.createElement('div');nav.className='care-card-nav-r87';nav.setAttribute('role','group');nav.setAttribute('aria-label','九大堅持換頁');
 for(const [delta,label,symbol] of [[-1,'上一張九大堅持','←'],[1,'下一張九大堅持','→']]){
  const button=document.createElement('button');button.type='button';button.textContent=symbol;button.setAttribute('aria-label',label);button.dataset.step=delta;
  button.addEventListener('click',e=>{e.stopPropagation();show(index+delta);cards[index].querySelector('[data-step="'+delta+'"]').focus({preventScroll:true});});nav.append(button);
 }
 card.append(nav);
});
function position(){const c=cards[index];track.style.transform=`translateX(${(viewport.clientWidth-c.offsetWidth)/2-c.offsetLeft}px)`}
function show(n){index=(n+cards.length)%cards.length;cards.forEach((c,i)=>{c.classList.toggle('active',i===index);c.classList.remove('enter');c.setAttribute('aria-hidden',String(i!==index));c.querySelectorAll('.care-card-nav-r87 button').forEach(b=>b.tabIndex=i===index?0:-1);});void cards[index].offsetWidth;cards[index].classList.add('enter');position();status.textContent='目前查看：'+labels[index]}

viewport.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();show(index+(e.key==='ArrowRight'?1:-1))}});
viewport.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;if(e.pointerType==='mouse'&&e.button!==0)return;start={x:e.clientX,y:e.clientY};dragged=false;viewport.setPointerCapture(e.pointerId);viewport.classList.add('dragging')});
viewport.addEventListener('pointerup',e=>{if(e.target.closest('button')&&!start)return;if(!start)return;const dx=e.clientX-start.x,dy=e.clientY-start.y;dragged=Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy);if(dragged)show(index+(dx<0?1:-1));else{const target=document.elementFromPoint(e.clientX,e.clientY)?.closest('.card');if(target&&cards.includes(target))show(cards.indexOf(target))}start=null;viewport.classList.remove('dragging')});viewport.addEventListener('pointercancel',()=>{start=null;viewport.classList.remove('dragging')});window.addEventListener('resize',position);show(0);
})();

