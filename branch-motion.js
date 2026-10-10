// Titles unfold from the portrait; hover opens the matching composition.
export function initBranchMotion(scene, motion) {
  // Reset on every page initialization; do not persist dismissal across reloads.
  let explored=false;
  scene.classList.toggle('has-explored',explored);
  function dismissGuide() {
    if(explored)return;
    explored=true;
    scene.classList.add('has-explored');
  }
  const controller=new AbortController();
  const {signal}=controller;
  const nodes=[...scene.querySelectorAll('.role-branch')].map(element=>({
    element,id:element.dataset.role,trigger:element.querySelector('.branch-trigger'),panel:element.querySelector('.branch-panel'),
    x:0,y:0,a:0,r:0,vx:0,vy:0,va:0,vr:0,target:{x:0,y:0,a:0,r:0},released:false,
  }));
  const anchors={me:[.597,.085],director:[.08,.12],social:[.038,.48],photography:[.66,.35],digital:[.658,.772]};
  let visible=false,active=null,frame=0,previous=0,exitTimer=0,exitProgress=0;
  let pointer=null,keyboard=false,originRect=null,restoringFocus=false;
  const entranceTimers=new Set();
  const clamp=x=>Math.max(0,Math.min(1,x));
  const compact=()=>scene.clientWidth<=1100||scene.clientHeight<=600;
  const later=(fn,delay)=>{const id=setTimeout(()=>{entranceTimers.delete(id);fn();},delay);entranceTimers.add(id);};

  function paint(node) {
    const remaining=1-exitProgress;
    node.element.style.transform=`translate3d(${node.x*remaining+(scene.clientWidth*.47-node.element.offsetLeft-node.trigger.offsetWidth/2)*exitProgress}px,${node.y*remaining+(scene.clientHeight*.52-node.element.offsetTop)*exitProgress}px,0)`;
    node.element.style.setProperty('--presence',clamp(node.a*remaining));
    node.element.style.setProperty('--unfold',clamp(node.r*(1-exitProgress)));
    node.trigger.tabIndex=visible&&node.released?0:-1;
    node.trigger.style.pointerEvents=visible&&node.a>.85&&exitProgress<.02?'auto':'none';
  }
  function tick(time) {
    const dt=Math.min((time-previous)/1000||1/60,1/30);previous=time;
    let moving=false;
    nodes.forEach(node=>{
      for(const [key,velocity] of [['x','vx'],['y','vy'],['a','va'],['r','vr']]) {
        node[velocity]+=(88*(node.target[key]-node[key])-15*node[velocity])*dt;
        node[key]+=node[velocity]*dt;
        const tolerance=key==='x'||key==='y'?.05:.001;
        if(Math.abs(node.target[key]-node[key])>tolerance||Math.abs(node[velocity])>tolerance) moving=true;
        else {node[key]=node.target[key];node[velocity]=0;}
      }
      paint(node);
    });
    frame=moving?requestAnimationFrame(tick):0;
  }
  function animate() {
    if(motion.matches) {
      cancelAnimationFrame(frame);frame=0;
      nodes.forEach(node=>{Object.assign(node,node.target,{vx:0,vy:0,va:0,vr:0});paint(node);});
    } else if(!frame) {previous=performance.now();frame=requestAnimationFrame(tick);}
  }
  function layout() {
    const w=scene.clientWidth,h=scene.clientHeight,mobile=w<=1100||h<=600;
    nodes.forEach(node=>{
      let x=node.released?0:node.x,y=node.released?0:node.y;
      if(node===active) {
        const anchor=mobile?[.06,.08]:anchors[node.id];
        x=w*anchor[0]-node.element.offsetLeft;y=h*anchor[1]-node.element.offsetTop;
      }
      node.target={x,y,a:visible&&node.released?1:0,r:node===active?1:0};
    });
    animate();
  }
  function activate(node,byKeyboard=false) {
    clearTimeout(exitTimer);exitTimer=0;
    if(node===active) return;
    if(!visible||!node?.released) return;
    dismissGuide();
    originRect=node.trigger.getBoundingClientRect();
    keyboard=byKeyboard;active=node;
    scene.classList.add('has-expanded-branch');
    nodes.forEach(item=>{
      const open=item===node;
      item.element.classList.toggle('is-open',open);
      item.trigger.setAttribute('aria-expanded',String(open));
      item.panel.inert=!open;
      item.panel.setAttribute('aria-hidden',String(!open));
    });
    layout();
  }
  function close(restoreFocus=false) {
    clearTimeout(exitTimer);exitTimer=0;
    const last=active;active=null;originRect=null;
    scene.classList.remove('has-expanded-branch');
    nodes.forEach(node=>{
      node.element.classList.remove('is-open');node.trigger.setAttribute('aria-expanded','false');
      node.panel.inert=true;node.panel.setAttribute('aria-hidden','true');
    });
    if(restoreFocus&&last) {restoringFocus=true;last.trigger.focus({preventScroll:true});restoringFocus=false;}
    layout();
  }
  function setVisible(value) {
    if(value===visible) return;
    visible=value;
    entranceTimers.forEach(clearTimeout);entranceTimers.clear();
    if(!visible) {
      close();cancelAnimationFrame(frame);frame=0;
      nodes.forEach(node=>{node.released=false;node.a=0;node.r=0;paint(node);});
      return;
    }
    const w=scene.clientWidth,h=scene.clientHeight;
    nodes.forEach((node,index)=>{
      const me=node.id==='me';
      node.x=me?0:w*.47-node.element.offsetLeft-node.trigger.offsetWidth/2;
      node.y=me?18:h*.52-node.element.offsetTop;
      node.vx=node.vy=node.va=node.vr=0;node.a=0;node.r=0;paint(node);
    });
    nodes.forEach((node,index)=>{
      const me=node.id==='me';
      const release=()=>{node.released=true;layout();};
      if(motion.matches||me) release();else later(release,280+index*100);
    });
  }
  function exit() {
    entranceTimers.forEach(clearTimeout);entranceTimers.clear();
    close();visible=false;
    const w=scene.clientWidth,h=scene.clientHeight;
    nodes.forEach(node=>{
      node.released=false;
      node.target={x:w*.47-node.element.offsetLeft-node.trigger.offsetWidth/2,y:h*.52-node.element.offsetTop,a:0,r:0};
    });
    animate();
  }
  function safeRegion() {
    if(!active||!pointer) return false;
    const a=active.trigger.getBoundingClientRect(),b=active.panel.getBoundingClientRect(),c=originRect||a;
    // Include the corridor from the old title to its photos so links stay reachable.
    return pointer.x>=Math.min(a.left,b.left,c.left)-24&&pointer.x<=Math.max(a.right,b.right,c.right)+24&&
      pointer.y>=Math.min(a.top,b.top,c.top)-24&&pointer.y<=Math.max(a.bottom,b.bottom,c.bottom)+24;
  }
  function checkExit() {
    if(exitProgress>.01||!active||keyboard||safeRegion()) {clearTimeout(exitTimer);exitTimer=0;return;}
    if(!exitTimer) exitTimer=setTimeout(()=>{exitTimer=0;if(!safeRegion())close();},160);
  }
  document.addEventListener('pointermove',event=>{
    if(event.pointerType==='touch'||compact()||!visible||exitProgress>.01) return;
    pointer={x:event.clientX,y:event.clientY};keyboard=false;
    const trigger=event.target.closest('.branch-trigger');
    const node=nodes.find(n=>n.trigger===trigger);
    if(node) activate(node);else checkExit();
  },{passive:true,signal});
  scene.addEventListener('pointerleave',()=>{if(compact())return;pointer=null;keyboard=false;checkExit();},{signal});
  scene.addEventListener('focusin',event=>{
    const node=nodes.find(n=>n.trigger===event.target);
    if(!restoringFocus&&node&&event.target.matches(':focus-visible')) activate(node,true);
  },{signal});
  scene.addEventListener('focusout',event=>{
    if(keyboard&&active&&!active.element.contains(event.relatedTarget)) {
      const next=nodes.find(n=>n.trigger===event.relatedTarget);
      if(next) activate(next,true);else close();
    }
  },{signal});
  scene.addEventListener('click',event=>{
    // Links are handled by their own navigation, never as a scene/back toggle.
    if(event.target.closest('a')) return;
    if(event.target.closest('.branch-close')) {close(true);return;}
    const node=nodes.find(n=>n.trigger===event.target.closest('.branch-trigger'));
    if(!node) {
      if(active&&!event.target.closest('.branch-panel')) close();
      return;
    }
    if((compact()||matchMedia('(hover: none)').matches)&&node===active) close(true);
    else activate(node,event.detail===0);
  },{signal});
  scene.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&active) {event.preventDefault();close(true);}
  },{signal});
  return {setVisible,close,exit,setExitProgress(value){exitProgress=clamp(value);if(exitProgress>0){clearTimeout(exitTimer);exitTimer=0;}nodes.forEach(paint);},resize:layout,destroy(){controller.abort();cancelAnimationFrame(frame);clearTimeout(exitTimer);entranceTimers.forEach(clearTimeout);}};
}
