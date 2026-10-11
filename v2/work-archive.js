export function initWorkArchive(root,projects) {
 if(!root)return()=>{};
 const controller=new AbortController(),{signal}=controller,motion=matchMedia('(prefers-reduced-motion: reduce)');
 const stage=root.querySelector('.archive-carousel'),cards=[...root.querySelectorAll('[data-archive-card]')],dots=[...root.querySelectorAll('[data-archive-select]')];
 let selected=2,position=2,velocity=0,raf=0,lastTime=0,step=150,drag=null,suppressUntil=0,autoDirection=1,hovering=false,visible=false,resumeAt=0,hovered=-1,lastPointer=null;
 const deferAuto=()=>{resumeAt=performance.now()+1800;};
 const clamp=n=>Math.max(0,Math.min(projects.length-1,n));
 const draw=()=>cards.forEach((card,i)=>{
  const distance=i-position,depth=Math.min(Math.abs(distance),3);
  const scale=1200/(1200+depth*115),isHovered=i===hovered;
  // Project depth onto a flat stacking context so z-index can truly raise a card.
  card.style.transform=`translate(calc(-50% + ${distance*step*scale}px),-50%) scale(${scale*(isHovered?1.1:1)}) perspective(1200px) rotateY(${isHovered?0:-Math.sign(distance)*Math.min(depth,1)*32}deg)`;
  card.style.zIndex=String(i===hovered?50:20-Math.round(depth*4));
  card.classList.toggle('is-hovered',i===hovered);
  card.style.setProperty('--card-shade',String(i===hovered?0:Math.min(depth*.2,.6)));
 });
 const frame=time=>{
  const dt=Math.min((time-lastTime)/1000||1/60,1/30);lastTime=time;
  velocity+=((selected-position)*110-velocity*19)*dt;position+=velocity*dt;draw();
  if(Math.abs(selected-position)>.001||Math.abs(velocity)>.003)raf=requestAnimationFrame(frame);
  else{position=selected;velocity=0;draw();raf=0;}
 };
 const animate=()=>{if(motion.matches){position=selected;velocity=0;draw();}else if(!raf){lastTime=performance.now();raf=requestAnimationFrame(frame);}};
 const select=(index,announce=true)=>{
  selected=clamp(index);const p=projects[selected];
  cards.forEach((card,i)=>{card.classList.toggle('is-selected',i===selected);if(i===selected)card.setAttribute('aria-current','true');else card.removeAttribute('aria-current');});
  dots.forEach((dot,i)=>dot.setAttribute('aria-pressed',String(i===selected)));
  root.querySelector('.archive-selected-title').textContent=p.title.en;
  root.querySelector('.archive-selected-category').textContent=p.badge||({short:'Short film',tvc:'TVC',documentary:'Documentary',ai:'AI film'}[p.category]);
  root.querySelector('[data-archive-prev]').disabled=selected===0;
  root.querySelector('[data-archive-next]').disabled=selected===projects.length-1;
  if(announce)root.querySelector('.archive-announcement').textContent=`${selected+1} of ${projects.length}: ${p.title.en}`;
  animate();
 };
 const highlight=index=>{
  hovered=index;cancelAnimationFrame(raf);raf=0;velocity=0;draw();
 };
 cards.forEach((card,i)=>{

  card.addEventListener('focus',()=>highlight(i),{signal});
  card.addEventListener('blur',()=>{if(hovered===i){hovered=-1;draw();}},{signal});
 });
 // Layout width, not the perspective-transformed bounds, keeps dragging consistent.
 const observer=new ResizeObserver(()=>{step=cards[0].offsetWidth*.72;draw();});observer.observe(stage);
 root.addEventListener('click',e=>{
  deferAuto();
  const card=e.target.closest('[data-archive-card]');
  if(card&&performance.now()<suppressUntil){
   e.preventDefault();e.stopPropagation();return;
  }
  const dot=e.target.closest('[data-archive-select]');if(dot)select(Number(dot.dataset.archiveSelect));
  if(e.target.closest('[data-archive-prev]'))select(selected-1);
  if(e.target.closest('[data-archive-next]'))select(selected+1);

 },{capture:true,signal});
 root.addEventListener('keydown',e=>{
  if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;
  deferAuto();e.preventDefault();select(e.key==='Home'?0:e.key==='End'?projects.length-1:selected+(e.key==='ArrowRight'?1:-1));
 },{signal});
 stage.addEventListener('dragstart',e=>e.preventDefault(),{signal});
 stage.addEventListener('pointerdown',e=>{if(e.button!==0)return;deferAuto();drag={id:e.pointerId,x:e.clientX,y:e.clientY,start:position,moved:false};},{signal});
 window.addEventListener('pointermove',e=>{
  if(!drag||drag.id!==e.pointerId)return;
  const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
  if(!drag.moved&&Math.abs(dy)>Math.abs(dx)+8){drag=null;return;}
  if(Math.abs(dx)>8)drag.moved=true;
  if(!drag.moved)return;
  if(!stage.hasPointerCapture(e.pointerId))stage.setPointerCapture(e.pointerId);
  hovered=-1;cancelAnimationFrame(raf);raf=0;velocity=0;position=clamp(drag.start-dx/step);stage.classList.add('is-dragging');draw();
 },{signal});
 const finish=e=>{if(!drag||drag.id!==e.pointerId)return;const moved=drag.moved;deferAuto();drag=null;stage.classList.remove('is-dragging');if(stage.hasPointerCapture(e.pointerId))stage.releasePointerCapture(e.pointerId);if(moved){suppressUntil=performance.now()+300;select(Math.round(position));}};
 window.addEventListener('pointerup',finish,{signal});window.addEventListener('pointercancel',finish,{signal});
 const entrance=new IntersectionObserver(entries=>{for(const e of entries){const entered=!visible&&e.isIntersecting;visible=e.isIntersecting;if(entered){hovered=-1;hovering=false;resumeAt=performance.now()+450;draw();}root.classList.toggle('is-archive-visible',visible);}},{threshold:.15});entrance.observe(root);
 // Pause only after actual pointer movement onto a card. A stationary cursor
 // encountered while scrolling into the section must not suppress its debut.
 document.addEventListener('pointermove',e=>{
  if(e.pointerType==='touch'||drag)return;
  if(lastPointer&&lastPointer.x===e.clientX&&lastPointer.y===e.clientY)return;
  lastPointer={x:e.clientX,y:e.clientY};
  const card=e.target.closest?.('[data-archive-card]');
  const next=visible&&card&&root.contains(card)?Number(card.dataset.archiveCard):-1;
  hovering=!!e.target.closest?.('.archive-navigation');
  if(next===hovered)return;
  if(next>=0)highlight(next);
  else{hovered=-1;deferAuto();draw();animate();}
 },{passive:true,signal});
 stage.addEventListener('pointerleave',()=>{if(hovered>=0){hovered=-1;deferAuto();draw();animate();}hovering=false;},{signal});
 root.addEventListener('focusin',deferAuto,{signal});root.addEventListener('focusout',deferAuto,{signal});
 const autoTimer=setInterval(()=>{
  if(!visible||hovered>=0||hovering||drag||motion.matches||document.hidden||(root.contains(document.activeElement)&&document.activeElement.matches(':focus-visible'))||performance.now()<resumeAt)return;
  if(selected===projects.length-1)autoDirection=-1;else if(selected===0)autoDirection=1;
  select(selected+autoDirection,false);
 },1600);
 step=cards[0].offsetWidth*.72;select(2,false);
 return()=>{clearInterval(autoTimer);controller.abort();observer.disconnect();entrance.disconnect();cancelAnimationFrame(raf);};
}
