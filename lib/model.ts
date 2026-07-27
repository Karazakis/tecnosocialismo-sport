export type ActivityType = "training" | "lesson" | "teaching" | "competition" | "victory" | "mapping" | "rating";
export type SkillBand = "aperto" | "principiante" | "intermedio" | "avanzato";
export type EventFormat = "in-presenza" | "online" | "ibrida";
export type PracticeMode = "casa" | "call" | "luogo" | "ibrido";
export type CompetitionKind = "torneo" | "campionato";
export type TeamMode = "individuale" | "squadra";
export type PlaceType = "palestra" | "parco-attrezzato" | "parco-libero" | "garage" | "centro-sportivo" | "campo" | "casa-condivisa" | "altro";
export type PlaceAccess = "pubblico-gratuito" | "gratuito-prenotazione" | "privato-condiviso" | "accesso-regolato";

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
  placesMapped?: number;
  ratingsGiven?: number;
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
  placeId?: string;
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
  format: EventFormat;
  city: string;
  placeId?: string;
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
  practiceMode: PracticeMode;
  placeId?: string;
  placeName?: string;
  xp: number;
  createdAt: string;
};

export type LeaderboardEntry = { id: string; name: string; xp: number; level: number; lessonsTaught: number; victories: number };

export type Place = {
  id: string;
  ownerId: string;
  ownerName: string;
  name: string;
  type: PlaceType;
  description: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  access: PlaceAccess;
  indoor: boolean;
  accessible: boolean;
  equipment: string[];
  sports: string[];
  rating: number;
  ratingCount: number;
  createdAt: string;
  updatedAt: string;
};

export function safeText(value: unknown, max: number) {
  if (typeof value !== "string") return "";
  return value.replace(/\0/g, "").replace(/\r\n/g, "\n").trim().slice(0, max);
}

export function safeNumber(value: unknown, min: number, max: number, fallback: number) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? Math.max(min, Math.min(max, Math.round(parsed))) : fallback;
}

export function safeFloat(value: unknown, min: number, max: number, fallback: number) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? Math.max(min, Math.min(max, parsed)) : fallback;
}

export function slug(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80) || "sport";
}
