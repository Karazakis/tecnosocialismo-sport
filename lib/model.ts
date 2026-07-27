export type ActivityType = "training" | "lesson" | "teaching" | "competition" | "victory";
export type SkillBand = "aperto" | "principiante" | "intermedio" | "avanzato";
export type EventFormat = "in-presenza" | "online";
export type CompetitionKind = "torneo" | "campionato";
export type TeamMode = "individuale" | "squadra";

export type SportSkill = { sportId: string; name: string; xp: number; level: number };
export type AthleteProfile = {
  id: string;
  name: string;
  xp: number;
  level: number;
  streak: number;
  sessions: number;
  lessonsTaught: number;
  competitions: number;
  victories: number;
  sports: SportSkill[];
  createdAt: string;
  updatedAt: string;
};

export type Lesson = {
  id: string;
  hostId: string;
  hostName: string;
  sportId: string;
  sportName: string;
  title: string;
  description: string;
  level: SkillBand;
  format: EventFormat;
  city: string;
  startsAt: string;
  durationMinutes: number;
  capacity: number;
  participantIds: string[];
  createdAt: string;
};

export type Competition = {
  id: string;
  organizerId: string;
  organizerName: string;
  sportId: string;
  sportName: string;
  title: string;
  kind: CompetitionKind;
  mode: TeamMode;
  level: SkillBand;
  city: string;
  startsAt: string;
  teamSize: number;
  entrantIds: string[];
  createdAt: string;
};

export type Activity = {
  id: string;
  userId: string;
  userName: string;
  sportId: string;
  sportName: string;
  type: ActivityType;
  title: string;
  minutes: number;
  xp: number;
  createdAt: string;
};

export type LeaderboardEntry = { id: string; name: string; xp: number; level: number; lessonsTaught: number; victories: number };

export function safeText(value: unknown, max: number) {
  if (typeof value !== "string") return "";
  return value.replace(/\0/g, "").replace(/\r\n/g, "\n").trim().slice(0, max);
}

export function safeNumber(value: unknown, min: number, max: number, fallback: number) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? Math.max(min, Math.min(max, Math.round(parsed))) : fallback;
}

export function slug(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80) || "sport";
}
