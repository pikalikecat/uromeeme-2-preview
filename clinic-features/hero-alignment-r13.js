/* Local geometry only. No animation, navigation interception or scroll lock. */
(() => {
 'use strict';
 const hero=document.querySelector('.cf-hero');
 const shell=document.querySelector('.site-top-r48')?.closest('.site-shell');
 if(!hero||!shell)return;
 const fit=()=>hero.style.setProperty('--cf-shell-height',Math.ceil(shell.getBoundingClientRect().height)+'px');
 fit();
 if(!('ResizeObserver' in window))return;
 const observer=new ResizeObserver(fit);
 observer.observe(shell);
 addEventListener('pagehide',()=>observer.disconnect(),{once:true});
})();
