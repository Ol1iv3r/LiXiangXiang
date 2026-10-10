const SESSION_TTL = 30 * 60;
const names = new Intl.DisplayNames(['en'], {type:'region'});
export function countryCode(value) {
  if(!/^[A-Z]{2}$/.test(value || '') || ['XX','T1'].includes(value))return 'XX';
  return names.of(value)===value?'XX':value;
}
const json=(data,status,origin)=>new Response(JSON.stringify(data),{status,headers:{
  'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store',
  'Access-Control-Allow-Origin':origin,'Vary':'Origin','X-Content-Type-Options':'nosniff',
}});
export default {
  async fetch(request,env) {
    const origin=request.headers.get('Origin'),allowed=env.ALLOWED_ORIGIN;
    const path=new URL(request.url).pathname;
    if(origin && origin!==allowed)return json({error:'Origin not allowed'},403,allowed);
    if(request.method==='OPTIONS')return new Response(null,{status:204,headers:{
      'Access-Control-Allow-Origin':allowed,'Access-Control-Allow-Methods':'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers':'Content-Type','Access-Control-Max-Age':'86400','Vary':'Origin',
    }});
    try {
      if(path==='/api/visitors' && request.method==='GET') {
        const {results}=await env.DB.prepare('SELECT country, visits FROM regions WHERE visits > 0 ORDER BY visits DESC, country').all();
        return json({status:'connected',visits:results.reduce((sum,r)=>sum+r.visits,0),
          regions:results.filter(r=>r.country!=='XX').map(r=>({countryCode:r.country,name:names.of(r.country),visits:r.visits})),
          unknownVisits:results.find(r=>r.country==='XX')?.visits||0,
          since:'2026-10-10',measurement:'30-minute browser sessions',collectsPreciseLocation:false,
        },200,allowed);
      }
      if(path!=='/api/visit')return json({error:'Not found'},404,allowed);
      if(request.method!=='POST')return json({error:'Method not allowed'},405,allowed);
      if(origin!==allowed)return json({error:'Origin required'},403,allowed);
      if(!request.headers.get('Content-Type')?.startsWith('application/json'))return json({error:'JSON required'},415,allowed);
      const raw=await request.text();
      if(raw.length>256)return json({error:'Body too large'},413,allowed);
      let body;try{body=JSON.parse(raw);}catch{return json({error:'Invalid JSON'},400,allowed);}
      if(!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.session||''))return json({error:'Invalid session'},400,allowed);
      // Country comes from Cloudflare, never from the visitor's submitted data.
      const country=countryCode(request.cf?.country);
      if(env.RATE_LIMITER && !(await env.RATE_LIMITER.limit({key:request.headers.get('CF-Connecting-IP')||body.session})).success)return json({error:'Too many requests'},429,allowed);
      const now=Math.floor(Date.now()/1000);
      const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(body.session));
      const id=Array.from(new Uint8Array(digest),x=>x.toString(16).padStart(2,'0')).join('');
      // A D1 batch is one transaction: retries and concurrent duplicate requests
      // cannot increase the country count twice. No IP or precise location is stored.
      await env.DB.batch([
        env.DB.prepare('DELETE FROM sessions WHERE created_at < ?').bind(now-SESSION_TTL),
        env.DB.prepare('INSERT INTO regions (country, visits) SELECT ?, 1 WHERE NOT EXISTS (SELECT 1 FROM sessions WHERE id = ?) ON CONFLICT(country) DO UPDATE SET visits = visits + 1').bind(country,id),
        env.DB.prepare('INSERT OR IGNORE INTO sessions (id, created_at) VALUES (?, ?)').bind(id,now),
      ]);
      return json({status:'recorded'},200,allowed);
    } catch {
      return json({status:'unavailable'},503,allowed);
    }
  },
  async scheduled(_event,env) {
    await env.DB.prepare('DELETE FROM sessions WHERE created_at < ?').bind(Math.floor(Date.now()/1000)-SESSION_TTL).run();
  },
};
