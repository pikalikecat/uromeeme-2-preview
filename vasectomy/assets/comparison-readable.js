/* Progressive enhancement: original tables remain the source of truth. */
(()=>{
 document.querySelectorAll('.native-comparison').forEach(table=>{
  const host=table.closest('.comparison-scroll');if(!host)return;
  const titles=[...table.querySelectorAll('thead th')].map(n=>n.textContent.trim());
  const rows=[...table.querySelectorAll('tbody tr')];
  if(!titles.length||rows.some(r=>r.querySelectorAll('td').length!==titles.length))return;
  const section=document.createElement('section');section.className='comparison-cards';
  const heading=document.createElement('p');heading.className='comparison-heading';heading.textContent=table.caption?.textContent.trim()||'療程比較';section.append(heading);
  const hint=document.createElement('p');hint.className='comparison-help';hint.textContent='點選比較項目，查看各種術式的完整說明。';section.append(hint);
  rows.forEach((row,i)=>{
   const details=document.createElement('details');details.open=i===0;
   const summary=document.createElement('summary');summary.textContent=row.querySelector('th').textContent.trim();details.append(summary);
   const list=document.createElement('dl');
   [...row.querySelectorAll('td')].forEach((cell,j)=>{
    const item=document.createElement('div');item.className='comparison-choice';if(cell.classList.contains('comparison-own'))item.classList.add('comparison-own');
    const term=document.createElement('dt');term.textContent=titles[j];
    const description=document.createElement('dd');cell.childNodes.forEach(n=>description.append(n.cloneNode(true)));
    item.append(term,description);list.append(item);
   });details.append(list);section.append(details);
  });
  host.after(section);host.classList.add('comparison-enhanced');
  const legacyHint=host.previousElementSibling;
  if(legacyHint&&legacyHint.textContent.includes('手機可左右滑動'))legacyHint.classList.add('comparison-legacy-hint');
 });
})();

