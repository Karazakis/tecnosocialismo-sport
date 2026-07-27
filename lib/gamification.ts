import type { ActivityType, AthleteProfile } from "./model";

export const MAX_LEVEL = 50;
export const levelNames = ["Inizio", "Ritmo", "Slancio", "Tenacia", "Competenza", "Guida", "Maestria", "Leggenda"];

export function levelFromXp(xp: number) {
  return Math.min(MAX_LEVEL, Math.floor(Math.sqrt(Math.max(0, xp) / 140)) + 1);
}

export function xpForLevel(level: number) {
  return Math.max(0, Math.pow(Math.max(1, level) - 1, 2) * 140);
}

export function levelProgress(xp: number) {
  const level = levelFromXp(xp);
  const floor = xpForLevel(level);
  const ceiling = level >= MAX_LEVEL ? floor : xpForLevel(level + 1);
  return { level, current: xp - floor, needed: Math.max(1, ceiling - floor), percentage: level >= MAX_LEVEL ? 100 : Math.round(((xp - floor) / Math.max(1, ceiling - floor)) * 100) };
}

export function levelTitle(level: number) {
  const index = Math.min(levelNames.length - 1, Math.floor((Math.max(1, level) - 1) / 7));
  return levelNames[index];
}

export function activityXp(type: ActivityType, minutes: number) {
  const duration = Math.max(10, Math.min(240, minutes));
  const base: Record<ActivityType, number> = { training: 18, lesson: 45, teaching: 90, competition: 110, victory: 220 };
  return Math.round(base[type] + Math.min(80, duration * .45));
}

export function newProfile(id: string, name: string): AthleteProfile {
  const now = new Date().toISOString();
  return { id, name, xp:0, level:1, streak:0, sessions:0, lessonsTaught:0, competitions:0, victories:0, sports:[], createdAt:now, updatedAt:now };
}
