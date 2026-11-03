import {getStore} from '@netlify/blobs';
export default async (req)=>{
 const s=getStore('schedules'),u=new URL(req.url),id=u.searchParams.get('id');
 if(req.method==='GET'){
  if(id){const d=await s.get(id,{type:'json'});return d?Response.json({name:d.name,group:d.group,entries:d.entries}):Response.json({error:'Tapılmadı'},{status:404})}
  const {blobs}=await s.list(),out=[];
  for(const x of blobs){const d=await s.get(x.key,{type:'json'});if(d)out.push({id:x.key,name:d.name,group:d.group})}
  return Response.json(out);
 }
 if(req.method==='POST'){
  const b=await req.json().catch(()=>null);
  if(!b||!b.name||!Array.isArray(b.entries)||b.entries.length>80)return Response.json({error:'Yanlış məlumat'},{status:400});
  let nid=b.id,tok=b.tok;
  if(nid){const o=await s.get(nid,{type:'json'});if(o&&o.tok!==tok)return Response.json({error:'İcazə yoxdur'},{status:403})}
  if(!nid||!tok){nid=crypto.randomUUID().slice(0,8);tok=crypto.randomUUID()}
  const t=v=>String(v||'').slice(0,80);
  await s.setJSON(nid,{tok,name:t(b.name),group:t(b.group),entries:b.entries.map(e=>({day:+e.day,start:t(e.start),end:t(e.end),name:t(e.name),teacher:t(e.teacher),room:t(e.room),week:['upper','lower'].includes(e.week)?e.week:'both'}))});
  return Response.json({id:nid,tok});
 }
 if(req.method==='DELETE'){
  const o=await s.get(id,{type:'json'});
  if(o&&o.tok===u.searchParams.get('tok'))await s.delete(id);
  return Response.json({ok:true});
 }
 return new Response('',{status:405});
};
export const config={path:'/api/share'};
