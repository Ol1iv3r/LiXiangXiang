import { renderContact, initContact, contactScrollTop } from './contact.js';
import { initWorkArchive } from './work-archive.js';
import { projects, categories, cover } from './content.js';
import { createDocumentReader } from './document-reader.js';
import { createFoldWorkflow } from './fold-workflow.js';

const escape = (v='') => String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const asset = value => /^(\/(?!\/)|https?:\/\/)/.test(value || '') ? escape(value) : '';
export const selectedWorks = () => projects.filter(p => p.showcase);
export const featuredWorks = () => selectedWorks().filter(p => p.featured);
export const chaptersFor = () => ['cover'];
export function youtubeId(value='') {
  if (/^[\w-]{11}$/.test(value)) return value;
  try {
    const url=new URL(value);
    if (!['https:','http:'].includes(url.protocol)) return '';
    const host=url.hostname.replace(/^www\./,'');
    let id='';
    if(host==='youtu.be') id=url.pathname.slice(1);
    if(['youtube.com','m.youtube.com','youtube-nocookie.com'].includes(host)) {
      id=url.pathname==='/watch' ? url.searchParams.get('v') : /^\/(embed|shorts|live)\/([^/]+)$/.exec(url.pathname)?.[2];
    }
    return /^[\w-]{11}$/.test(id || '') ? id : '';
  } catch {return '';}
}
const text = (value,lang) => typeof value==='object' ? value[lang] || value.en || value.zh : value;
const copy = lang => (zh,en) => lang==='zh' ? zh : en;
const labels = {cover:['封面','Cover'],stills:['作品静帧','Stills'],screening:['观看影片','Watch film'],process:['幕后流程','The process']};
const chapterLabel=(key,lang)=>labels[key][lang==='zh'?0:1];
const icon = direction => `<svg viewBox="0 0 32 32" fill="none" aria-hidden="true" class="work-arrow work-arrow-${direction}"><path d="M5 16h22M18 7l9 9-9 9" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const poster = p => p.poster || `/LiXiangXiang/assets/${p.image}.jpg`;

function coverPanel(p,lang,heading) {
  const l=copy(lang),t=v=>escape(text(v,lang));
  const files=p.stills.slice(0,12);
  const titleImage=(source,alt,cls)=>source?`<img class="${cls}" src="${asset(source)}" alt="${escape(alt)}">`:'';
  return `<div class="film-cover-shell" data-film="${escape(p.id)}">
    <div class="film-cover-art"><img src="${asset(p.detailCover || p.cover || `/LiXiangXiang/assets/${p.image}.jpg`)}" alt="" fetchpriority="high"><div class="film-cover-shade"></div></div>
    <a class="film-card-logo" href="/LiXiangXiang/" data-home-reload aria-label="${l('李想想 · 返回首页','Xiang Li · Home')}"><img src="${asset(p.logo||'/LiXiangXiang/assets/cover/signature.png')}" alt=""></a>
    <div class="film-preview-grid" aria-label="${l('作品静帧预览','Film still previews')}">${files.map((frame,i)=>`<button class="film-preview-frame" data-work-frame="${i}" aria-label="${l('放大静帧','Enlarge frame')} ${i+1}"><img src="${asset(frame.src)}" alt="${t(frame.caption)}" loading="lazy"></button>`).join('')}</div>
    <div class="film-card-title"><${heading} class="sr-only">${escape(p.title.en)}</${heading}><div class="film-title-art" aria-label="${escape(p.title.zh)} — ${escape(p.title.en)}">${titleImage(p.titleArt?.zh,p.title.zh,'film-title-cn')}<span class="film-title-en-fallback" lang="en">${escape(p.title.en)}</span></div>
      <p class="film-description">${p.descriptionArt?`<img src="${asset(p.descriptionArt)}" alt="${escape(p.subtitle.en)}">`:`<span lang="en">${escape(p.subtitle.en)}</span>`}</p>
    </div>
    <div class="film-cover-actions"><button class="film-action" data-film-action="watch" aria-label="${l('观看影片','Watch film')}"><span>Watch</span></button><button class="film-action" data-film-action="explore" aria-label="${l('探索作品','Explore work')}"><span>Explore</span></button></div>
  </div>`;
}
function film(p,{lang='en',standalone=false,heading='h2'}={}) {
 return `<section class="film-experience is-cover-active ${standalone?'film-detail-cover':''} ${!p.featured?'film-additional':''}" id="film-${escape(p.id)}" data-project="${escape(p.id)}" aria-label="${escape(p.title.en)}"><div class="film-badge"><span>${escape(p.badge||categories[p.category].en)}</span></div><div class="film-viewport"><section class="film-panel film-panel-cover is-current">${coverPanel(p,lang,heading)}</section></div>${standalone?'<a class="film-detail-close" href="#/work/all" aria-label="Close film details"><span aria-hidden="true">×</span></a>':''}</section>`;
}
function archive(lang) {
  const works=selectedWorks(),current=works[2];
  return `<section class="work-archive" id="all-work" aria-label="All of my work"><div class="archive-top"><a class="archive-logo" href="/LiXiangXiang/" data-home-reload aria-label="李想想 · Home"><img src="${asset(cover.signature)}" alt=""></a><a href="#/contact" data-work-contact>Contact</a></div><div class="archive-carousel" role="region" aria-roledescription="carousel" aria-label="Film collection" tabindex="0"><div class="work-shelf">${works.map((p,i)=>`<a class="shelf-film" href="#/work/${escape(p.id)}" data-archive-card="${i}" aria-label="${escape(p.title.en)}"><div class="shelf-poster"><img src="${asset(p.cover||poster(p))}" alt="${escape(p.title.en)} — film cover" loading="lazy" draggable="false"><span class="shelf-category">${escape(p.badge||categories[p.category].en)}</span><strong class="${p.archiveTitleBilingual?'bilingual-title':'split-title'}"><img class="archive-title-art" src="${asset(p.archiveTitleArt)}" alt="${escape(p.title.zh)}${p.archiveTitleBilingual?` — ${escape(p.title.en)}`:''}">${p.archiveTitleBilingual?'':`<small class="archive-title-en" lang="en">${escape(p.title.en)}</small>`}</strong><span class="shelf-open">↗</span></div></a>`).join('')}</div></div><div class="archive-selection"><span class="archive-selected-category">${escape(current.badge||categories[current.category].en)}</span><h3 class="archive-selected-title">${escape(current.title.en)}</h3></div><div class="archive-continuing"><h2>All of My Work</h2><p aria-label="continuing"><span>continuing</span><span class="continuing-dots" aria-hidden="true"><span>.</span><span>.</span><span>.</span></span></p></div><nav class="archive-navigation" aria-label="Choose a film"><button data-archive-prev aria-label="Previous film">${icon('left')}</button><div class="archive-dots">${works.map((p,i)=>`<button data-archive-select="${i}" aria-label="Select ${escape(p.title.en)}" aria-pressed="${i===2}"><span></span></button>`).join('')}</div><button data-archive-next aria-label="Next film">${icon('right')}</button></nav><div class="archive-bottom"><span>The Love &amp; Hope Shall Never Die</span><span>© ${new Date().getFullYear()} Xiang Li</span></div><span class="archive-announcement sr-only" aria-live="polite"></span></section>`;
}

export function renderWorkShowcase({lang='en',embedded=false}={}) {
  return `<div class="work-showcase">${featuredWorks().map((p,i)=>film(p,{lang,index:i,heading:!embedded&&i===0?'h1':'h2'})).join('')}<div class="work-ending"><div class="work-ending-stage">${archive(lang)}${renderContact()}</div></div></div>`;
}
export function renderWorkDetail(p,{lang='en'}={}) {
  return `<div class="work-showcase work-detail">${film(p,{lang,standalone:true,heading:'h1'})}</div>`;
}

export function initWorkShowcase(root,{lang='en',onFrame}={}) {
  if(!root)return()=>{};
  const controller=new AbortController(),{signal}=controller;
  const motion=matchMedia('(prefers-reduced-motion: reduce)');

  let disposeReader=null;
  let watchDialog=null,watchTrigger=null,watchOpenedByKeyboard=false,watchScroll={x:0,y:0};
  const l=copy(lang);
  function prepareWindow(project,trigger,openedByKeyboard=false) {

    if(!watchDialog){
      watchDialog=document.createElement('dialog');
      watchDialog.className='film-watch-dialog';
      watchDialog.setAttribute('aria-labelledby','film-watch-title');
      watchDialog.innerHTML=`<div class="film-watch-window"><header class="film-watch-header"><div class="film-watch-tools"><button type="button" data-watch-close aria-label="Close window" title="Close" autofocus><span aria-hidden="true">×</span></button><button type="button" data-watch-fullscreen aria-label="Enter fullscreen" title="Enter fullscreen"><span aria-hidden="true">⤢</span></button></div><h2 id="film-watch-title"></h2><span class="film-window-balance" aria-hidden="true"></span></header><div class="film-document-tabs" role="group" aria-label="Choose a document" hidden></div><div class="film-watch-screen"></div></div>`;
      document.body.append(watchDialog);
      const screen=watchDialog.querySelector('.film-watch-screen');
      const fullscreen=watchDialog.querySelector('[data-watch-fullscreen]');
      const windowContent=watchDialog.querySelector('.film-watch-window');
      fullscreen.hidden=!document.fullscreenEnabled||!windowContent.requestFullscreen;
      fullscreen.addEventListener('click',async()=>{
        try {
          if(document.fullscreenElement===windowContent)await document.exitFullscreen();
          else await windowContent.requestFullscreen();
        } catch { /* Keep the almost-fullscreen window usable if the browser declines. */ }
      },{signal});
      document.addEventListener('fullscreenchange',()=>{
        const label=document.fullscreenElement===windowContent?'Exit fullscreen':'Enter fullscreen';
        fullscreen.setAttribute('aria-label',label);fullscreen.title=label;
      },{signal});
      watchDialog.querySelector('[data-watch-close]').addEventListener('click',()=>watchDialog.close(),{signal});
      watchDialog.addEventListener('click',event=>{if(event.target===watchDialog)watchDialog.close();},{signal});
      watchDialog.addEventListener('close',()=>{
        if(document.fullscreenElement===windowContent)document.exitFullscreen().catch(()=>{});
        disposeReader?.();disposeReader=null;
        screen.replaceChildren();
        if(watchTrigger?.isConnected){
          watchTrigger.classList.remove('is-pressed');
          if(watchOpenedByKeyboard)watchTrigger.focus({preventScroll:true});
          else watchTrigger.blur();
        }
        window.scrollTo({left:watchScroll.x,top:watchScroll.y,behavior:'instant'});
        watchTrigger=null;
      },{signal});
    }
    watchTrigger=trigger;
    watchOpenedByKeyboard=openedByKeyboard;
    watchScroll={x:window.scrollX,y:window.scrollY};
    watchDialog.querySelector('h2').textContent=`${project.title.zh} / ${project.title.en}`;
    watchDialog.querySelector('.film-document-tabs').hidden=true;
    watchDialog.classList.remove('is-document-window','is-workflow-window');
    return watchDialog.querySelector('.film-watch-screen');
  }
  function openWorkflow(project,trigger,openedByKeyboard=false) {
    const screen=prepareWindow(project,trigger,openedByKeyboard);
    watchDialog.classList.add('is-workflow-window');
    disposeReader=createFoldWorkflow(screen);
    watchDialog.showModal();
  }
  function openDocuments(project,trigger,openedByKeyboard=false) {
    const screen=prepareWindow(project,trigger,openedByKeyboard);
    watchDialog.classList.add('is-document-window');
    const tabs=watchDialog.querySelector('.film-document-tabs');
    tabs.hidden=false;
    tabs.replaceChildren();
    const reader=createDocumentReader(screen);
    disposeReader=reader.destroy;
    const selectDocument=(doc)=>{
      reader.open(doc);
      tabs.querySelectorAll('button').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.document===doc.id)));
    };
    project.documents.forEach(doc=>{
      const button=document.createElement('button');
      button.type='button';button.textContent=doc.label;button.dataset.document=doc.id;
      button.addEventListener('click',()=>selectDocument(doc),{signal});
      tabs.append(button);
    });
    selectDocument(project.documents[0]);
    watchDialog.showModal();
  }
  function openWatch(project,trigger,openedByKeyboard=false) {
    const id=youtubeId(project?.video);
    if(!id)return;
    const screen=prepareWindow(project,trigger,openedByKeyboard);
    const youtubeOnly=project.videoPlayback==='youtube-only';
    if(youtubeOnly){
      screen.innerHTML=`<div class="film-youtube-cover"><img src="${asset(project.cover||poster(project))}" alt="${escape(project.title.en)} — film still"><div class="film-youtube-copy"><span class="film-youtube-eyebrow">WATCH THE FULL FILM</span><h3>${escape(project.title.en)}</h3><p>${escape(project.videoNotice)}</p><a href="https://www.youtube.com/watch?v=${id}" target="_blank" rel="noopener noreferrer" aria-label="Watch ${escape(project.title.en)} on YouTube (opens in a new tab)">Watch on YouTube <span aria-hidden="true">↗</span></a></div></div>`;
      watchDialog.showModal();
      return;
    }
    const iframe=document.createElement('iframe');
    iframe.src=`https://www.youtube-nocookie.com/embed/${id}?autoplay=0&rel=0&playsinline=1&fs=1&hl=en&origin=${encodeURIComponent(location.origin)}`;
    iframe.title=`${project.title.en} — ${l('影片播放器','Film player')}`;
    iframe.allow='autoplay; encrypted-media; picture-in-picture; fullscreen';
    iframe.allowFullscreen=true;
    iframe.referrerPolicy='strict-origin-when-cross-origin';
    const player=document.createElement('div');player.className='film-player-frame';player.append(iframe);
    const external=document.createElement('a');external.className='film-player-external';external.href=`https://www.youtube.com/watch?v=${id}`;external.target='_blank';external.rel='noopener noreferrer';external.textContent='Open on YouTube ↗';
    screen.replaceChildren(player,external);
    watchDialog.showModal();
  }
  const scrollTo=element=>{if(element)window.scrollTo({top:element.getBoundingClientRect().top+window.scrollY,behavior:motion.matches?'instant':'smooth'});};
  root.addEventListener('click',event=>{
    const contact=event.target.closest('[data-work-contact]');
    if(contact&&root.querySelector('#contact')){event.preventDefault();window.scrollTo({top:contactScrollTop(root.querySelector('#contact')),behavior:motion.matches?'instant':'smooth'});}
    const section=event.target.closest('[data-project]');if(!section)return;
    const project=projects.find(p=>p.id===section.dataset.project);
    const frame=event.target.closest('[data-work-frame]');if(frame)onFrame?.(project.stills,Number(frame.dataset.workFrame));
    const action=event.target.closest('[data-film-action]');if(!action)return;
    if(action.dataset.filmAction==='watch'){
      if(project.videoPlayback==='youtube-only')window.open(project.video,'_blank','noopener,noreferrer');
      else openWatch(project,action,event.detail===0);
    }else if(project.id==='the-fold')openWorkflow(project,action,event.detail===0);
    else if(project.documents?.length)openDocuments(project,action,event.detail===0);
    else onFrame?.(project.stills,0);
  },{signal});
  const disposeArchive=initWorkArchive(root.querySelector('.work-archive'),selectedWorks());
  const disposeContact=initContact(root.querySelector('#contact'));
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>entry.target.classList.toggle('is-page-active',entry.isIntersecting)),{threshold:.12});
  root.querySelectorAll('.film-experience').forEach(section=>observer.observe(section));
  return()=>{disposeContact();disposeArchive();disposeReader?.();controller.abort();observer.disconnect();watchDialog?.remove();};
}
