import { getSuiteUser } from "@/lib/auth";
import { safeNumber, safeText, type EventFormat, type Lesson, type SkillBand } from "@/lib/model";
import { resolveSport } from "@/lib/sports";
import { saveLesson } from "@/lib/store";

const bands = new Set<SkillBand>(["aperto","principiante","intermedio","avanzato"]);
const formats = new Set<EventFormat>(["in-presenza","online"]);

export async function POST(request: Request) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return Response.json({ error:"Archivio non configurato." }, { status:503 });
  const user = await getSuiteUser(new Headers(request.headers));
  if (!user) return Response.json({ error:"Accedi per offrire una lezione." }, { status:401 });
  const payload = await request.json().catch(() => null) as Record<string,unknown> | null;
  const sport = resolveSport(safeText(payload?.sport,80)); const title = safeText(payload?.title,120); const description = safeText(payload?.description,600);
  const level = bands.has(payload?.level as SkillBand) ? payload?.level as SkillBand : "aperto";
  const format = formats.has(payload?.format as EventFormat) ? payload?.format as EventFormat : "in-presenza";
  const city = format === "online" ? "Online" : safeText(payload?.city,80);
  const startsAt = safeDate(payload?.startsAt);
  if (!title || !description || !startsAt || !city) return Response.json({ error:"Completa titolo, descrizione, luogo e data." }, { status:400 });
  const lesson:Lesson = { id:crypto.randomUUID(),hostId:user.id,hostName:user.name,sportId:sport.id,sportName:sport.name,title,description,level,format,city,startsAt,durationMinutes:safeNumber(payload?.durationMinutes,20,240,60),capacity:safeNumber(payload?.capacity,1,40,6),participantIds:[],createdAt:new Date().toISOString() };
  await saveLesson(lesson);
  return Response.json({ lesson }, { status:201 });
}
function safeDate(value:unknown) { if(typeof value!=="string") return null; const date=new Date(value); return Number.isFinite(date.getTime()) ? date.toISOString() : null; }
