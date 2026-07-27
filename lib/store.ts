import { get, list, put } from "@vercel/blob";
import { activityXp, levelFromXp, newProfile } from "./gamification";
import type { Activity, ActivityType, AthleteProfile, Competition, Lesson, Place, PlaceAccess, PlaceType, PracticeMode } from "./model";
import { resolveSport } from "./sports";

const PROFILE_PREFIX = "sport/profiles/";
const LESSON_PREFIX = "sport/lessons/";
const COMPETITION_PREFIX = "sport/competitions/";
const ACTIVITY_PREFIX = "sport/activities/";
const PLACE_PREFIX = "sport/places/";
type StoredPlace = Place & { ratingsByUser: Record<string,number> };

export async function readProfile(id: string) {
  return readJson<AthleteProfile>(`${PROFILE_PREFIX}${safeKey(id)}.json`);
}

export async function ensureProfile(id: string, name: string) {
  const current = await readProfile(id);
  if (current) return current;
  const profile = newProfile(id, name);
  await writeJson(`${PROFILE_PREFIX}${safeKey(id)}.json`, profile, false);
  return profile;
}

export async function listProfiles() {
  const result = await list({ prefix: PROFILE_PREFIX, limit: 1000 });
  const records = await Promise.all(result.blobs.map((blob) => readJson<AthleteProfile>(blob.url)));
  return records.filter((item): item is AthleteProfile => Boolean(item)).sort((a,b) => b.xp - a.xp);
}

export async function awardActivity(input: { userId: string; userName: string; sport: string; type: ActivityType; title: string; minutes: number; practiceMode: PracticeMode; placeId?: string; placeName?: string }) {
  const sport = resolveSport(input.sport);
  const now = new Date().toISOString();
  const xp = activityXp(input.type, input.minutes);
  const profile = await ensureProfile(input.userId, input.userName);
  const skill = profile.sports.find((item) => item.sportId === sport.id);
  const skillXp = (skill?.xp ?? 0) + xp;
  const updated: AthleteProfile = {
    ...profile,
    name: input.userName,
    xp: profile.xp + xp,
    level: levelFromXp(profile.xp + xp),
    streak: nextStreak(profile.updatedAt, now, profile.streak),
    sessions: profile.sessions + 1,
    lessonsTaught: profile.lessonsTaught + (input.type === "teaching" ? 1 : 0),
    competitions: profile.competitions + (input.type === "competition" || input.type === "victory" ? 1 : 0),
    victories: profile.victories + (input.type === "victory" ? 1 : 0),
    sports: [...profile.sports.filter((item) => item.sportId !== sport.id), { sportId:sport.id, name:sport.name, xp:skillXp, level:levelFromXp(skillXp) }].sort((a,b) => b.xp - a.xp),
    updatedAt: now,
  };
  const activity: Activity = { id:crypto.randomUUID(), userId:input.userId, userName:input.userName, sportId:sport.id, sportName:sport.name, type:input.type, title:input.title, minutes:input.minutes, practiceMode:input.practiceMode, placeId:input.placeId, placeName:input.placeName, xp, createdAt:now };
  const time = now.replace(/[:.]/g,"-");
  await Promise.all([
    writeJson(`${PROFILE_PREFIX}${safeKey(input.userId)}.json`, updated, true),
    writeJson(`${ACTIVITY_PREFIX}${safeKey(input.userId)}/${time}-${activity.id}.json`, activity, false),
  ]);
  return { profile: updated, activity };
}

export async function listActivities(userId?: string) {
  const result = await list({ prefix: userId ? `${ACTIVITY_PREFIX}${safeKey(userId)}/` : ACTIVITY_PREFIX, limit: 1000 });
  const records = await Promise.all(result.blobs.map((blob) => readJson<Activity>(blob.url)));
  return records.filter((item): item is Activity => Boolean(item)).sort((a,b) => b.createdAt.localeCompare(a.createdAt));
}

export async function listLessons() {
  const result = await list({ prefix: LESSON_PREFIX, limit: 1000 });
  const records = await Promise.all(result.blobs.map((blob) => readJson<Lesson>(blob.url)));
  return records.filter((item): item is Lesson => Boolean(item)).sort((a,b) => a.startsAt.localeCompare(b.startsAt));
}

export async function readLesson(id: string) { return isUuid(id) ? readJson<Lesson>(`${LESSON_PREFIX}${id}.json`) : null; }
export async function saveLesson(lesson: Lesson) { await writeJson(`${LESSON_PREFIX}${lesson.id}.json`, lesson, false); return lesson; }
export async function joinLesson(id: string, userId: string) {
  const lesson = await readLesson(id);
  if (!lesson) return { error:"Lezione non trovata.", status:404 } as const;
  if (lesson.hostId === userId) return { error:"Sei già la persona che offre questa lezione.", status:400 } as const;
  if (lesson.participantIds.includes(userId)) return { lesson, joined:true } as const;
  if (lesson.participantIds.length >= lesson.capacity) return { error:"Questa lezione è al completo.", status:409 } as const;
  const updated = { ...lesson, participantIds:[...lesson.participantIds,userId] };
  await writeJson(`${LESSON_PREFIX}${id}.json`, updated, true);
  return { lesson:updated, joined:true } as const;
}

export async function listCompetitions() {
  const result = await list({ prefix: COMPETITION_PREFIX, limit: 1000 });
  const records = await Promise.all(result.blobs.map((blob) => readJson<Competition>(blob.url)));
  return records.filter((item): item is Competition => Boolean(item)).sort((a,b) => a.startsAt.localeCompare(b.startsAt));
}

export async function readCompetition(id: string) { return isUuid(id) ? readJson<Competition>(`${COMPETITION_PREFIX}${id}.json`) : null; }
export async function saveCompetition(competition: Competition) { await writeJson(`${COMPETITION_PREFIX}${competition.id}.json`, competition, false); return competition; }
export async function joinCompetition(id: string, userId: string) {
  const competition = await readCompetition(id);
  if (!competition) return { error:"Competizione non trovata.", status:404 } as const;
  if (competition.entrantIds.includes(userId)) return { competition, joined:true } as const;
  const updated = { ...competition, entrantIds:[...competition.entrantIds,userId] };
  await writeJson(`${COMPETITION_PREFIX}${id}.json`, updated, true);
  return { competition:updated, joined:true } as const;
}

export async function listPlaces() {
  const result = await list({ prefix:PLACE_PREFIX, limit:1000 });
  const records = await Promise.all(result.blobs.map((blob) => readJson<StoredPlace>(blob.url)));
  return records.filter((item):item is StoredPlace=>Boolean(item)).map(publicPlace).sort((a,b)=>b.ratingCount-a.ratingCount||b.rating-a.rating);
}

export async function savePlace(input:{ownerId:string;ownerName:string;name:string;type:PlaceType;description:string;address:string;city:string;latitude:number;longitude:number;access:PlaceAccess;indoor:boolean;accessible:boolean;equipment:string[];sports:string[]}) {
  const now=new Date().toISOString();
  const place:StoredPlace={id:crypto.randomUUID(),...input,rating:0,ratingCount:0,ratingsByUser:{},createdAt:now,updatedAt:now};
  await writeJson(`${PLACE_PREFIX}${place.id}.json`,place,false);
  return publicPlace(place);
}

export async function ratePlace(id:string,userId:string,score:number) {
  const current=isUuid(id)?await readJson<StoredPlace>(`${PLACE_PREFIX}${id}.json`):null;
  if(!current)return {error:"Luogo non trovato.",status:404} as const;
  const firstRating=!Object.prototype.hasOwnProperty.call(current.ratingsByUser??{},userId);
  const ratingsByUser={...(current.ratingsByUser??{}),[userId]:score};
  const values=Object.values(ratingsByUser);
  const updated:StoredPlace={...current,ratingsByUser,ratingCount:values.length,rating:values.reduce((sum,value)=>sum+value,0)/values.length,updatedAt:new Date().toISOString()};
  await writeJson(`${PLACE_PREFIX}${id}.json`,updated,true);
  return {place:publicPlace(updated),firstRating} as const;
}

export async function awardCommunityContribution(input:{userId:string;userName:string;type:"mapping"|"rating";placeId:string;placeName:string}) {
  const profile=await ensureProfile(input.userId,input.userName); const now=new Date().toISOString(); const xp=activityXp(input.type,0);
  const updated:AthleteProfile={...profile,name:input.userName,xp:profile.xp+xp,level:levelFromXp(profile.xp+xp),placesMapped:(profile.placesMapped??0)+(input.type==="mapping"?1:0),ratingsGiven:(profile.ratingsGiven??0)+(input.type==="rating"?1:0),updatedAt:now};
  const activity:Activity={id:crypto.randomUUID(),userId:input.userId,userName:input.userName,sportId:"community-map",sportName:"Mappa dei luoghi",type:input.type,title:input.type==="mapping"?`Ha mappato ${input.placeName}`:`Ha valutato ${input.placeName}`,minutes:0,practiceMode:"luogo",placeId:input.placeId,placeName:input.placeName,xp,createdAt:now};
  const time=now.replace(/[:.]/g,"-");
  await Promise.all([writeJson(`${PROFILE_PREFIX}${safeKey(input.userId)}.json`,updated,true),writeJson(`${ACTIVITY_PREFIX}${safeKey(input.userId)}/${time}-${activity.id}.json`,activity,false)]);
  return {profile:updated,activity};
}

function publicPlace(place:StoredPlace):Place {
  const {ratingsByUser,...publicRecord}=place;
  void ratingsByUser;
  return publicRecord;
}

async function writeJson(pathname: string, value: unknown, allowOverwrite: boolean) {
  await put(pathname, JSON.stringify(value), { access:"private", addRandomSuffix:false, allowOverwrite, contentType:"application/json; charset=utf-8", cacheControlMaxAge:0 });
}

async function readJson<T>(urlOrPathname: string): Promise<T | null> {
  try {
    const result = await get(urlOrPathname, { access:"private", useCache:false });
    if (!result || result.statusCode !== 200) return null;
    return JSON.parse(await new Response(result.stream).text()) as T;
  } catch { return null; }
}

function nextStreak(previous: string, now: string, streak: number) {
  const before = new Date(previous); const current = new Date(now);
  const beforeDay = Date.UTC(before.getUTCFullYear(),before.getUTCMonth(),before.getUTCDate());
  const currentDay = Date.UTC(current.getUTCFullYear(),current.getUTCMonth(),current.getUTCDate());
  const days = Math.round((currentDay-beforeDay)/86_400_000);
  if (days === 0) return Math.max(1,streak);
  if (days === 1) return Math.max(1,streak)+1;
  return 1;
}
function safeKey(value:string) { return value.replace(/[^a-zA-Z0-9_-]/g,"_").slice(0,180); }
function isUuid(value:string) { return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value); }
