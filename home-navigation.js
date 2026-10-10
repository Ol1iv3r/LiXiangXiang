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
