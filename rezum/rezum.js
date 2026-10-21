'use strict';
(() => {
 const header=document.querySelector('.site-top-r48');
 const update=()=>document.documentElement.style.setProperty('--bph-header-offset',`${Math.ceil(header?.getBoundingClientRect().height||0)+24}px`);
 update();if(header && 'ResizeObserver' in window)new ResizeObserver(update).observe(header);
 function navigate(hash){const section=document.getElementById(hash.slice(1));if(!section)return;const target=section.querySelector('h2')||section;target.setAttribute('tabindex','-1');target.focus({preventScroll:true});target.scrollIntoView({block:'start',behavior:'instant'});}
 document.querySelectorAll('.ps-treatment-nav a, .bph-reading-links a').forEach(a=>a.addEventListener('click',e=>{if(e.ctrlKey||e.metaKey||e.altKey||e.shiftKey||e.button!==0)return;e.preventDefault();history.pushState(null,'',a.hash);navigate(a.hash);}));
 addEventListener('hashchange',()=>navigate(location.hash));addEventListener('load',()=>{update();if(location.hash)navigate(location.hash)});
 const table=document.querySelector('.ps-comparison');if(!table)return;
 const cards=document.createElement('div');cards.className='ps-comparison-cards';cards.setAttribute('aria-label',table.caption.textContent);
 [...table.tHead.rows[0].cells].slice(1).forEach((heading,i)=>{
  const detail=document.createElement('details'),summary=document.createElement('summary'),dl=document.createElement('dl');summary.textContent=heading.textContent;
  [...table.tBodies[0].rows].forEach(row=>{const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=row.cells[0].textContent;dd.textContent=row.cells[i+1].textContent;dl.append(dt,dd)});
  detail.append(summary,dl);cards.append(detail);
 });
 table.parentElement.after(cards);table.classList.add('has-mobile-cards');
})();
