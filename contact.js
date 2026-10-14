import {profile,cover} from './content.js?v=d988f26c526f';
import {getVisitorStats} from './visitors.js?v=d988f26c526f';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function renderContact(){return `<section id="contact" class="contact-section" aria-label="Contact me"><button class="contact-close" data-contact-close aria-label="Close contact">×</button><div class="contact-layout"><div class="contact-info"><h2 class="contact-name"><img src="${cover.nameLogo}" alt="李想想"></h2><a class="contact-row" href="mailto:${esc(profile.email)}"><small>Email</small><span>${esc(profile.email)}</span><b>↗</b></a><a class="contact-row" href="${cover.instagram}" target="_blank" rel="noopener noreferrer"><small>Instagram</small><span>@yrdzz_</span><b>↗</b></a><a class="contact-row" href="${profile.linkedin}" target="_blank" rel="noopener noreferrer"><small>LinkedIn</small><span>Xiang Li</span><b>↗</b></a><div class="contact-row contact-phones"><small>Phone</small><div>${profile.phones.map(phone=>`<a href="tel:${phone.replace(/ /g,'')}">${esc(phone)} ↗</a>`).join('')}</div></div></div><aside class="contact-visitors" aria-label="Visitor regions"><div class="contact-map-slot"><div class="contact-map"><svg class="world-map" viewBox="0 0 1000 490" role="img" aria-label="Visitor regions map"><defs><pattern id="contact-dots" width="7" height="7" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.5" fill="#626962"/></pattern></defs><g fill="url(#contact-dots)"><path d="M75 98l55-39 90-15 78 28 42 49-25 36-59 9-19 51-38 19-5 41-39-19-21-53-46-23-13-51zm185 173 46 13 39 48-13 53-28 30-20 40-22-40-5-62-29-35zM350 40l43-13 30 18-10 42-32 27-23-28zM439 108l34-29 44 1 29 27-12 26-43-1-8 35-39 6-18-24zM444 181l51-24 61 14 42 43-24 34-8 46-35 51-25-12-9-44-37-23-12-40-30-19zM535 91l39-31 122-13 115 17 75 37 38 43-38 26-40-12-14 53-42 35-15-45-46 7-30 46-40-31-10-38-57-15-17-46-41 9zM743 260l27-16 23 22 47 11-5 18-46-10zM789 334l42-30 53 7 33 42-17 31-65 5-46-26zM939 382l10 5-11 33-13 4zM120 461l184-9 186 5 143-5 162 9 61 13H131z"/></g><g stroke="#535851" stroke-width=".5" fill="none" opacity=".25"><path d="M20 245h960M500 15v460"/><ellipse cx="500" cy="245" rx="480" ry="225"/></g><g data-country-markers></g></svg><div class="visitor-country-list"></div></div></div><div class="contact-region-stat"><strong data-contact-regions hidden></strong><button type="button" class="visitor-map-trigger" aria-label="Enlarge visitor regions map" aria-expanded="false">visitor regions</button></div><div class="contact-region-list"></div></aside></div></section>`;}
export function contactScrollTop(root){
 const ending=root?.closest('.work-ending');
 return ending?ending.getBoundingClientRect().top+window.scrollY+ending.offsetHeight-ending.querySelector('.work-ending-stage').clientHeight:0;
}
export function initContact(root){
 if(!root)return()=>{};
 const c=new AbortController(),{signal}=c,ending=root.closest('.work-ending'),stage=ending?.querySelector('.work-ending-stage');
 let frame=0,mapTimer=0;
 const visitors=root.querySelector('.contact-visitors'),map=visitors.querySelector('.contact-map'),mapTrigger=visitors.querySelector('.visitor-map-trigger');
 const showMap=open=>{clearTimeout(mapTimer);visitors.classList.toggle('is-map-open',open);mapTrigger.setAttribute('aria-expanded',String(open));};
 const closeMapSoon=()=>{clearTimeout(mapTimer);mapTimer=setTimeout(()=>showMap(false),260);};
 let mapHoverRegion='';
 document.addEventListener('pointermove',e=>{
  if(e.pointerType==='touch')return;
  const region=mapTrigger.contains(e.target)?'trigger':visitors.classList.contains('is-map-open')&&map.contains(e.target)?'map':'';
  if(region===mapHoverRegion)return;
  mapHoverRegion=region;clearTimeout(mapTimer);
  if(region==='trigger')mapTimer=setTimeout(()=>showMap(true),350);
  else if(region==='map')clearTimeout(mapTimer);
  else closeMapSoon();
 },{passive:true,signal});
 mapTrigger.addEventListener('click',()=>showMap(!visitors.classList.contains('is-map-open')),{signal});
 mapTrigger.addEventListener('focus',()=>{if(mapTrigger.matches(':focus-visible'))showMap(true);},{signal});
 mapTrigger.addEventListener('blur',()=>showMap(false),{signal});
 visitors.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();showMap(false);}},{signal});
 const update=()=>{frame=0;if(!ending)return;const distance=-ending.getBoundingClientRect().top,hold=stage.clientHeight*.55;const progress=Math.min(1,Math.max(0,(distance-hold)/(ending.offsetHeight-stage.clientHeight-hold)));
  root.style.transform=`translateY(${(1-progress)*102}%)`;root.inert=progress<.05;root.setAttribute('aria-hidden',String(progress<.05));stage.style.setProperty('--contact-progress',progress);
 };
 const schedule=()=>{if(!frame)frame=requestAnimationFrame(update);};
 window.addEventListener('scroll',schedule,{passive:true,signal});window.addEventListener('resize',schedule,{passive:true,signal});
 if(ending)root.querySelector('[data-contact-close]').addEventListener('click',()=>window.scrollTo({top:ending.getBoundingClientRect().top+window.scrollY,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'}),{signal});
 const status=root.querySelector('.contact-region-list');
 status.textContent='Loading visits…';
 const refresh=()=>getVisitorStats().then(data=>{
  if(signal.aborted)return;
  if(data?.status!=='connected'){status.textContent='Statistics not connected';return;}
  const regions=(Array.isArray(data.regions)?data.regions:[]).filter(r=>typeof r.name==='string'&&Number.isSafeInteger(r.visits)&&r.visits>0);
  const count=root.querySelector('[data-contact-regions]');count.hidden=false;count.textContent=regions.length;
  status.textContent=`${data.visits} ${data.visits===1?'visit':'visits'} · since 10 Oct 2026`;
  status.title='Country/region totals · one visit per 30-minute browser session. No precise location is stored.';
  renderVisitorCountries(root,regions);
 }).catch(()=>{if(!signal.aborted)status.textContent='Statistics temporarily unavailable';});
 refresh();
 const refreshTimer=setInterval(()=>{if(!document.hidden)refresh();},60000);
 update();return()=>{c.abort();clearInterval(refreshTimer);clearTimeout(mapTimer);cancelAnimationFrame(frame);};
}

const countryCenters={CN:[35,105],HK:[22.3,114.2],US:[38,-97],GB:[54,-2],FR:[46,2],DE:[51,10],JP:[36,138],KR:[36,128],SG:[1.35,103.8],AU:[-25,134],CA:[57,-106],IN:[22,79],IT:[42,12],ES:[40,-4],BR:[-14,-52],RU:[61,100],NZ:[-41,174],TW:[23.7,121],MY:[4,102],TH:[15,101],ID:[-2,118],PH:[13,122],VN:[16,108],NL:[52,5],SE:[62,15],CH:[47,8],AE:[24,54],ZA:[-29,24],MX:[23,-102]};
function renderVisitorCountries(root,regions){
 const ns='http://www.w3.org/2000/svg',pins=root.querySelector('[data-country-markers]'),list=root.querySelector('.visitor-country-list');
 pins.replaceChildren();list.replaceChildren();
 for(const region of regions){
  const row=document.createElement('span');row.textContent=`${region.name} · ${region.visits}`;list.append(row);
  const fallback=countryCenters[String(region.countryCode||region.code||'').toUpperCase()];
  const lat=Number.isFinite(region.latitude)?region.latitude:fallback?.[0],lon=Number.isFinite(region.longitude)?region.longitude:fallback?.[1];
  if(!Number.isFinite(lat)||!Number.isFinite(lon)||Math.abs(lat)>90||Math.abs(lon)>180)continue;
  const x=(lon+180)/360*960+20,y=(90-lat)/180*450+20,g=document.createElementNS(ns,'g');
  const circle=document.createElementNS(ns,'circle');circle.setAttribute('cx',x);circle.setAttribute('cy',y);circle.setAttribute('r','5');circle.setAttribute('fill','#dce8c0');
  const label=document.createElementNS(ns,'text');label.setAttribute('x',Math.min(x+9,830));label.setAttribute('y',y-9);label.setAttribute('fill','#f3efe1');label.setAttribute('font-size','13');label.textContent=`${region.name} · ${region.visits}`;
  g.append(circle,label);pins.append(g);
 }
}
export function createContactPopup(){
 const dialog=document.createElement('dialog');dialog.className='home-contact-dialog';dialog.setAttribute('aria-label','Contact me');
 dialog.innerHTML=renderContact().replace('id="contact"','id="home-contact"').replaceAll('contact-dots','home-contact-dots');document.body.append(dialog);
 const cleanup=initContact(dialog.querySelector('.contact-section'));
 dialog.querySelector('[data-contact-close]').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
 dialog.addEventListener('close',()=>{cleanup();dialog.remove();},{once:true});
 dialog.showModal();
 return()=>{cleanup();dialog.remove();};
}
