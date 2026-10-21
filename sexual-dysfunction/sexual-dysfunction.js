/* Only enhance source-backed tables and anchor offset; all content works without JS. */
(() => {
  const root = document.querySelector('.sd-page');
  if (!root) return;
  const treatments = root.querySelector('.sd-desire-treatments');
  if (treatments) {
    for (const heading of [...treatments.querySelectorAll(':scope > h4')]) {
      const body = heading.nextElementSibling;
      const details = document.createElement('details');
      details.className = 'sd-treatment-box';
      const summary = document.createElement('summary');
      heading.before(details);
      summary.append(heading);
      details.append(summary);
      if (body) details.append(body);
    }
    const mobile = window.matchMedia('(max-width:900px)');
    const setMode = () => treatments.querySelectorAll('details').forEach(box => { box.open = !mobile.matches; });
    setMode();
    mobile.addEventListener('change', setMode);
    treatments.addEventListener('click', event => {
      if (!mobile.matches && event.target.closest('summary')) event.preventDefault();
    });
  }
  for (const holder of root.querySelectorAll('.sd-comparison-cards[data-table]')) {
    const table = document.getElementById(holder.dataset.table);
    if (!table) continue;
    const headings = [...table.querySelectorAll('thead th')].slice(1).map(cell => cell.textContent.trim());
    const rows = [...table.querySelectorAll('tbody tr')].map(row => ({
      label: row.querySelector('th').textContent.trim(),
      values: [...row.querySelectorAll('td')].map(cell => cell.textContent.trim())
    }));
    headings.forEach((title, index) => {
      const details = document.createElement('details');
      const summary = document.createElement('summary');
      summary.textContent = title;
      details.append(summary);
      const dl = document.createElement('dl');
      rows.forEach(row => {
        const dt = document.createElement('dt');
        const dd = document.createElement('dd');
        dt.textContent = row.label;
        dd.textContent = row.values[index];
        dl.append(dt, dd);
      });
      details.append(dl);
      holder.append(details);
    });
    holder.classList.add('has-mobile-cards');
    table.parentElement.classList.add('has-mobile-cards');
  }
  const updateOffset = () => {
    const top = document.querySelector('.site-top-r48');
    const px = top ? Math.ceil(top.getBoundingClientRect().height + 16) : 180;
    document.documentElement.style.setProperty('--ps-anchor-offset', `${px}px`);
  };
  updateOffset();
  window.addEventListener('resize', updateOffset, { passive: true });
  for (const anchor of document.querySelectorAll('a[href^="#"]')) {
    anchor.addEventListener('click', event => {
      const id = anchor.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (!target || !root.contains(target)) return;
      event.preventDefault();
      const focusTarget = target.matches('h1,h2,h3,h4') ? target : target.querySelector('h1,h2,h3,h4') || target;
      if (!focusTarget.hasAttribute('tabindex')) focusTarget.setAttribute('tabindex', '-1');
      history.replaceState(null, '', `#${id}`);
      focusTarget.focus({ preventScroll: true });
      target.scrollIntoView({ block: 'start' });
    });
  }
})();
