'use strict';
(() => {
  const timers = new WeakMap();
  document.querySelectorAll('.team-r56 .doctor-hit-r56').forEach(button => {
    button.addEventListener('click', () => {
      const card = button.closest('.doctor-card-r56');
      clearTimeout(timers.get(card));
      card.classList.remove('is-lit-r56');
      // Restart the brief feedback on repeated pointer, Enter or Space activation.
      void card.offsetWidth;
      card.classList.add('is-lit-r56');
      timers.set(card, setTimeout(() => {
        card.classList.remove('is-lit-r56');
        timers.delete(card);
      }, 680));
    });
  });
})();
