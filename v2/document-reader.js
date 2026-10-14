import {spreadPages,adjacentSpread} from './book-pagination.js?v=ba5e63171cd3';
let library;
const loadLibrary=()=>library??=import('/LiXiangXiang/vendor/pdfjs/pdf.min.mjs?v=ba5e63171cd3').then(pdfjs=>{
  pdfjs.GlobalWorkerOptions.workerSrc='/LiXiangXiang/vendor/pdfjs/pdf.worker.min.mjs';return pdfjs;
});
export function createDocumentReader(container){
  container.innerHTML=`<div class="document-reader"><nav class="document-controls" aria-label="PDF controls"><button data-previous aria-label="Previous page">←</button><label>Page <input data-page type="number" min="1" value="1" aria-label="Page number"></label><span data-count>/ —</span><button data-next aria-label="Next page">→</button><span class="document-toolbar-divider"></span><button data-zoom-out aria-label="Zoom out">−</button><span data-zoom>Fit</span><button data-zoom-in aria-label="Zoom in">+</button><button data-fit>Fit page</button><a data-original target="_blank" rel="noopener noreferrer">Open PDF ↗</a></nav><div class="document-pages" tabindex="0" aria-label="Book pages"><p class="document-status" role="status">Loading document…</p><div class="document-book"></div></div></div>`;
  const q=s=>container.querySelector(s),viewport=q('.document-pages'),book=q('.document-book'),status=q('.document-status');
  const input=q('[data-page]'),previous=q('[data-previous]'),next=q('[data-next]');
  const controller=new AbortController(),{signal}=controller;
  let pdf,loading,tasks=[],generation=0,pageNumber=1,zoom=1,destroyed=false,resizeTimer,portrait=true,touchX=null;
  const double=()=>portrait&&viewport.clientWidth>=760;
  function controls(){
    const pages=spreadPages(pageNumber,pdf?.numPages||1,double());
    previous.disabled=!pdf||pages[0]===1;next.disabled=!pdf||pages.at(-1)===pdf.numPages;
    input.disabled=!pdf;input.value=pages[0];input.max=pdf?.numPages||1;
    q('[data-count]').textContent=`${pages.length===2?'– '+pages[1]+' ':''}/ ${pdf?.numPages||'—'}`;
    viewport.classList.toggle('is-zoomed',zoom>1);
    q('[data-zoom]').textContent=zoom===1?'Fit':`${Math.round(zoom*100)}%`;
    q('[data-zoom-out]').disabled=!pdf||zoom<=.5;q('[data-zoom-in]').disabled=!pdf||zoom>=4;
  }
  async function render(direction=0){
    if(!pdf||destroyed)return;
    const version=++generation;tasks.forEach(t=>t.cancel());tasks=[];controls();
    try{
      const numbers=spreadPages(pageNumber,pdf.numPages,double());
      const pages=await Promise.all(numbers.map(n=>pdf.getPage(n)));
      if(version!==generation||destroyed)return;
      const naturals=pages.map(p=>p.getViewport({scale:1}));
      const scale=Math.min((viewport.clientWidth-48)/naturals.reduce((sum,p)=>sum+p.width,0),(viewport.clientHeight-44)/Math.max(...naturals.map(p=>p.height)))*zoom;
      const density=Math.min(window.devicePixelRatio||1,2);
      const canvases=pages.map((page,i)=>{
        const canvas=document.createElement('canvas'),size=page.getViewport({scale:Math.max(.1,scale)});
        canvas.width=Math.ceil(size.width*density);canvas.height=Math.ceil(size.height*density);
        canvas.style.width=`${size.width}px`;canvas.style.height=`${size.height}px`;
        canvas.setAttribute('role','img');canvas.setAttribute('aria-label',`Page ${numbers[i]} of ${pdf.numPages}`);
        tasks.push(page.render({canvasContext:canvas.getContext('2d'),viewport:size,transform:[density,0,0,density,0,0]}));return canvas;
      });
      await Promise.all(tasks.map(t=>t.promise));
      if(version!==generation||destroyed)return;
      const old=direction>0?book.querySelector('canvas:last-child'):book.querySelector('canvas');
      let leaf;
      if(direction&&old&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
        leaf=document.createElement('canvas');leaf.width=old.width;leaf.height=old.height;leaf.getContext('2d').drawImage(old,0,0);
        leaf.style.width=old.style.width;leaf.style.height=old.style.height;leaf.className='document-turn-leaf';leaf.setAttribute('aria-hidden','true');
      }
      book.replaceChildren(...canvases);book.classList.toggle('is-spread',numbers.length===2);status.hidden=true;viewport.scrollTop=0;
      if(leaf){
        leaf.style[direction>0?'right':'left']='0';leaf.style.transformOrigin=direction>0?'left center':'right center';book.append(leaf);
        const animation=leaf.animate([{transform:'rotateY(0deg)',filter:'brightness(1)'},{transform:`rotateY(${direction>0?-165:165}deg)`,filter:'brightness(.65)',opacity:0}],{duration:560,easing:'cubic-bezier(.2,.65,.2,1)'});
        animation.finished.then(()=>leaf.remove()).catch(()=>leaf.remove());
      }
    }catch(error){if(error.name!=='RenderingCancelledException'&&version===generation){status.hidden=false;status.textContent='Unable to display this page. Use Open PDF to view the original.';}}
  }
  async function open(doc){
    const version=++generation;tasks.forEach(t=>t.cancel());loading?.destroy();pdf=null;pageNumber=1;zoom=1;book.replaceChildren();
    q('[data-original]').href=doc.src;status.hidden=false;status.textContent='Loading document…';controls();
    try{
      const pdfjs=await loadLibrary();if(version!==generation||destroyed)return;
      loading=pdfjs.getDocument({url:doc.src,cMapUrl:'/LiXiangXiang/vendor/pdfjs/cmaps/',cMapPacked:true,standardFontDataUrl:'/LiXiangXiang/vendor/pdfjs/standard_fonts/',isEvalSupported:false,useWasm:false});
      const loaded=await loading.promise;if(version!==generation||destroyed)return;
      const first=await loaded.getPage(1);if(version!==generation||destroyed)return;
      const size=first.getViewport({scale:1});portrait=size.height>size.width;pdf=loaded;await render();
    }catch(error){if(version===generation&&!destroyed)status.textContent='Unable to load this document. Use Open PDF to view the original.';}
  }
  function go(value){if(!pdf)return;const old=pageNumber;pageNumber=spreadPages(value,pdf.numPages,double())[0];render(Math.sign(pageNumber-old));}
  const turn=d=>pdf&&go(adjacentSpread(pageNumber,pdf.numPages,double(),d));
  previous.addEventListener('click',()=>turn(-1),{signal});next.addEventListener('click',()=>turn(1),{signal});
  input.addEventListener('change',()=>go(Number(input.value)),{signal});
  q('[data-zoom-out]').addEventListener('click',()=>{zoom=Math.max(.5,zoom-.25);render();},{signal});
  q('[data-zoom-in]').addEventListener('click',()=>{zoom=Math.min(4,zoom+.25);render();},{signal});
  q('[data-fit]').addEventListener('click',()=>{zoom=1;render();},{signal});
  container.addEventListener('keydown',e=>{if(e.target===input)return;if(['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();turn(e.key==='ArrowRight'?1:-1);}},{signal});
  viewport.addEventListener('touchstart',e=>{touchX=e.touches[0].clientX;},{passive:true,signal});
  viewport.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-touchX;if(zoom<=1&&touchX!==null&&Math.abs(dx)>60)turn(dx<0?1:-1);touchX=null;},{passive:true,signal});
  const observer=new ResizeObserver(()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>render(),160);});observer.observe(viewport);controls();
  return{open,destroy(){destroyed=true;generation++;controller.abort();observer.disconnect();clearTimeout(resizeTimer);tasks.forEach(t=>t.cancel());loading?.destroy();}};
}
