// Progressive enhancement only. No requests, storage, forms or tracking.
(() => {
  const header = document.querySelector('.site-top-r48');
  if (!header || !('ResizeObserver' in window)) return;
  const root = document.documentElement;
  const measure = () => {
    root.style.setProperty('--m19-sticky-height', `${Math.ceil(header.getBoundingClientRect().height)}px`);
    root.classList.add('sti-measured-header');
  };
  measure();
  new ResizeObserver(measure).observe(header);
})();

// Decorative, cumulative reading position. Every row stays fully readable.
(() => {
  const list = document.querySelector('.treatment-list');
  if (!list) return;
  const rows = [...list.querySelectorAll('.treatment-row')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let scheduled = false;
  const update = () => {
    scheduled = false;
    const header = document.querySelector('.site-top-r48');
    const headerBottom = Math.max(0, header?.getBoundingClientRect().bottom || 0);
    const readingLine = headerBottom + Math.max(50, (innerHeight - headerBottom) * .38);
    let active = 0;
    rows.forEach((row, i) => { if (row.getBoundingClientRect().top <= readingLine) active = i; });
    rows.forEach((row, i) => {
      row.classList.toggle('is-reached', i <= active);
      row.classList.toggle('is-active', i === active);
    });
    list.style.setProperty('--treatment-progress', `${rows[active].offsetTop + 34}px`);
  };
  const schedule = () => { if (!scheduled) { scheduled = true; requestAnimationFrame(update); } };
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule, { passive: true });
  if ('ResizeObserver' in window) new ResizeObserver(schedule).observe(list);
  reduced.addEventListener('change', schedule);
  update();
})();

// One-time entrance, in document order. Nothing is hidden before JS runs:
// no-JS, observer failure and reduced motion retain the complete six-step list.
(() => {
  const steps = [...document.querySelectorAll('.screening-step')];
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  if (!steps.length || !('IntersectionObserver' in window) || motion.matches) return;
  const observer = new IntersectionObserver(entries => {
    const entering = entries.filter(e => e.isIntersecting)
      .sort((a, b) => steps.indexOf(a.target) - steps.indexOf(b.target));
    entering.forEach((entry, index) => {
      entry.target.style.setProperty('--step-delay', `${index * 100}ms`);
      entry.target.classList.add('step-enter');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.08 });
  steps.forEach(step => observer.observe(step));
  motion.addEventListener('change', event => {
    if (event.matches) {
      observer.disconnect();
      steps.forEach(step => step.classList.remove('step-enter'));
    }
  });
})();
