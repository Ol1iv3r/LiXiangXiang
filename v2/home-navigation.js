// Resolve at click time: work sections may have been replaced since initialization.
export function homeTargetTop(root,target,scrollY) {
  const anchor=root.querySelector(target==='work'?'.home-work .film-experience':'.home-journey');
  if(!anchor)return null;
  const top=anchor.getBoundingClientRect().top+scrollY;
  return top+(target==='roles'?(root.querySelector('.journey-stage')?.clientHeight||0):0);
}

// All signature links restart the document, including when already on home.
export function initHomeReload(root,win){
  root.addEventListener('click',event=>{
    const logo=event.target.closest('[data-home-reload]');
    if(!logo||event.button>0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
    event.preventDefault();event.stopPropagation();
    win.history.scrollRestoration='manual';
    win.history.replaceState(null,'',logo.getAttribute('href'));
    win.location.reload();
  },{capture:true});
}
