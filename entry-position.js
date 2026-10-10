// Run before layout/module loading so restored scroll cannot become the entry page.
(() => {
  history.scrollRestoration = 'manual';
  let interacted = false;
  const isHome = () => !location.hash || location.hash === '#/' || location.hash === '#';
  const reset = () => {
    if (isHome()) window.scrollTo({top: 0, left: 0, behavior: 'instant'});
  };
  for (const event of ['pointerdown', 'touchstart', 'wheel', 'keydown']) {
    window.addEventListener(event, () => { interacted = true; }, {passive: true});
  }
  reset();
  window.addEventListener('pageshow', event => {
    if (event.persisted) interacted = false;
    if (!interacted) reset();
  });
})();
