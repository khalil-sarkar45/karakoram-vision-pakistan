export async function onRequestPost({request}){
  try{const body=await request.json();console.log('web-vital',JSON.stringify(body).slice(0,1000));return new Response(null,{status:204,headers:{'cache-control':'no-store'}})}catch{return Response.json({error:'invalid payload'},{status:400,headers:{'cache-control':'no-store'}})}
}
