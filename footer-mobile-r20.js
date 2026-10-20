(() => {
  'use strict';
  const mobile = matchMedia('(max-width:700px)');
  const groups = [...document.querySelectorAll('.home-footer-top > nav')].map((nav, index) => {
    const heading = nav.querySelector(':scope > h2, :scope > strong');
    if (!heading) return null;
    const label = heading.textContent;
    const title = document.createElement('span');
    title.className = 'footer-title-r20';
    title.textContent = label;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'footer-toggle-r20';
    button.append(document.createTextNode(label));
    const icon = document.createElement('span');
    icon.setAttribute('aria-hidden', 'true');
    button.append(icon);
    const panel = document.createElement('div');
    panel.className = 'footer-panel-r20';
    panel.id = `footer-panel-r20-${index}`;
    button.setAttribute('aria-controls', panel.id);
    [...nav.children].filter(n => n !== heading).forEach(n => panel.append(n));
    heading.replaceChildren(title, button);
    nav.append(panel);
    const setOpen = open => {
      panel.hidden = !open;
      button.setAttribute('aria-expanded', String(open));
      icon.textContent = open ? '−' : '+';
    };
    button.addEventListener('click', () => {
      if (mobile.matches) setOpen(panel.hidden);
    });
    return { heading, button, panel, setOpen };
  }).filter(Boolean);
  const sync = () => groups.forEach(({ heading, button, panel, setOpen }) => {
    const focused = document.activeElement;
    setOpen(!mobile.matches || panel.contains(focused));
    if (!mobile.matches && focused === button) {
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
    }
  });
  mobile.addEventListener('change', sync);
  sync();
})();
