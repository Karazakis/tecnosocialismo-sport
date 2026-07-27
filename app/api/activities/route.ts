import { getSuiteUser } from "@/lib/auth";
import { safeNumber, safeText, type ActivityType, type PracticeMode } from "@/lib/model";
import { awardActivity, listPlaces } from "@/lib/store";

const types = new Set<ActivityType>(["training","lesson","teaching","competition","victory"]);
const modes = new Set<PracticeMode>(["casa","call","luogo","ibrido"]);

export async function POST(request: Request) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return Response.json({ error:"Archivio non configurato." }, { status:503 });
  const user = await getSuiteUser(new Headers(request.headers));
  if (!user) return Response.json({ error:"Accedi per registrare attività." }, { status:401 });
  const payload = await request.json().catch(() => null) as { sport?:unknown; type?:unknown; title?:unknown; minutes?:unknown; practiceMode?:unknown; placeId?:unknown; placeName?:unknown } | null;
  const sport = safeText(payload?.sport,80); const title = safeText(payload?.title,140);
  const type = types.has(payload?.type as ActivityType) ? payload?.type as ActivityType : "training";
  const minutes = safeNumber(payload?.minutes,10,240,45);
  const practiceMode=modes.has(payload?.practiceMode as PracticeMode)?payload?.practiceMode as PracticeMode:"luogo";
  const placeId=safeText(payload?.placeId,80)||undefined;
  const placeName=placeId?(await listPlaces()).find(place=>place.id===placeId)?.name:safeText(payload?.placeName,120)||undefined;
  if (!sport || !title) return Response.json({ error:"Indica sport e attività." }, { status:400 });
  return Response.json(await awardActivity({ userId:user.id,userName:user.name,sport,type,title,minutes,practiceMode,placeId,placeName }), { status:201 });
}
