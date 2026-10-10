import { createJourneyWheelGate } from './journey-wheel.js';
import { createContactPopup } from './contact.js';
import { initBranchMotion } from './branch-motion.js';
import { homeTargetTop } from './home-navigation.js';
export function initHomeJourney() {
  const journey=document.querySelector('.home-journey');
  if(!journey) return ()=>{};
  const controller=new AbortController(),{signal}=controller;
  const stage=journey.querySelector('.journey-stage');
  const first=journey.querySelector('.journey-cover-layer');
  const second=journey.querySelector('.identity-stage');
  const dissolves=[...document.querySelectorAll('.home-work .film-experience')].map((section,index,sections)=>{
    if(!index)return null;
    const image=section.querySelector('.film-cover-art>img'),prior=sections[index-1].querySelector('.film-cover-art>img');
    if(!image||!prior)return null;
    const underlay=prior.cloneNode();underlay.classList.add('film-dissolve-underlay');underlay.alt='';underlay.setAttribute('aria-hidden','true');underlay.loading='eager';image.before(underlay);
    return {section,image,underlay};
  }).filter(Boolean);
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  const branches=initBranchMotion(second,motion);
  let disposePopup=null,settleTimer=0,lastScroll=window.scrollY,direction=1,scrollFrame=0;
  function scrollToPage(top) {
    cancelAnimationFrame(scrollFrame);clearTimeout(settleTimer);
    const from=window.scrollY,start=performance.now(),duration=560;
    if(motion.matches){window.scrollTo({top,behavior:'instant'});scrollFrame=0;return;}
    function tick(now){
      const progress=Math.min(1,(now-start)/duration);
      const eased=progress<.5?4*progress**3:1-(-2*progress+2)**3/2;
      window.scrollTo({top:from+(top-from)*eased,behavior:'instant'});
      scrollFrame=progress<1?requestAnimationFrame(tick):0;
    }
    scrollFrame=requestAnimationFrame(tick);
  }
  const startTop=()=>journey.getBoundingClientRect().top+window.scrollY;
  const settle=()=>{const y=window.scrollY-startTop(),h=stage.clientHeight;if(!scrollFrame&&y>h*.02&&y<h*.98&&!document.querySelector('dialog[open]'))scrollToPage(startTop()+(direction>0?h:0));};
  let frame=0,ready=false,current=0,previous=0,branchesVisible=false;
  const clamp=value=>Math.min(1,Math.max(0,value));
  const smooth=(a,b,v)=>{const n=clamp((v-a)/(b-a));return n*n*(3-2*n);};
  function update(time=performance.now()) {
    frame=0;
    const rect=journey.getBoundingClientRect(),height=stage.clientHeight;
    const target=clamp((-rect.top/height));
    const dt=Math.min((time-previous)/1000||1/60,.05);previous=time;
    current=motion.matches?target:current+(target-current)*(1-Math.exp(-24*dt));
    if(Math.abs(target-current)<.0005)current=target;
    const mix=motion.matches?Number(current>.5):smooth(0,1,current);
    first.style.opacity=String(1-mix);
    first.style.transform=motion.matches?'none':`scale(${1+mix*.018})`;
    second.style.opacity=String(mix);
    second.querySelectorAll('.identity-photo-plane').forEach(plane=>plane.style.transform='translateX(-50%)');
    first.inert=current>.3;second.inert=current<.94;
    first.setAttribute('aria-hidden',String(first.inert));second.setAttribute('aria-hidden',String(second.inert));
    const onscreen=rect.bottom>height*.1&&rect.top<height;
    const revealed=ready&&(current>.94||(branchesVisible&&current>.01))&&onscreen;
    branchesVisible=revealed;
    // The introduction now leaves with the page itself, without a pinned clone or matte.
    branches.setVisible(revealed);branches.setExitProgress(1-current);
    second.classList.toggle('is-revealed',revealed);
    stage.classList.toggle('is-offscreen',!onscreen);
    dissolves.forEach(({section,image})=>{const box=section.getBoundingClientRect();image.style.opacity=motion.matches?'1':String(smooth(.05,.95,1-box.top/height));});
    if(current!==target)frame=requestAnimationFrame(update);
  }
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(update);};
  function goTo(target) {
    if(journey.contains(document.activeElement))document.activeElement.blur();
    if(target==='contact'){disposePopup?.();disposePopup=createContactPopup();return;}
    const top=homeTargetTop(document,target,window.scrollY);
    if(top!==null)scrollToPage(top);
  }
  journey.addEventListener('click',event=>{
    const destination=event.target.closest('[data-home-target]');
    if(!destination)return;
    if(event.button>0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
    event.preventDefault();
    goTo(destination.dataset.homeTarget);
  },{signal});
  window.addEventListener('scroll',()=>{direction=window.scrollY>=lastScroll?1:-1;lastScroll=window.scrollY;schedule();clearTimeout(settleTimer);if(!scrollFrame)settleTimer=setTimeout(settle,180);},{passive:true,signal});
  const wheelGate=createJourneyWheelGate();
  const pageStops=()=>{
    const origin=startTop(),topOf=el=>el.getBoundingClientRect().top+window.scrollY-origin;
    const ending=document.querySelector('.work-ending');
    const stops=[0,stage.clientHeight,...[...document.querySelectorAll('.home-work .film-experience')].map(topOf)];
    if(ending){stops.push(topOf(ending));stops.push(topOf(ending)+ending.offsetHeight-ending.querySelector('.work-ending-stage').clientHeight);}
    return stops;
  };
  window.addEventListener('wheel',e=>{
    const now=performance.now(),y=window.scrollY-startTop(),h=stage.clientHeight;
    const panel=e.target.closest?.('.branch-panel');
    const blocked=e.ctrlKey||!!document.querySelector('dialog[open]')||(panel&&panel.scrollHeight>panel.clientHeight+1);
    if(blocked||Math.abs(e.deltaX)>Math.abs(e.deltaY)||!e.deltaY)return;
    const result=wheelGate({now,y,height:h,deltaX:e.deltaX,deltaY:e.deltaY,deltaMode:e.deltaMode,stops:pageStops(),blocked});
    if(result.prevent)e.preventDefault();
    if(result.page!==undefined){
      clearTimeout(settleTimer);direction=Math.sign(e.deltaY);
      scrollToPage(startTop()+result.top);
    }
  },{passive:false,signal});
  let previousStageHeight=stage.clientHeight;
  window.addEventListener('resize',()=>{
    const y=window.scrollY-startTop(),ratio=y/previousStageHeight;
    const height=stage.clientHeight;
    if(height!==previousStageHeight&&ratio>=0&&ratio<=1.05){
      cancelAnimationFrame(scrollFrame);scrollFrame=0;clearTimeout(settleTimer);
      window.scrollTo({top:startTop()+Math.min(1,ratio)*height,behavior:'instant'});
    }
    previousStageHeight=height;schedule();branches.resize();
  },{passive:true,signal});
  motion.addEventListener('change',()=>{schedule();branches.resize();},{signal});
  Promise.allSettled([
    ...[...journey.querySelectorAll('.identity-photo-plane img')].map(img=>img.decode()),
    document.fonts.load('24px ForestTrail'),
    document.fonts.load('24px Chalkduster'),
  ]).then(()=>{if(!signal.aborted){ready=true;schedule();}});
  update();
  return ()=>{disposePopup?.();clearTimeout(settleTimer);controller.abort();cancelAnimationFrame(frame);cancelAnimationFrame(scrollFrame);branches.destroy();dissolves.forEach(({image,underlay})=>{image.style.opacity='';underlay.remove();});};
}
