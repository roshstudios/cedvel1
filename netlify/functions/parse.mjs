const P=`You parse an Azerbaijani university timetable for ONE target group.
Input JSON: group, colX (x of target column header), cols (all header columns {n,x}), slots ({i,day 1-5 Mon-Fri,time}), items ([slotIndex,x,y,text]; y grows downward).
A cell's text is centered horizontally over the columns it spans. A cell applies to the target group only if colX lies inside its span; estimate spans from the x of neighbouring cells and the header column positions. Fragments of one cell share similar x and consecutive y.
Rules:
1. Two cells stacked vertically in the same slot that both cover the target column = alternating weeks: upper cell (smaller y) week "upper", lower cell week "lower". A single cell = "both".
2. Cell text = subject name, teacher ("Əliyev S."), room (3-digit number, maybe with a letter like 301c). Rejoin words split by line breaks ("Proqramlaşdırma nın" -> "Proqramlaşdırmanın").
3. If a cell lists "1.X 2.Y" teachers with several rooms, output one entry per subgroup with sub 1 or 2 and its own teacher/room.
4. start = slot time unless the cell states another time (e.g. "13:50"), then use that time. Format HH:MM.
5. Never invent lessons. Skip cells not covering the target. If unsure, set "note" explaining why.
Return ONLY JSON: {"entries":[{"day":1,"start":"08:30","name":"","teacher":"","room":"","week":"both|upper|lower","sub":null,"note":""}]}`;
export default async (req)=>{
 if(req.method!=='POST')return new Response('',{status:405});
 const b=await req.json().catch(()=>null);
 if(!b||!Array.isArray(b.items)||JSON.stringify(b).length>90000)return Response.json({error:'Yanlış sorğu'},{status:400});
 const key=Netlify.env.get('GROQ_API_KEY');
 if(!key)return Response.json({error:'GROQ_API_KEY təyin edilməyib'},{status:500});
 const r=await fetch('https://api.groq.com/openai/v1/chat/completions',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+key},
  body:JSON.stringify({model:'llama-3.3-70b-versatile',temperature:0,response_format:{type:'json_object'},messages:[{role:'system',content:P},{role:'user',content:JSON.stringify(b)}]})});
 const j=await r.json();
 if(!r.ok)return Response.json({error:j.error?.message||'Groq xətası'},{status:502});
 try{return Response.json(JSON.parse(j.choices[0].message.content))}catch{return Response.json({error:'AI cavabı oxunmadı'},{status:502})}
};
export const config={path:'/api/parse'};
