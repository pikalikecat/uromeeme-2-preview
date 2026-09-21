(()=>{
 'use strict';
 // Enhance only the eight original FAQ entries. No duplicate source content.
 const main=document.querySelector('.vas-content');
 for(const heading of [...main.querySelectorAll('h3')]){
  if(!/^Q[1-8]\./.test(heading.textContent.trim()))continue;
  const details=document.createElement('details');details.className='faq-entry';
  const summary=document.createElement('summary');const answer=document.createElement('div');answer.className='faq-answer';
  heading.before(details);let next=heading.nextSibling;summary.append(heading);details.append(summary,answer);
  while(next && !(next.nodeType===1 && (next.matches('h2,h3,.original-ux_text') || next.querySelector('h2')))){
   const following=next.nextSibling;answer.append(next);next=following;
  }
 }
 for(const el of main.querySelectorAll('.original-ux_text')){
  if(el.textContent.trim().startsWith('【本資訊'))el.classList.add('source-footnote');
 }
})();
