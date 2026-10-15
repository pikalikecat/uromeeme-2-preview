(() => {
 'use strict';
 const year = document.getElementById('copyright-year-r92');
 if (year) year.textContent = new Intl.DateTimeFormat('en', {year:'numeric',timeZone:'Asia/Taipei'}).format(new Date());
 const filter=document.querySelector('.dr-filter');
 if(!filter)return;
 const buttons=[...filter.querySelectorAll('[data-filter]')];
 const sections=[...document.querySelectorAll('#doctor-results > [data-specialty]')];
 const personLinks=[...document.querySelectorAll('.dr-person-link[data-specialty]')];
 const status=filter.querySelector('[role="status"]');
 let active='all';
 function apply(key){
  if(!buttons.some(b=>b.dataset.filter===key))key='all';
  active=key;
  for(const b of buttons)b.setAttribute('aria-pressed',String(b.dataset.filter===key));
  for(const s of sections)s.hidden=key!=='all'&&s.dataset.specialty!==key;
  for(const a of personLinks)a.hidden=key!=='all'&&a.dataset.specialty!==key;
  const count=sections.filter(s=>!s.hidden).reduce((n,s)=>n+s.querySelectorAll('[data-doctor]').length,0);
  const label=buttons.find(b=>b.dataset.filter===key).textContent;
  status.textContent=key==='all'?`顯示全部 ${count} 位醫師`:`${label}：顯示 ${count} 位醫師`;
  document.getElementById('doctor-results').dataset.activeFilter=key;
 }
 function revealHash(){
  const id=decodeURIComponent(location.hash.slice(1));
  const target=document.getElementById(id);
  const section=target&&target.closest('#doctor-results > [data-specialty]');
  if(section&&section.hidden){apply(section.dataset.specialty);target.scrollIntoView({behavior:'instant',block:'start'});}
 }
 for(const b of buttons)b.addEventListener('click',()=>apply(b.dataset.filter));
 filter.hidden=false;
 document.querySelector('.dr-filter-fallback').hidden=true;
 apply('all');revealHash();
 addEventListener('hashchange',revealHash);
})();
