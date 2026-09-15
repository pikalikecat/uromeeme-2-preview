(()=>{
 const scene=document.querySelector('.scene');let previous=0;
 function size(){
  if(document.body.classList.contains('intro-fullscreen'))return;
  const height=Math.ceil(scene.getBoundingClientRect().bottom+window.scrollY)+2;
  if(height===previous)return;previous=height;
  parent.postMessage({type:'m19-banner-height',height},'*');
 }
 new ResizeObserver(size).observe(scene);
 new MutationObserver(size).observe(document.body,{attributes:true,attributeFilter:['class']});
 window.addEventListener('load',size);window.addEventListener('resize',size);
})();

