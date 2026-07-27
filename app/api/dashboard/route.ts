import { getSuiteUser } from "@/lib/auth";
import { levelProgress, levelTitle } from "@/lib/gamification";
import { listActivities, listCompetitions, listLessons, listProfiles, readProfile } from "@/lib/store";

export async function GET(request: Request) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return Response.json({ configured:false, profile:null, lessons:[], competitions:[], activities:[], leaderboard:[] });
  const user = await getSuiteUser(new Headers(request.headers));
  const [profile, lessons, competitions, activities, profiles] = await Promise.all([
    user ? readProfile(user.id) : null,
    listLessons(), listCompetitions(), user ? listActivities(user.id) : [], listProfiles(),
  ]);
  return Response.json({
    configured:true,
    viewerId:user?.id ?? null,
    profile:profile ? { ...profile, progress:levelProgress(profile.xp), title:levelTitle(profile.level) } : null,
    lessons:lessons.slice(0,100),
    competitions:competitions.slice(0,100),
    activities:activities.slice(0,30),
    leaderboard:profiles.slice(0,20).map((item) => ({ id:item.id,name:item.name,xp:item.xp,level:item.level,lessonsTaught:item.lessonsTaught,victories:item.victories })),
  }, { headers:{ "Cache-Control":"private, no-store" } });
}
