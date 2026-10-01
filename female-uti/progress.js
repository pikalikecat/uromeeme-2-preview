(() => {
 const list=document.querySelector('#infection .treatment-list');if(!list)return;
 const rows=[...list.children];let pending=false;
 function update(){pending=false;const header=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--female-header-height'))||0;
  const line=header+(innerHeight-header)*.48;let active=-1;
  rows.forEach((row,i)=>{if(row.getBoundingClientRect().top+33<=line)active=i});
  rows.forEach((row,i)=>{row.classList.toggle('is-reached',i<=active);row.classList.toggle('is-active',i===active)});
  list.style.setProperty('--reading-track',Math.max(0,rows.at(-1).offsetTop+1)+'px');
  const fill=active<0?0:rows[active].offsetTop+33-32;
  list.style.setProperty('--reading-fill',Math.max(0,fill)+'px');list.dataset.readingActive=String(active);
 }
 const schedule=()=>{if(!pending){pending=true;requestAnimationFrame(update)}};
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule,{passive:true});
 new ResizeObserver(schedule).observe(list);document.fonts?.ready.then(schedule);update();
})();
