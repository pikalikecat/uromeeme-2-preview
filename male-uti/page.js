'use strict';
// Only in-page navigation; no requests, tracking, forms, or clinical logic.
document.querySelectorAll('.uti-page a[href^="#"]').forEach(link => {
  link.addEventListener('click', () => {
    const target = document.getElementById(link.hash.slice(1));
    requestAnimationFrame(() => target?.focus({preventScroll:true}));
  });
});
