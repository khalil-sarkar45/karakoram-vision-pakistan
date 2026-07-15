import {knowledge} from "../_data/knowledge.js";
export async function onRequestGet({request}){
 const u=new URL(request.url),path=u.searchParams.get('path'),q=(u.searchParams.get('q')||'').trim().toLowerCase();
 let result;
 if(path) result=knowledge.find(x=>x.url===path);
 else if(q) result=knowledge.filter(x=>(x.title+' '+x.summary+' '+x.excerpt).toLowerCase().includes(q)).slice(0,10);
 else return Response.json({error:'Provide path or q'},{status:400,headers:{'cache-control':'no-store'}});
 if(!result || (Array.isArray(result)&&!result.length)) return Response.json({error:'Not found'},{status:404,headers:{'cache-control':'public, max-age=60'}});
 return Response.json({site:'Karakoram Vision Pakistan',canonicalBase:u.origin,result},{headers:{'cache-control':'public, max-age=300, stale-while-revalidate=3600','access-control-allow-origin':'*'}});
}
