export type MoodId = 'happy' | 'loved' | 'calm' | 'low' | 'stressed' | 'missing' | 'space';
export type Mood = { id: MoodId; label: string; emoji: string; color: string; background: string; title: string; subtitle: string; action: string; note: string };

export const MOODS: Mood[] = [
  { id: 'happy', label: 'Happy', emoji: '☀️', color: '#963D5B', background: '#F8E2EA', title: 'A little sunshine,\njust for you.', subtitle: 'Good days feel even better when you share them.', action: 'Send a little love', note: 'Your happiness is my favorite thing.' },
  { id: 'loved', label: 'Loved', emoji: '💗', color: '#8D4C60', background: '#F4E2E4', title: 'Love looks\ngood on us.', subtitle: 'A little reminder that you are someone’s favorite person.', action: 'Love you right back', note: 'I love doing life with you.' },
  { id: 'calm', label: 'Calm', emoji: '🌿', color: '#77608C', background: '#EEE5F6', title: 'Somewhere soft\nto land.', subtitle: 'No big plans needed. Just a quiet moment together.', action: 'Send a quiet hello', note: 'No need to reply. Just thinking of you.' },
  { id: 'low', label: 'Low', emoji: '🌧️', color: '#77608C', background: '#EBE3F5', title: 'A softer kind\nof together.', subtitle: 'Some days call for a little more kindness and a little less noise.', action: 'Send a warm hug', note: 'You don’t have to have the words. I’m here for you.' },
  { id: 'stressed', label: 'Stressed', emoji: '🫧', color: '#6A6087', background: '#EAE6F1', title: 'One breath.\nThen another.', subtitle: 'You don’t have to fix anything. Being there can be enough.', action: 'Let them know you’re here', note: 'I’m on your team. Tell me what would help, whenever you’re ready.' },
  { id: 'missing', label: 'Miss you', emoji: '🌙', color: '#75628A', background: '#ECE5F3', title: 'Miles apart.\nStill right here.', subtitle: 'Make the space between you feel a little smaller.', action: 'Send an “I miss you”', note: 'Wish I could reach through the screen and hold your hand.' },
  { id: 'space', label: 'Need space', emoji: '☁️', color: '#676D6E', background: '#EEE8F2', title: 'A little room\nto breathe.', subtitle: 'Space can be loving, too. Let them come back in their own time.', action: 'Send one gentle note', note: 'Take the time you need. I’m here when you’re ready—no reply needed.' },
];

export const NEEDS = ['A hug', 'Just listen', 'Something fun', 'Quiet time', 'Nothing right now'];
export type Profile = { id: string; name: string; mood: MoodId; moodNote: string; need: string; moodAt: string };
export type MoodEntry = { authorId: string; day: string; mood: MoodId; updatedAt: string };
export type MoodStreak = { authorId: string; days: number; lastDay: string };
export type MoodHistory = { entries: MoodEntry[]; streaks: MoodStreak[] };
export type Stroke = { id: string; authorId: string; color: string; width: number; points: number[][] };
export type Moment = { id: string; authorId: string; kind: 'photo' | 'note' | 'hug' | 'drawing'; text: string; image?: string; drawing?: Stroke[]; storagePath?: string; createdAt: string; hearts: string[] };
export type Plan = { id: string; authorId: string; title: string; date: string; kind: 'date' | 'wish'; done: boolean; time?: string; place?: string; notes?: string; format?: 'in-person' | 'virtual'; acceptedBy?: string[]; revision?: number };
export type ChatMessage = { id: string; authorId: string; text: string; createdAt: string };
export type PetKind = 'bear' | 'cat' | 'dog' | 'bunny';
export type CareAction = 'feed' | 'play' | 'rest';
export type Pet = { name: string; kind: PetKind; points: number; adoptedAt: string };
export type PetCare = { authorId: string; day: string; action: CareAction; createdAt: string };
export type Answer = { id: string; authorId: string; day: string; text: string };
export type Game = { id: string; players: string[]; board: number[]; turn: number; winner: number | null; status: 'playing' | 'finished'; createdAt: string; finishedAt: string | null };
export type QuizAnswer = { authorId: string; day: string; choices: number[] };
export type Space = { id: string; startedOn: string; mode: 'nearby' | 'distance'; timeZone: string; profiles: Profile[]; moments: Moment[]; memoryPhotos: Moment[]; hasMoreMemories: boolean; plans: Plan[]; answers: Answer[]; canvas: Stroke[]; games: Game[]; quizzes: QuizAnswer[]; messages: ChatMessage[]; hasOlderMessages: boolean; pet: Pet | null; petCare: PetCare[]; featuresReady: boolean; moodHistory: MoodHistory | null };

export const QUIZ = [
  { prompt: 'Our ideal little escape?', options: ['A cabin in the hills', 'A place by the sea'] },
  { prompt: 'A perfect evening together?', options: ['Cook something new', 'Order in & a movie'] },
  { prompt: 'Our next adventure should be…', options: ['Beautifully planned', 'A little spontaneous'] },
  { prompt: 'I’d love a surprise…', options: ['Handwritten letter', 'Unexpected day out'] },
  { prompt: 'The best kind of Sunday?', options: ['An early adventure', 'A very slow morning'] },
];
export function sharedDay(timeZone: string, date = new Date()) {
  try { const parts = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date); return ['year', 'month', 'day'].map(k => parts.find(p => p.type === k)?.value).join('-'); }
  catch { return dateKey(date); }
}
export function newGame(players: string[]): Game { return { id: makeId(), players, board: Array(42).fill(0), turn: 1, winner: null, status: 'playing', createdAt: new Date().toISOString(), finishedAt: null }; }
export function dropPiece(game: Game, column: number, player: number): Game {
  if (game.status !== 'playing') throw new Error('This round is finished. Start a rematch.');
  if (player !== game.turn) throw new Error('It’s your partner’s turn.');
  if (!Number.isInteger(column) || column < 0 || column > 6) throw new Error('Choose a column on the board.');
  let row = 5; while (row >= 0 && game.board[row * 7 + column]) row--;
  if (row < 0) throw new Error('That column is full. Choose another one.');
  const board = [...game.board]; board[row * 7 + column] = player;
  let winner: number | null = null;
  for (const [dr, dc] of [[0, 1], [1, 0], [1, 1], [1, -1]]) {
    let count = 1;
    for (const direction of [-1, 1]) { let r = row + dr * direction; let c = column + dc * direction; while (r >= 0 && r < 6 && c >= 0 && c < 7 && board[r * 7 + c] === player) { count++; r += dr * direction; c += dc * direction; } }
    if (count >= 4) winner = player;
  }
  const finished = winner !== null || board.every(Boolean);
  return { ...game, board, turn: player === 1 ? 2 : 1, winner: finished ? winner ?? 0 : null, status: finished ? 'finished' : 'playing', finishedAt: finished ? new Date().toISOString() : null };
}
export function quizMatch(a: number[], b: number[]) { if (a.length !== QUIZ.length || b.length !== QUIZ.length || [...a, ...b].some(x => x !== 0 && x !== 1)) return null; return Math.round(a.filter((x, i) => x === b[i]).length / QUIZ.length * 100); }
export function strokePath(stroke: Stroke) { return stroke.points.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' '); }

// Keep earlier prompts stable so saved answers never acquire a different question.
const ORIGINAL_QUESTIONS = [
  'What’s one tiny thing I do that makes you feel loved?',
  'If we had a whole day with no responsibilities, what would we do?',
  'Which memory of us would you like to live again?',
  'What’s something you’re looking forward to sharing with me?',
  'When did you last feel really understood by me?',
  'What would make this week a little easier for you?',
  'What’s one new thing you want us to try together?',
  'What ordinary moment with me feels like home?',
  'What song feels like our story right now?',
  'What’s a dream you haven’t told me much about yet?',
  'What’s a small adventure we could go on this month?',
  'What made you smile today?',
  'What’s something you appreciate about how we’ve grown?',
  'What does your ideal slow Sunday with me look like?',
];
export const QUESTIONS = [
  'If we opened a tiny café, what would we call it?',
  'We have a free afternoon and no plans. Where are we going?',
  'Which ordinary moment with me deserves its own movie scene?',
  'What snack would you sneak into our next movie night?',
  'If our relationship had a theme song today, what would it be?',
  'Which of us would survive longer on a cooking show?',
  'What silly little tradition should we start?',
  'We can teleport anywhere for dinner. Where are we eating?',
  'What would our pet say about us if they could talk?',
  'What is one thing you want us to try just for the fun of it?',
  'Design our perfect rainy Sunday in three words.',
  'What tiny thing reminded you of me today?',
  'Which photo of us would you put on a postcard?',
  'If we swapped hobbies for a day, what would happen?',
];

export function dateKey(date = new Date()) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; }
export function dayNumber(day: string) { const [y, m, d] = day.split('-').map(Number); return Math.floor(Date.UTC(y, m - 1, d) / 86400000); }
export function daysTogether(start: string, today = dateKey()) { return Math.max(0, dayNumber(today) - dayNumber(start)); }
export function questionFor(day: string) {
  const prompts = day < '2026-11-05' ? ORIGINAL_QUESTIONS : QUESTIONS;
  const offset = day < '2026-11-05' ? 0 : dayNumber('2026-11-05');
  return prompts[((dayNumber(day) - offset) % prompts.length + prompts.length) % prompts.length];
}
export function moodFor(id: string) { return MOODS.find(m => m.id === id) ?? MOODS[0]; }
export function makeId() { return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`; }
export function relativeTime(iso: string) {
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}
export function validDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00`);
  return !Number.isNaN(date.getTime()) && dateKey(date) === value;
}
export function cleanText(value: string, max = 500) {
  const clean = value.trim();
  if (!clean) throw new Error('Add a few words first.');
  if (clean.length > max) throw new Error(`Please keep it under ${max} characters.`);
  return clean;
}
export function visibleAnswers(answers: Answer[], day: string, userId: string) {
  const todays = answers.filter(answer => answer.day === day);
  return todays.some(answer => answer.authorId === userId) ? todays : [];
}

export function createDemo(): Space {
  const now = Date.now();
  const tomorrow = new Date(now); tomorrow.setDate(tomorrow.getDate() + 3);
  const start = new Date(now); start.setDate(start.getDate() - 247);
  return {
    id: 'demo', startedOn: dateKey(start), mode: 'distance', timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata', canvas: [], games: [], quizzes: [], pet: null, petCare: [], featuresReady: true, hasOlderMessages: false, moodHistory: { entries: [], streaks: [] }, memoryPhotos: [], hasMoreMemories: false,
    messages: [
      { id: 'demo-chat-1', authorId: 'jamie', text: 'Hey you. What was the best little part of your day? 🌿', createdAt: new Date(now - 8 * 60000).toISOString() },
      { id: 'demo-chat-2', authorId: 'alex', text: 'Honestly? Having something to look forward to with you.', createdAt: new Date(now - 6 * 60000).toISOString() },
      { id: 'demo-chat-3', authorId: 'jamie', text: 'Then let’s plan something. Just us. ♡', createdAt: new Date(now - 5 * 60000).toISOString() },
    ],
    profiles: [
      { id: 'alex', name: 'Alex', mood: 'loved', moodNote: '', need: 'A hug', moodAt: new Date(now - 3600000).toISOString() },
      { id: 'jamie', name: 'Jamie', mood: 'happy', moodNote: 'The sun is out and I’m thinking about our next little adventure.', need: 'Something fun', moodAt: new Date(now - 12 * 60000).toISOString() },
    ],
    moments: [
      { id: 'demo-note', authorId: 'jamie', kind: 'note', text: 'Saw something beautiful today. Immediately wanted to tell you. ♡', createdAt: new Date(now - 34 * 60000).toISOString(), hearts: [] },
      { id: 'demo-hug', authorId: 'alex', kind: 'hug', text: 'A little hug, until the next real one.', createdAt: new Date(now - 6 * 3600000).toISOString(), hearts: ['jamie'] },
    ],
    plans: [
      { id: 'demo-date', authorId: 'jamie', title: 'Coffee, a long walk & absolutely no rush', date: dateKey(tomorrow), kind: 'date', done: false },
      { id: 'demo-wish', authorId: 'alex', title: 'Watch the sunrise somewhere new', date: '', kind: 'wish', done: false },
    ],
    answers: [{ id: 'demo-answer', authorId: 'jamie', day: dateKey(), text: 'It’s the little moments with you. You always find a way to make an ordinary day feel special.' }],
  };
}

