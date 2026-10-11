import { initHomeReload } from './home-navigation.js?v=3186b3b9ca82';
import { startVisitorSession, getVisitorStats } from './visitors.js?v=3186b3b9ca82';
import { openBooklet } from './intro-media.js?v=3186b3b9ca82';
import { contactScrollTop } from './contact.js?v=3186b3b9ca82';
import { renderWorkShowcase, renderWorkDetail, initWorkShowcase } from './work-showcase.js?v=3186b3b9ca82';
import { initHomeJourney } from './home-journey.js?v=3186b3b9ca82';
import { profile, cover, roles, projects, photography, reviews } from './content.js?v=3186b3b9ca82';

const lang = 'en';
let activeFilter = 'all';
let gallery = [], frameIndex = 0;
let cleanupHomeJourney = () => {};
let cleanupWork = () => {};
const $ = (s) => document.querySelector(s);
const t = (value) => typeof value === 'object' ? value[lang] || value.zh : value;
const l = (zh,en) => lang === 'zh' ? zh : en;
const esc = (value='') => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeUrl = (value='') => /^(https?:\/\/|\/(?!\/))/.test(value) ? esc(value) : '';
const arrow = '<span aria-hidden="true">↗</span>';
const demo = () => `<span class="demo-note"><i></i>${l('概念预览 · 图文均为示例','CONCEPT PREVIEW · PLACEHOLDER CONTENT')}</span>`;
const pageHeading = (number,eyebrow,title,description,tag='h1') => `<div class="page-heading"><div class="eyebrow">${number} / ${eyebrow}</div><${tag}>${title}</${tag}><p>${description}</p></div>`;

function chrome(route) {
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  $('#header').innerHTML = `<a class="brand" data-home-reload href="/LiXiangXiang/v2/" aria-label="Between Frames — ${l('首页','Home')}"><span class="brand-icon">[<i></i>]</span><span>BETWEEN<br>FRAMES<span class="brand-dot">®</span></span></a><nav aria-label="${l('主导航','Main navigation')}"><a class="${route.startsWith('/work')?'active':''}" href="#/work">${l('作品','Work')}<sup>05</sup></a><a class="${route==='/about'?'active':''}" href="#/about">${l('关于我','About')}</a><a class="${route==='/footprints'?'active':''}" href="#/footprints">${l('足迹','Footprints')}</a></nav>`;
  $('#footer').innerHTML = `<div class="footer-top"><div><span class="eyebrow">LET’S MAKE SOMETHING MEANINGFUL.</span><p>${l('下一个故事，<em>由此开始。</em>','Every story starts<br>with <em>a conversation.</em>')}</p></div>${profile.email ? `<a class="contact-link" href="mailto:${esc(profile.email)}">${esc(profile.email)} ${arrow}</a>` : `<div class="contact-pending">${l('联系邮箱 · 待添加','Contact email · coming soon')}<span>${l('期待下一次相遇','Until our next encounter')}</span></div>`}</div><div class="footer-bottom"><span>© ${new Date().getFullYear()} ${esc(t(profile.name))} · BETWEEN FRAMES</span><a href="#/credits">${l('示例素材说明','Placeholder credits')}</a><button data-action="top">BACK TO TOP ↑</button></div>`;
}

function home() {
  return `<section class="home-journey" aria-label="Introduction"><div class="journey-stage">
    <div class="journey-cover-layer"><section class="cover" aria-label="李想想 — ${esc(cover.slogan)}">
      <img class="cover-background" src="${safeUrl(cover.background)}" alt="" fetchpriority="high">
      <a class="cover-corner cover-wordmark" data-home-reload href="/LiXiangXiang/v2/" aria-label="李想想 · Home"><span class="corner-float"><span class="cover-art signature-art"><img src="${safeUrl(cover.signature)}" alt="" width="260" height="211"></span></span></a>
      <a class="cover-corner cover-me" href="#/about" data-home-target="roles"><span class="corner-float">Me</span></a>
      <h1 class="cover-name"><span class="cover-art name-art"><img src="${safeUrl(cover.nameLogo)}" alt="${esc(cover.name)}" width="444" height="333"></span></h1>
      <p class="cover-slogan">THE LOVE &amp; HOPE<br>SHALL NEVER DIE.</p>
      <a class="cover-corner cover-work" href="#/work" data-home-target="work" data-cover-filter="all"><span class="corner-float">My Work</span></a>
      <a class="cover-corner cover-contact" href="#/contact" data-home-target="contact"><span class="corner-float">Contact Me</span></a>
    </section></div>${identityScene()}</div></section><div id="home-work" class="home-work">${works(true)}</div>`;
}

function identityScene() {
  const photoGrid = role => {
    if(role.id==='photography') return `<div class="branch-photos curated-photographs">${photography.map((photo,i)=>`<figure><button data-photo-frame="${i}" aria-label="View photograph: ${esc(photo.caption)}"><img src="${safeUrl(photo.thumb)}" alt="${esc(photo.alt)}" loading="lazy" decoding="async"></button></figure>`).join('')}</div>`;
    if(role.id==='social')return `<div class="branch-photos social-projects"><a href="https://mp.weixin.qq.com/s/5CTA6p-qPmxCg0ntFwFcBQ" target="_blank" rel="noopener noreferrer"><img src="/LiXiangXiang/assets/intro/volunteer-teaching.webp" alt="Xiang Li with children during volunteer teaching" loading="lazy"><span>Volunteer teaching ↗</span></a>${['Watching while Eating','feel it'].map((title,i)=>`<button type="button" data-booklet="${i+1}"><img src="/LiXiangXiang/assets/intro/booklets/booklet-${i+1}.jpg" alt="${title} booklet cover" loading="lazy"><span>${title} ↗</span></button>`).join('')}</div>`;
    if(role.id==='digital')return `<div class="branch-photos digital-projects"><a href="https://github.com/Ol1iv3r/sparse-video-lab" target="_blank" rel="noopener noreferrer"><img src="/LiXiangXiang/assets/intro/comparison.gif" alt="Sparse Video Lab model comparison" loading="lazy"><span>Sparse Video Lab ↗</span></a><button type="button" data-intro-gif><img src="/LiXiangXiang/assets/intro/fei-meadow-refined.webp" alt="Character and dog running in a meadow — 3D animation" loading="lazy"><span>Meadow animation ⤢</span></button></div>`;
    return `<div class="branch-photos">${role.photos.map((src,i)=>`<figure><button type="button" data-intro-role="${role.id}" data-intro-index="${i}" aria-label="Enlarge ${role.id==='me'?'personal photograph':'selected film still'} ${i+1}"><img src="${safeUrl(src)}" alt="${role.id==='me'?'Xiang Li — personal photograph':'Selected film still'} ${i+1}" loading="lazy"></button></figure>`).join('')}</div>`;
  };
  const copy = role => `<div class="branch-copy">${role.paragraphs.map(text=>`<p>${esc(text).replaceAll('\n','<br>')}</p>`).join('')}</div>`;
  const action = role => role.cta==='work' ? `<a class="branch-cta work-cta" href="#/work" data-home-target="work" data-cover-filter="all">See more at “My Work” →</a>` : role.cta==='instagram' ? `<a class="branch-cta" href="${safeUrl(cover.instagram)}" target="_blank" rel="noopener noreferrer" aria-label="See more photographs on Instagram (opens in a new tab)">see more photographs →</a>` : '';
  return `<section class="identity-stage" aria-label="About me — four creative practices" inert aria-hidden="true">
    <div class="identity-photo-plane identity-background"><img src="${safeUrl(cover.aboutBackground)}" alt="" class="about-background"></div>
    <div class="identity-shade" aria-hidden="true"></div>
    <a class="identity-home" href="/LiXiangXiang/v2/" data-home-reload aria-label="Back to home"><span class="cover-art signature-art"><img src="${safeUrl(cover.signature)}" alt="" width="260" height="211"></span></a>
    <a class="identity-work-link" href="#/work" data-home-target="work"><span>View My Recent Work</span><svg viewBox="0 0 24 28" fill="none" aria-hidden="true"><path d="M12 3v20m-6-6 6 6 6-6" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/></svg></a>
    ${roles.map(role=>`<article class="role-branch branch-${esc(role.id)}" data-role="${esc(role.id)}">
      <button class="branch-trigger" aria-expanded="false" aria-controls="branch-${esc(role.id)}-panel"><span class="branch-float">${esc(role.title).replaceAll('\n','<br>')}</span></button>
      ${role.id==='me' ? `<span class="hover-guide" aria-hidden="true"><svg viewBox="0 0 26 32" fill="none"><path d="M3 2v23l6-7 5 11 4-2-5-10h10L3 2Z" fill="currentColor" stroke="#302f28" stroke-width="1.3" stroke-linejoin="round"/></svg></span>` : ''}
      <div class="branch-panel" id="branch-${esc(role.id)}-panel" role="region" aria-label="${esc(role.title.replaceAll('\n',' '))}" inert aria-hidden="true">
        ${role.id==='digital' ? copy(role)+photoGrid(role) : photoGrid(role)+copy(role)}${action(role)}
      </div>
    </article>`).join('')}
  </section>`;
}

function updateEmbeddedWork(filter) {
  activeFilter = filter;
  const section = $('#home-work');
  if (section) { cleanupWork(); section.innerHTML = works(true); mountWork(); }
}

async function enterCover() {
  const element = $('.cover');
  if (!element) return;
  // Start the sequence only after the supplied artwork is decoded.
  await Promise.allSettled([...element.querySelectorAll('img')].map(img=>img.decode()));
  if (!element.isConnected) return;
  requestAnimationFrame(()=>{ if (element.isConnected) {element.classList.add('is-ready');element.closest('.journey-stage').classList.add('is-ready');} });
}

function works(embedded = false) {
  return renderWorkShowcase({lang,embedded});
}
function projectPage(p) {
  return renderWorkDetail(p,{lang});
}
function mountWork() {
  cleanupWork();
  cleanupWork=initWorkShowcase($('.work-showcase'),{lang,onFrame:(frames,index)=>{gallery=frames;showFrame(index);}});
}

function about() {
  gallery = photography;
  return `<section class="section page-section">${pageHeading('02','BEHIND THE CAMERA',l('关于<em>我。</em>','A little <em>about me.</em>'),l('创作者，也是一个始终好奇的观察者。','A maker of images. An observer, always curious.'))}<div class="about-intro"><div class="portrait-placeholder"><img src="/LiXiangXiang/assets/hero.jpg" alt="${l('人物形象占位：海边背影','Portrait placeholder: a figure by the sea')}"><span>${l('个人照片待替换','YOUR PORTRAIT HERE')}</span></div><div class="biography"><div class="eyebrow">HELLO, I’M</div><h2>${esc(t(profile.name))}<span class="accent">.</span></h2><p class="bio-lead">${esc(t(profile.introduction))}</p><p class="muted">${esc(t(profile.biography))}</p><div class="tags"><span>FILMMAKING</span><span>PHOTOGRAPHY</span><span>VISUAL EXPLORATION</span></div>${profile.cv && safeUrl(profile.cv)?`<a class="text-link" href="${safeUrl(profile.cv)}" target="_blank" rel="noopener">${l('查看履历','View CV')} ↗</a>`:''}<small class="muted">${l('个人简介示例 · 待填入真实经历','Biography placeholder · replace with your own story')}</small></div></div><div class="goal-block"><span class="eyebrow">LOOKING FORWARD / ${l('我的目标','MY ASPIRATIONS')}</span><div><h2>${l('带着问题，<em>继续向前。</em>','Moving forward,<br><em>with questions.</em>')}</h2><p>${esc(t(profile.goal))}</p></div></div><section class="photo-section"><div class="section-top"><div><div class="eyebrow">OBSERVATIONS / PHOTOGRAPHY</div><h2>${l('日常的<em>切片。</em>','Fragments of <em>the everyday.</em>')}</h2></div><span class="eyebrow">FILM PHOTOGRAPHY</span></div><div class="photo-grid">${photography.map((frame,i)=>`<button data-frame="${i}" aria-label="${esc(t(frame.caption))}"><img loading="lazy" src="${safeUrl(frame.src)}" alt="${esc(t(frame.caption))}"><span>OBSERVATION / ${String(i+1).padStart(2,'0')} ↗</span></button>`).join('')}</div></section><section class="reviews-section"><div class="section-top"><div><div class="eyebrow">NOTES FROM THE DARK / FILM JOURNAL</div><h2>${l('散场<em>之后。</em>','After <em>the credits.</em>')}</h2></div><p class="muted">${l('关于喜爱的电影，以及它们留下的痕迹。','On the films I love, and what they leave behind.')}</p></div>${reviews.map((review,i)=>`<details class="review"><summary><span class="eyebrow">0${i+1} / ${esc(t(review.topic))}</span><h3>${esc(t(review.title))}</h3><span class="plus">+</span></summary><div><span class="pending-label">${l('影评示例位置 · 电影名称待添加','Journal placeholder · film title to be added')}</span><p>${esc(t(review.text))}</p></div></details>`).join('')}</section>${demo()}</section>`;
}

function worldMap() {
  // Schematic world silhouette; no visitor markers are fabricated.
  return `<svg class="world-map" viewBox="0 0 1000 490" role="img" aria-label="${l('世界地图示意，目前没有已验证的访客地区','Schematic world map, no verified visitor locations yet')}"><defs><pattern id="dots" width="7" height="7" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.5" fill="#626962"/></pattern></defs><g fill="url(#dots)"><path d="M75 98l55-39 90-15 78 28 42 49-25 36-59 9-19 51-38 19-5 41-39-19-21-53-46-23-13-51zm185 173 46 13 39 48-13 53-28 30-20 40-22-40-5-62-29-35zM350 40l43-13 30 18-10 42-32 27-23-28zM439 108l34-29 44 1 29 27-12 26-43-1-8 35-39 6-18-24zM444 181l51-24 61 14 42 43-24 34-8 46-35 51-25-12-9-44-37-23-12-40-30-19zM535 91l39-31 122-13 115 17 75 37 38 43-38 26-40-12-14 53-42 35-15-45-46 7-30 46-40-31-10-38-57-15-17-46-41 9zM743 260l27-16 23 22 47 11-5 18-46-10zM789 334l42-30 53 7 33 42-17 31-65 5-46-26zM939 382l10 5-11 33-13 4zM120 461l184-9 186 5 143-5 162 9 61 13H131z"/></g><g stroke="#535851" stroke-width=".5" fill="none" opacity=".25"><path d="M20 245h960M500 15v460"/><ellipse cx="500" cy="245" rx="480" ry="225"/></g></svg>`;
}

function footprints() {
  return `<section class="section page-section footprints-page">${pageHeading('03','SMALL WORLD, REAL CONNECTIONS',l('很高兴，<em>在这里遇见你。</em>','Glad you <em>found your way here.</em>'),l('影像让我们跨越距离。这一页，留给来自世界各处的目光。','Images cross distances. This page is for the people on the other side of the screen.'))}<div class="map-panel"><span class="eyebrow map-label">A MAP OF OUR ENCOUNTERS</span>${worldMap()}<div class="map-message"><i></i><span id="visitor-status">${l('正在读取真实统计状态…','Checking verified visitor data…')}</span></div></div><div class="visitor-stats"><div><strong id="region-count">—</strong><span>${l('已记录的国家与地区','Countries & regions recorded')}</span></div><div><strong id="visit-count">—</strong><span>${l('已验证访问','Recorded visits')}</span></div><p>${l('只记录真实的相遇。<br>本地预览不推测访客的位置。','Only real encounters.<br>Local preview never guesses a visitor’s location.')}</p></div><div id="region-list"></div><div class="privacy-note"><span>↳</span><p>${l('访客统计将在正式上线并连接统计服务后启用。当前没有收集访问位置，也没有模拟数字。未来只展示国家／地区层级的汇总数据。','Country/region totals are stored across visits. No IP addresses or precise locations are stored. A browser session counts once within 30 minutes.')}</p></div></section>`;
}

function credits() {
  return `<section class="section page-section credits-page">${pageHeading('—','ABOUT THIS PREVIEW',l('素材与<em>说明。</em>','About this <em>preview.</em>'),l('这是一份等待真实故事的作品集框架。','A portfolio framework, waiting for your real stories.'))}<div class="prose"><h2>${l('内容状态','Content status')}</h2><p>${l('目前的作品名称、简介、创作理念与个人陈述均为版式示例，不代表真实履历、个人创作或申请材料。正式提交前，请替换为你自己的作品与经历。','Project titles, descriptions, creative statements, and biography are layout placeholders. They do not represent a real creative history or application. Replace them with your own material before submitting.')}</p><h2>${l('影像素材','Visual assets')}</h2><p>${l('封面背景、Logo 与 slogan 均使用你提供的素材。内页其他摄影仍为占位素材。来源说明见项目 ASSETS.md。','The cover background, logo, and slogan use your supplied assets. Other images on inner pages remain placeholders. Sources are listed in ASSETS.md.')}</p><h2>${l('访客隐私','Visitor privacy')}</h2><p>${l('本地版本不使用分析 Cookie，不调用 IP 地理定位，不采集位置。浏览器只在本地保存语言偏好。访客统计接口默认返回未连接状态。','Local previews are not counted. The public website stores country/region totals without saving IP addresses or precise locations. A random browser session ID prevents duplicate counts within 30 minutes.')}</p></div><a class="text-link" href="#/">${l('回到首页','Back home')} ↗</a></section>`;
}

async function loadVisitors() {
  try {
    const data = await getVisitorStats();
    if (!$('#visitor-status')) return;
    if (data.status !== 'connected') {
      $('#visitor-status').textContent = l('等待第一次远方的相遇 · 统计尚未连接','Waiting for our first encounter · analytics not connected');
      return;
    }
    const regions = Array.isArray(data.regions) ? data.regions.filter(r=>typeof r.name==='string'&&Number.isSafeInteger(r.visits)&&r.visits>0) : [];
    $('#region-count').textContent = String(regions.length);
    $('#visit-count').textContent = Number.isSafeInteger(data.visits)&&data.visits>=0 ? String(data.visits) : '—';
    $('#visitor-status').textContent = l('真实汇总数据 · 不显示精确位置','Verified aggregate data · no precise locations');
    $('#region-list').innerHTML = regions.map(r=>`<div class="region-row"><span>${esc(r.name)}</span><span>${r.visits}</span></div>`).join('');
  } catch {
    if ($('#visitor-status')) $('#visitor-status').textContent = l('统计暂时无法读取 · 未显示模拟数据','Statistics unavailable · no simulated data shown');
  }
}

function render({scroll=true}={}) {
  cleanupHomeJourney();
  cleanupHomeJourney = () => {};
  cleanupWork();
  cleanupWork = () => {};
  if ($('#lightbox').open) $('#lightbox').close();
  const route = location.hash.slice(1) || '/';
  const journeyRoute=['/','/about','/work','/work/all','/contact'].includes(route);
  document.body.classList.toggle('cover-page', journeyRoute);
  document.body.classList.toggle('work-page', route.startsWith('/work')||route==='/contact');
  chrome(route);
  gallery = [];
  let content, title;
  if (journeyRoute) {content=home();title=route==='/contact'?'Contact':route.startsWith('/work')?'Selected works':l('影像作品集','Film portfolio');}
  else if (route==='/footprints') { content=footprints(); title=l('真实足迹','Footprints'); }
  else if (route==='/credits') { content=credits(); title=l('素材说明','Credits'); }
  else {
    const p = projects.find(p=>route===`/work/${p.id}`);
    if(p) { content=projectPage(p); title=t(p.title); }
    else { content=`<section class="section page-section">${pageHeading('404','OUT OF FRAME',l('这一帧，<em>走丢了。</em>','This frame <em>is missing.</em>'),l('你可以返回作品目录，继续浏览。','Find your way back to the film index.'))}<a class="primary-link" href="#/work">${l('浏览作品','Explore works')} ↗</a></section>`; title='404'; }
  }
  $('#main').innerHTML=content;
  document.title=route==='/' ? `${cover.name} — ${cover.slogan}` : `${title} — Between Frames`;
  if(scroll) { window.scrollTo({top:0,behavior:'instant'}); $('#main').focus({preventScroll:true}); }
  mountWork();
  if(route==='/footprints') loadVisitors();
  if(journeyRoute) {
    cleanupHomeJourney = initHomeJourney();
    enterCover();
    const align=()=>{
      if(!$('.home-journey')||(location.hash.slice(1)||'/')!==route)return;
      const anchor=route==='/work/all'?$('#all-work'):route==='/contact'?$('#contact'):route==='/work'?$('#home-work'):$('.home-journey');
      const top=route==='/contact'?contactScrollTop(anchor):anchor.getBoundingClientRect().top+window.scrollY+(route==='/about'?$('.journey-stage').clientHeight:0);
      window.scrollTo({top,behavior:'instant'});
    };
    align();requestAnimationFrame(align);
  }

}

function showFrame(index) {
  if(!gallery.length) return;
  frameIndex=(index+gallery.length)%gallery.length;
  const frame=gallery[frameIndex];
  $('#lightbox-image').src=frame.src;
  $('#lightbox-image').alt=t(frame.caption);
  $('#lightbox-caption').textContent=`${String(frameIndex+1).padStart(2,'0')} / ${String(gallery.length).padStart(2,'0')} — ${t(frame.caption)}`;
  if(!$('#lightbox').open) $('#lightbox').showModal();
}

document.addEventListener('click',event=>{
  if (event.defaultPrevented) return;
  const booklet=event.target.closest('[data-booklet]');
  if(booklet){openBooklet(Number(booklet.dataset.booklet),booklet);return;}
  const introPhoto=event.target.closest('[data-intro-role]');
  if(introPhoto){const role=roles.find(r=>r.id===introPhoto.dataset.introRole);gallery=role.photos.map((src,i)=>({src,caption:role.id==='me'?`Xiang Li — ${i+1}`:`Selected film still — ${i+1}`}));showFrame(Number(introPhoto.dataset.introIndex));return;}
  if(event.target.closest('[data-intro-gif]')){gallery=[{src:'/LiXiangXiang/assets/intro/fei-meadow-refined.webp',caption:'Meadow animation'}];showFrame(0);return;}
  const coverFilter = event.target.closest('[data-cover-filter]');
  if (coverFilter) activeFilter = coverFilter.dataset.coverFilter;
  if(event.target.closest('.skip-link')) {
    event.preventDefault();
    $('#main').focus();
    $('#main').scrollIntoView();
    return;
  }
  const action=event.target.closest('[data-action]')?.dataset.action;
  if(action==='top') window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  const filter=event.target.closest('[data-filter]');
  if(filter) {
    activeFilter=filter.dataset.filter;
    if ($('#home-work')) updateEmbeddedWork(activeFilter); else render({scroll:false});
    $(`[data-filter="${activeFilter}"]`).focus();
  }
  const photo=event.target.closest('[data-photo-frame]');
  if(photo){gallery=photography;showFrame(Number(photo.dataset.photoFrame));}
  const frame=event.target.closest('[data-frame]');
  if(frame) showFrame(Number(frame.dataset.frame));
});
$('.lightbox-close').addEventListener('click',()=>$('#lightbox').close());
$('.lightbox-prev').addEventListener('click',()=>showFrame(frameIndex-1));
$('.lightbox-next').addEventListener('click',()=>showFrame(frameIndex+1));
$('#lightbox').addEventListener('click',event=>{if(event.target===$('#lightbox')) $('#lightbox').close();});
document.addEventListener('keydown',event=>{
  if(!$('#lightbox').open) return;
  if(event.key==='ArrowLeft') {event.preventDefault();showFrame(frameIndex-1);}
  if(event.key==='ArrowRight') {event.preventDefault();showFrame(frameIndex+1);}
});
history.scrollRestoration='manual';
initHomeReload(document,window);
window.addEventListener('hashchange',()=>render());
window.addEventListener('pageshow',event=>{ if(event.persisted && (!location.hash || location.hash==='#/')) render(); });
startVisitorSession();
render();
