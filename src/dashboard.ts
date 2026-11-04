import { dayNumber, sharedDay, type Moment, type MoodEntry, type MoodHistory } from './domain.ts';

export function offsetDay(day: string, offset: number) {
  return new Date((dayNumber(day) + offset) * 86400000).toISOString().slice(0, 10);
}
export function streakFor(entries: MoodEntry[], authorId: string, today: string) {
  const days = new Set(entries.filter(entry => entry.authorId === authorId && entry.day <= today).map(entry => entry.day));
  const lastDay = days.has(today) ? today : offsetDay(today, -1);
  let cursor = lastDay; let count = 0;
  while (days.has(cursor)) { count++; cursor = offsetDay(cursor, -1); }
  return { authorId, days: count, lastDay: count ? lastDay : '' };
}
export function logDemoMood(history: MoodHistory | null, entry: MoodEntry): MoodHistory {
  const entries = [...(history?.entries ?? []).filter(old => old.authorId !== entry.authorId || old.day !== entry.day), entry];
  return { entries, streaks: [...new Set(entries.map(old => old.authorId))].map(id => streakFor(entries, id, entry.day)) };
}
export function currentMoodStreak(history: MoodHistory, authorId: string, today: string) {
  const streak = history.streaks.find(row => row.authorId === authorId);
  return streak && streak.lastDay <= today && streak.lastDay >= offsetDay(today, -1) ? streak.days : 0;
}
export function recentPhotos(moments: Moment[], now = Date.now()) {
  const oldest = now - 30 * 86400000;
  return moments.filter(moment => moment.kind === 'photo' && Date.parse(moment.createdAt) >= oldest && Date.parse(moment.createdAt) <= now)
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt) || b.id.localeCompare(a.id));
}
export function photoDay(iso: string, timeZone: string) { return sharedDay(timeZone, new Date(iso)); }
