import { getSuiteUser } from "@/lib/auth";
import { safeFloat, safeText, type PlaceAccess, type PlaceType } from "@/lib/model";
import { awardCommunityContribution, listPlaces, savePlace } from "@/lib/store";

const types=new Set<PlaceType>(["palestra","parco-attrezzato","parco-libero","garage","centro-sportivo","campo","casa-condivisa","altro"]);
const accesses=new Set<PlaceAccess>(["pubblico-gratuito","gratuito-prenotazione","privato-condiviso","accesso-regolato"]);

export async function GET(){
  if(!process.env.BLOB_READ_WRITE_TOKEN)return Response.json({configured:false,places:[]});
  return Response.json({configured:true,places:await listPlaces()},{headers:{"Cache-Control":"public, max-age=20, stale-while-revalidate=60"}});
}

export async function POST(request:Request){
  if(!process.env.BLOB_READ_WRITE_TOKEN)return Response.json({error:"Archivio non configurato."},{status:503});
  const user=await getSuiteUser(new Headers(request.headers));
  if(!user)return Response.json({error:"Accedi per aggiungere un luogo."},{status:401});
  const payload=await request.json().catch(()=>null) as Record<string,unknown>|null;
  const name=safeText(payload?.name,100),description=safeText(payload?.description,500),address=safeText(payload?.address,160),city=safeText(payload?.city,80);
  const latitude=safeFloat(payload?.latitude,-90,90,999),longitude=safeFloat(payload?.longitude,-180,180,999);
  if(!name||!description||!address||!city||latitude===999||longitude===999)return Response.json({error:"Completa nome, descrizione, indirizzo e posizione sulla mappa."},{status:400});
  const split=(value:unknown,max:number)=>safeText(value,max).split(",").map(item=>item.trim()).filter(Boolean).slice(0,20);
  const place=await savePlace({ownerId:user.id,ownerName:user.name,name,type:types.has(payload?.type as PlaceType)?payload?.type as PlaceType:"altro",description,address,city,latitude,longitude,access:accesses.has(payload?.access as PlaceAccess)?payload?.access as PlaceAccess:"accesso-regolato",indoor:payload?.indoor===true||payload?.indoor==="on",accessible:payload?.accessible===true||payload?.accessible==="on",equipment:split(payload?.equipment,300),sports:split(payload?.sports,300)});
  const reward=await awardCommunityContribution({userId:user.id,userName:user.name,type:"mapping",placeId:place.id,placeName:place.name});
  return Response.json({place,reward:{xp:reward.activity.xp}},{status:201});
}
