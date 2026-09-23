'use strict';
// Progressive enhancement: the complete comparison table is the sole data source.
document.querySelectorAll('.sw-comparison-cards').forEach(host => {
  const table=document.getElementById(host.dataset.table);
  if(!table)return;
  const headers=[...table.tHead.rows[0].cells].map(c=>c.textContent.trim());
  const rows=[...table.tBodies[0].rows].map(r=>[...r.cells].map(c=>c.textContent.trim()));
  headers.slice(1).forEach((heading,i)=>{
    const detail=document.createElement('details'),summary=document.createElement('summary'),list=document.createElement('dl');
    summary.textContent=heading;detail.append(summary,list);
    rows.forEach((row,j)=>{
      const div=document.createElement('div'),term=document.createElement('dt'),desc=document.createElement('dd');
      term.textContent=row[0];desc.textContent=row[i+1];
      if(j===0){const small=document.createElement('small');small.textContent='津久療程';term.append(small)}
      div.append(term,desc);list.append(div);
    });host.append(detail);
  });table.parentElement.classList.add('is-enhanced');
});
document.querySelectorAll('.sw-jump a').forEach(a=>a.addEventListener('click',()=>{
  const target=document.getElementById(a.hash.slice(1));
  requestAnimationFrame(()=>target?.focus({preventScroll:true}));
}));

// Three real buttons reveal the original text below the full button row.
// Without JS the native details remain open and individually keyboard-operable.
document.querySelectorAll('.sw-treatment-stages').forEach(host=>{
  const stages=[...host.querySelectorAll(':scope > details')];
  const nav=document.createElement('div');nav.className='sw-stage-buttons';nav.setAttribute('role','group');nav.setAttribute('aria-label','治療階段');
  const buttons=stages.map((detail,i)=>{
    const button=document.createElement('button'),body=detail.querySelector('.sw-stage-body');
    button.type='button';button.textContent=detail.querySelector('summary').textContent;
    button.id='stage-button-'+i;button.setAttribute('aria-controls',body.id);button.setAttribute('aria-expanded','false');
    body.setAttribute('role','region');body.setAttribute('aria-labelledby',button.id);detail.open=false;
    button.addEventListener('click',()=>{
      const open=!detail.open;
      stages.forEach((item,j)=>{item.open=open&&i===j;buttons[j].setAttribute('aria-expanded',String(item.open))});
    });const entry=document.createElement('div');entry.className='sw-stage-entry';entry.append(button,detail);nav.append(entry);return button;
  });host.prepend(nav);host.classList.add('is-enhanced');
});
