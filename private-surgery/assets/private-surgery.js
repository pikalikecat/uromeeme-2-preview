'use strict';
// Account for the actual shared sticky header, including text zoom and wrapping.
(() => {
 const header=document.querySelector('.site-top-r48');
 const update=()=>document.documentElement.style.setProperty('--ps-anchor-offset',`${Math.ceil(header?.getBoundingClientRect().height||0)+24}px`);
 update(); if(header)new ResizeObserver(update).observe(header);
 const navigate=(hash)=>{
  const section=document.getElementById(hash.slice(1));if(!section)return;
  const heading=section.querySelector('h2')||section;
  heading.focus({preventScroll:true});heading.scrollIntoView({block:'start',behavior:'instant'});
 };
 document.querySelectorAll('.ps-treatment-nav a').forEach(a=>a.addEventListener('click',e=>{
  if(e.ctrlKey||e.metaKey||e.shiftKey||e.altKey||e.button!==0)return;
  e.preventDefault();const hash=a.getAttribute('href');history.pushState(null,'',hash);navigate(hash);
 }));
 window.addEventListener('hashchange',()=>navigate(location.hash));
 window.addEventListener('load',()=>{update();if(location.hash)navigate(location.hash)});
 // One semantic source table drives the compact mobile representation.
 const table=document.querySelector('.ps-comparison');
 if(table){
  const cards=document.createElement('div');cards.className='ps-comparison-cards';cards.setAttribute('aria-label',table.caption.textContent);
  const labels=[...table.tHead.rows[0].cells].slice(1).map(x=>x.textContent);
  [...table.tBodies[0].rows].forEach(row=>{
   const detail=document.createElement('details'),summary=document.createElement('summary'),dl=document.createElement('dl');summary.textContent=row.cells[0].textContent;
   labels.forEach((label,i)=>{const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=row.cells[i+1].textContent;dl.append(dt,dd)});
   detail.append(summary,dl);cards.append(detail);
  });
  table.after(cards);table.classList.add('has-mobile-cards');
 }
})();
