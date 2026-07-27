import { getSuiteUser } from "@/lib/auth";
import { safeNumber } from "@/lib/model";
import { awardCommunityContribution, ratePlace } from "@/lib/store";

export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){
  if(!process.env.BLOB_READ_WRITE_TOKEN)return Response.json({error:"Archivio non configurato."},{status:503});
  const user=await getSuiteUser(new Headers(request.headers));
  if(!user)return Response.json({error:"Accedi per valutare un luogo."},{status:401});
  const payload=await request.json().catch(()=>null) as {score?:unknown}|null;
  const score=safeNumber(payload?.score,1,5,0);
  if(!score)return Response.json({error:"Scegli un voto da 1 a 5."},{status:400});
  const result=await ratePlace((await params).id,user.id,score);
  if("error" in result)return Response.json({error:result.error},{status:result.status});
  const reward=result.firstRating?await awardCommunityContribution({userId:user.id,userName:user.name,type:"rating",placeId:result.place.id,placeName:result.place.name}):null;
  return Response.json({place:result.place,reward:reward?{xp:reward.activity.xp}:null});
}
