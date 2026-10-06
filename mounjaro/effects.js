(() => {
 const hero=document.querySelector('.hero'),pen=document.querySelector('.pen-visual');if(!hero||!pen)return;
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');let timer;
 function stop(){clearTimeout(timer);hero.classList.remove('effects-active')}
 function play(){if(reduce.matches||document.hidden||hero.classList.contains('effects-active'))return;hero.classList.add('effects-active');timer=setTimeout(stop,4500)}
 pen.addEventListener('pointerenter',play);pen.addEventListener('pointerdown',play);
 hero.addEventListener('focusin',play);document.addEventListener('visibilitychange',()=>{if(document.hidden)stop()});
 reduce.addEventListener('change',stop);play();
})();
