import { cleanText, validDate, type CareAction, type ChatMessage, type Pet, type PetCare, type PetKind, type Plan } from './domain.ts';

export const PET_KINDS: { id: PetKind; label: string; description: string }[] = [
  { id: 'bear', label: 'Teddy', description: 'Your little cuddle buddy.' },
  { id: 'cat', label: 'Cat', description: 'A tiny, curious daydreamer.' },
  { id: 'dog', label: 'Puppy', description: 'A little bundle of sunshine.' },
  { id: 'bunny', label: 'Bunny', description: 'Soft ears. Big adventures.' },
];
export const CARE_ACTIONS: { id: CareAction; label: string; past: string; emoji: string }[] = [
  { id: 'feed', label: 'Feed', past: 'fed', emoji: '🥕' },
  { id: 'play', label: 'Play', past: 'played with', emoji: '🎾' },
  { id: 'rest', label: 'Tuck in', past: 'tucked in', emoji: '🌙' },
];
export type PlanDraft = { title: string; date: string; kind: Plan['kind']; time: string; place: string; notes: string; format: 'in-person' | 'virtual' };
export function validatePlan(draft: PlanDraft, today: string): PlanDraft {
  const title = cleanText(draft.title, 120);
  if (!['date', 'wish'].includes(draft.kind)) throw new Error('Choose a date or a someday wish.');
  if (draft.kind === 'date' && (!validDate(draft.date) || draft.date < today)) throw new Error('Choose today or a future date, using YYYY-MM-DD.');
  if (draft.kind === 'date' && draft.time && !/^([01]\d|2[0-3]):[0-5]\d$/.test(draft.time)) throw new Error('Use a time from 00:00 to 23:59.');
  if (draft.place.trim().length > 180 || draft.notes.trim().length > 500) throw new Error('Keep the place under 180 characters and notes under 500.');
  if (!['in-person', 'virtual'].includes(draft.format)) throw new Error('Choose an in-person or virtual date.');
  return { ...draft, title, date: draft.kind === 'date' ? draft.date : '', time: draft.kind === 'date' ? draft.time : '', place: draft.place.trim(), notes: draft.notes.trim() };
}
export function adoptPet(name: string, kind: PetKind): Pet {
  if (!PET_KINDS.some(p => p.id === kind)) throw new Error('Choose a teddy, cat, puppy, or bunny.');
  return { name: cleanText(name, 24), kind, points: 0, adoptedAt: new Date().toISOString() };
}
export function careForPet(pet: Pet, care: PetCare[], authorId: string, action: CareAction, day: string) {
  if (!CARE_ACTIONS.some(a => a.id === action)) throw new Error('Choose feed, play, or tuck in.');
  if (care.some(c => c.authorId === authorId && c.day === day && c.action === action)) return { pet, care };
  return { pet: { ...pet, points: pet.points + 5 }, care: [...care, { authorId, day, action, createdAt: new Date().toISOString() }] };
}
export function petGrowth(points: number) {
  return { level: Math.floor(points / 30) + 1, progress: points % 30, stage: points < 30 ? 'Tiny newcomer' : points < 90 ? 'Curious companion' : 'Your little best friend' };
}
export function mergeMessages(...groups: ChatMessage[][]) {
  const unique = new Map(groups.flat().map(message => [message.id, message]));
  // Server rows use UTC ISO timestamps, keeping their microsecond precision for pagination.
  const timestamp = (value: string) => value.replace('Z', '+00:00');
  return [...unique.values()].sort((a, b) => timestamp(a.createdAt) < timestamp(b.createdAt) ? -1 : timestamp(a.createdAt) > timestamp(b.createdAt) ? 1 : a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
}
export function reconcileMessages(previous: Pick<import('./domain.ts').Space, 'messages' | 'hasOlderMessages'>, latest: Pick<import('./domain.ts').Space, 'messages' | 'hasOlderMessages'>) {
  // A full page without overlap can hide an arbitrary gap after a long disconnect.
  // Restart at the latest page so Earlier messages can traverse that gap in order.
  const overlaps = latest.messages.some(message => previous.messages.some(old => old.id === message.id));
  if (!overlaps || !latest.hasOlderMessages) return latest;
  return { messages: mergeMessages(previous.messages, latest.messages), hasOlderMessages: previous.hasOlderMessages };
}
export const DATE_IDEAS = {
  'in-person': [
    { title: 'Coffee & a no-rush walk', notes: 'Try a new café, then put your phones away for a little walk.' },
    { title: 'A picnic for two', notes: 'Each bring one snack and one song for our playlist.' },
    { title: 'Make something delicious', notes: 'Pick a recipe neither of us has cooked before.' },
  ],
  virtual: [
    { title: 'Same dinner, different kitchens', notes: 'Choose a recipe, shop ahead, and cook together on a call.' },
    { title: 'Draw our dream weekend', notes: 'Open our canvas, call each other, and take turns adding details.' },
    { title: 'A cozy games night', notes: 'Bring a snack. Best of three at Four in a Row?' },
  ],
};
