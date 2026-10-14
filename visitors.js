import {visitorEndpoint} from './visitor-config.js?v=d988f26c526f';
const fallback={status:'not_connected',visits:null,regions:[]};
let recording=Promise.resolve(),cached=null,cachedAt=0,pending=null;
export function sessionFor(storage,now,uuid) {
  let previous;try{previous=JSON.parse(storage.getItem('portfolio-visit'));}catch{}
  if(previous?.expires>now && /^[0-9a-f-]{36}$/i.test(previous.id))return previous;
  const session={id:uuid(),expires:now+30*60*1000};
  try{storage.setItem('portfolio-visit',JSON.stringify(session));}catch{}
  return session;
}
export function startVisitorSession() {
  if(!visitorEndpoint||location.hostname!=='ol1iv3r.github.io'||navigator.globalPrivacyControl||navigator.doNotTrack==='1')return;
  let storage;try{storage=localStorage;}catch{storage={getItem:()=>null,setItem:()=>{}};}
  const session=sessionFor(storage,Date.now(),()=>crypto.randomUUID());
  recording=fetch(`${visitorEndpoint}/api/visit`,{method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({session:session.id}),credentials:'omit',referrerPolicy:'no-referrer',keepalive:true,
  }).then(()=>{cached=null;}).catch(()=>{});
}
export async function getVisitorStats() {
  if(!visitorEndpoint)return fallback;
  await recording;
  if(cached && Date.now()-cachedAt<15000)return cached;
  if(pending)return pending;
  pending=fetch(`${visitorEndpoint}/api/visitors`,{credentials:'omit',referrerPolicy:'no-referrer',cache:'no-store'})
    .then(async response=>{
      if(!response.ok)throw Error('Statistics unavailable');
      const data=await response.json();
      if(data.status!=='connected'||!Number.isSafeInteger(data.visits)||data.visits<0)throw Error('Invalid statistics');
      cached=data;cachedAt=Date.now();return data;
    }).finally(()=>{pending=null;});
  return pending;
}
