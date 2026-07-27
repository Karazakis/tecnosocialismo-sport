import { getSuiteUser } from "@/lib/auth";
import { safeNumber, safeText, type Competition, type CompetitionKind, type EventFormat, type SkillBand, type TeamMode } from "@/lib/model";
import { resolveSport } from "@/lib/sports";
import { saveCompetition } from "@/lib/store";

const kinds=new Set<CompetitionKind>(["torneo","campionato"]); const modes=new Set<TeamMode>(["individuale","squadra"]); const bands=new Set<SkillBand>(["aperto","principiante","intermedio","avanzato"]); const formats=new Set<EventFormat>(["in-presenza","online","ibrida"]);
export async function POST(request:Request) {
  if(!process.env.BLOB_READ_WRITE_TOKEN) return Response.json({error:"Archivio non configurato."},{status:503});
  const user=await getSuiteUser(new Headers(request.headers)); if(!user) return Response.json({error:"Accedi per creare una competizione."},{status:401});
  const payload=await request.json().catch(()=>null) as Record<string,unknown>|null; const sport=resolveSport(safeText(payload?.sport,80)); const title=safeText(payload?.title,120); const format=formats.has(payload?.format as EventFormat)?payload?.format as EventFormat:"in-presenza"; const city=format==="online"?"Online":safeText(payload?.city,80); const placeId=safeText(payload?.placeId,80)||undefined; const startsAt=safeDate(payload?.startsAt);
  if(!title||!city||!startsAt) return Response.json({error:"Completa titolo, luogo e data."},{status:400});
  const competition:Competition={id:crypto.randomUUID(),organizerId:user.id,organizerName:user.name,sportId:sport.id,sportName:sport.name,title,kind:kinds.has(payload?.kind as CompetitionKind)?payload?.kind as CompetitionKind:"torneo",mode:modes.has(payload?.mode as TeamMode)?payload?.mode as TeamMode:"individuale",level:bands.has(payload?.level as SkillBand)?payload?.level as SkillBand:"aperto",format,city,placeId,startsAt,teamSize:safeNumber(payload?.teamSize,1,30,1),entrantIds:[],createdAt:new Date().toISOString()};
  await saveCompetition(competition); return Response.json({competition},{status:201});
}
function safeDate(value:unknown){if(typeof value!=="string") return null; const date=new Date(value); return Number.isFinite(date.getTime())?date.toISOString():null;}
