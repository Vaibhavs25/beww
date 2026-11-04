export type MoodId = 'happy' | 'loved' | 'calm' | 'low' | 'stressed' | 'missing' | 'space';
export type Mood = { id: MoodId; label: string; emoji: string; color: string; background: string; title: string; subtitle: string; action: string; note: string };

export const MOODS: Mood[] = [
  { id: 'happy', label: 'Happy', emoji: '☀️', color: '#8C4A27', background: '#F6E8D5', title: 'A little sunshine,\njust for you.', subtitle: 'Good days feel even better when you share them.', action: 'Send a little love', note: 'Your happiness is my favorite thing.' },
  { id: 'loved', label: 'Loved', emoji: '💗', color: '#8E352E', background: '#F5DFDA', title: 'Love looks\ngood on us.', subtitle: 'A little reminder that you are someone’s favorite person.', action: 'Love you right back', note: 'I love doing life with you.' },
  { id: 'calm', label: 'Calm', emoji: '🌿', color: '#3D5A45', background: '#E4EDE4', title: 'Somewhere soft\nto land.', subtitle: 'No big plans needed. Just a quiet moment together.', action: 'Send a quiet hello', note: 'No need to reply. Just thinking of you.' },
  { id: 'low', label: 'Low', emoji: '🌧️', color: '#4A586E', background: '#E5EAF0', title: 'A softer kind\nof together.', subtitle: 'Some days call for a little more kindness and a little less noise.', action: 'Send a warm hug', note: 'You don’t have to have the words. I’m here for you.' },
  { id: 'stressed', label: 'Stressed', emoji: '🫧', color: '#6E4E3A', background: '#EFE6DC', title: 'One breath.\nThen another.', subtitle: 'You don’t have to fix anything. Being there can be enough.', action: 'Let them know you’re here', note: 'I’m on your team. Tell me what would help, whenever you’re ready.' },
  { id: 'missing', label: 'Miss you', emoji: '🌙', color: '#6B4258', background: '#F0E3EA', title: 'Miles apart.\nStill right here.', subtitle: 'Make the space between you feel a little smaller.', action: 'Send an “I miss you”', note: 'Wish I could reach through the screen and hold your hand.' },
  { id: 'space', label: 'Need space', emoji: '☁️', color: '#5A554E', background: '#ECE8E1', title: 'A little room\nto breathe.', subtitle: 'Space can be loving, too. Let them come back in their own time.', action: 'Send one gentle note', note: 'Take the time you need. I’m here when you’re ready—no reply needed.' },
];

export const NEEDS = ['A hug', 'Just listen', 'Something fun', 'Quiet time', 'Nothing right now'];
export type Profile = { id: string; name: string; mood: MoodId; moodNote: string; need: string; moodAt: string };
export type MoodLog = { authorId: string; day: string; mood: MoodId; note: string; need: string; createdAt: string };
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
export type AdventureCategory = 'travel' | 'hobby' | 'fantasy' | 'intimacy';
export type AdventureGoal = { id: string; authorId: string; title: string; notes: string; category: AdventureCategory; completed: boolean; completedAt?: string; archived: boolean; createdAt: string };
export type JournalTag = 'reflection' | 'gratitude' | 'memory' | 'letter';
export type JournalEntry = { id: string; authorId: string; day: string; title: string; body: string; tag: JournalTag; hearts: string[]; createdAt: string };
export type Space = { id: string; startedOn: string; mode: 'nearby' | 'distance'; timeZone: string; profiles: Profile[]; moodLogs?: MoodLog[]; adventures?: AdventureGoal[]; journal?: JournalEntry[]; moments: Moment[]; plans: Plan[]; answers: Answer[]; canvas: Stroke[]; games: Game[]; quizzes: QuizAnswer[]; messages: ChatMessage[]; hasOlderMessages: boolean; pet: Pet | null; petCare: PetCare[]; featuresReady: boolean };

export const JOURNAL_TAGS: { id: JournalTag; label: string; badge: string; prompt: string; bg: string; accent: string }[] = [
  { id: 'reflection', label: 'Reflection', badge: 'DAILY REFLECTION', prompt: 'How today felt, what stayed with you, or a quiet thought…', bg: '#EFE6DC', accent: '#6E4E3A' },
  { id: 'gratitude', label: 'Gratitude', badge: 'SMALL GRATITUDE', prompt: 'One little thing about us or today I’m grateful for…', bg: '#E4EDE4', accent: '#3D5A45' },
  { id: 'memory', label: 'Memory', badge: 'KEEPSAKE MEMORY', prompt: 'A moment from today I don’t want us to forget…', bg: '#F6E8D5', accent: '#8C4A27' },
  { id: 'letter', label: 'Love note', badge: 'LETTER TO YOU', prompt: 'Something I wanted to leave on the page for you to read…', bg: '#F5DFDA', accent: '#8E352E' },
];

export function journalTagMeta(tag: JournalTag) {
  return JOURNAL_TAGS.find(t => t.id === tag) ?? JOURNAL_TAGS[0];
}

export const ADVENTURE_CATEGORIES: { id: AdventureCategory; label: string; badge: string; placeholder: string; bg: string; accent: string }[] = [
  { id: 'travel', label: 'Travel', badge: 'TRAVEL & ESCAPES', placeholder: 'Overnight train trip, coastal cabin, stargazing…', bg: '#EFE6DC', accent: '#6E4E3A' },
  { id: 'hobby', label: 'Hobbies', badge: 'HOBBIES & RITUALS', placeholder: 'Take a pottery class, bake sourdough, learn a dance…', bg: '#E4EDE4', accent: '#3D5A45' },
  { id: 'fantasy', label: 'Fantasy', badge: 'FANTASY & DESIRES', placeholder: 'Secret getaway roleplay, midnight swim, dress-up night…', bg: '#F0E3EA', accent: '#6B4258' },
  { id: 'intimacy', label: 'Intimacy', badge: 'INTIMACY & SPICE', placeholder: 'Candlelit massage night, bedroom bucket list idea, slow morning…', bg: '#F5DFDA', accent: '#8E352E' },
];

export function adventureCategoryMeta(category: AdventureCategory) {
  return ADVENTURE_CATEGORIES.find(c => c.id === category) ?? ADVENTURE_CATEGORIES[0];
}

export type QuizPrompt = { prompt: string; options: [string, string] };
export type QuizPack = { id: string; title: string; questions: QuizPrompt[] };

export const QUIZ: QuizPrompt[] = [
  { prompt: 'Our ideal little escape?', options: ['A cabin in the hills', 'A place by the sea'] },
  { prompt: 'A perfect evening together?', options: ['Cook something new', 'Order in & a movie'] },
  { prompt: 'Our next adventure should be…', options: ['Beautifully planned', 'A little spontaneous'] },
  { prompt: 'I’d love a surprise…', options: ['Handwritten letter', 'Unexpected day out'] },
  { prompt: 'The best kind of Sunday?', options: ['An early adventure', 'A very slow morning'] },
];

export const QUIZ_PACKS: QuizPack[] = [
  { id: 'cozy', title: 'Cozy escapes & slow days', questions: QUIZ },
  {
    id: 'playful',
    title: 'Playful sparks & rituals',
    questions: [
      { prompt: 'When we have 20 free minutes…', options: ['Laugh over a quick game', 'Cuddle & talk about nothing'] },
      { prompt: 'Road trip soundtrack?', options: ['Sing-along throwbacks', 'Calm indie & late-night talks'] },
      { prompt: 'Sweet treat to share?', options: ['Warm bakery pastry', 'Two spoons & ice cream'] },
      { prompt: 'Our funniest habit is…', options: ['Inside jokes no one gets', 'Sending memes from the next room'] },
      { prompt: 'Rainy afternoon mood?', options: ['Board games & tea', 'Blanket fort & a classic film'] },
    ],
  },
  {
    id: 'dreaming',
    title: 'Dreaming ahead together',
    questions: [
      { prompt: 'A dream home detail?', options: ['A sunlit kitchen for two', 'A cozy reading & music nook'] },
      { prompt: 'Next big celebration?', options: ['Just the two of us somewhere quiet', 'A lively dinner with favorite people'] },
      { prompt: 'If we learned a skill together…', options: ['Baking or regional cooking', 'Pottery, painting, or dance'] },
      { prompt: 'Souvenir worth keeping?', options: ['Printed photo strip', 'Something handmade from a market'] },
      { prompt: 'Best way to end a long week?', options: ['Sunset walk with no phones', 'Late-night pancakes at home'] },
    ],
  },
];

export function quizFor(day: string, offset = 0): QuizPack {
  const index = (((dayNumber(day) + offset) % QUIZ_PACKS.length) + QUIZ_PACKS.length) % QUIZ_PACKS.length;
  return QUIZ_PACKS[index];
}
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

export type DailyQuestionItem = { id: string; tag: string; prompt: string; hint: string };

export const DAILY_QUESTIONS: DailyQuestionItem[] = [
  { id: 'tiny-love', tag: 'LITTLE JOYS', prompt: 'What’s one tiny thing I do that makes you feel loved?', hint: 'Think about morning habits, small gestures, or the way they say hello.' },
  { id: 'free-day', tag: 'PLAYFUL WONDER', prompt: 'If we had a whole day with no responsibilities, what would we do?', hint: 'No alarms, no errands—just whatever sounds fun to both of you.' },
  { id: 'relive-memory', tag: 'NOSTALGIA', prompt: 'Which memory of us would you like to live again?', hint: 'A trip, a quiet afternoon, or a moment where you couldn’t stop laughing.' },
  { id: 'looking-forward', tag: 'US LATELY', prompt: 'What’s something you’re looking forward to sharing with me?', hint: 'A meal, a show, a story from today, or an upcoming plan.' },
  { id: 'understood', tag: 'HEART TO HEART', prompt: 'When did you last feel really understood by me?', hint: 'Sometimes it’s a conversation; sometimes it’s not needing to explain at all.' },
  { id: 'easier-week', tag: 'TEAMWORK', prompt: 'What would make this week a little easier for you?', hint: 'A small favor, a quiet evening, or taking one task off your plate.' },
  { id: 'try-new', tag: 'PLAYFUL SPARK', prompt: 'What’s one new thing you want us to try together?', hint: 'Could be a recipe, a late-night walk, a game, or a weekend detour.' },
  { id: 'feels-like-home', tag: 'COZY RITUALS', prompt: 'What ordinary moment with me feels like home?', hint: 'Cooking side by side, grocery runs, or talking before falling asleep.' },
  { id: 'our-song', tag: 'SOUNDTRACK', prompt: 'What song feels like our story right now?', hint: 'Upbeat, nostalgic, or something we’ve had on repeat lately.' },
  { id: 'untold-dream', tag: 'DREAMING AHEAD', prompt: 'What’s a dream you haven’t told me much about yet?', hint: 'Big or small, practical or delightfully unrealistic.' },
  { id: 'small-adventure', tag: 'WANDERLUST', prompt: 'What’s a small adventure we could go on this month?', hint: 'A neighborhood bakery, a scenic drive, or somewhere neither of us has been.' },
  { id: 'smiled-today', tag: 'LIGHTHEARTED', prompt: 'What made you smile today?', hint: 'Even the smallest funny or unexpected moment counts.' },
  { id: 'how-we-grew', tag: 'GRATITUDE', prompt: 'What’s something you appreciate about how we’ve grown?', hint: 'How you handle tough days, laugh quicker, or make time for each other.' },
  { id: 'slow-sunday', tag: 'SLOW MORNINGS', prompt: 'What does your ideal slow Sunday with me look like?', hint: 'Coffee in bed, open windows, a walk, or doing nothing at all.' },
];

export const QUESTIONS = DAILY_QUESTIONS.map(q => q.prompt);

export function dateKey(date = new Date()) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; }
export function dayNumber(day: string) { const [y, m, d] = day.split('-').map(Number); return Math.floor(Date.UTC(y, m - 1, d) / 86400000); }
export function daysTogether(start: string, today = dateKey()) { return Math.max(0, dayNumber(today) - dayNumber(start)); }
export function dailyQuestionItemFor(day: string, offset = 0): DailyQuestionItem & { index: number; total: number } {
  const total = DAILY_QUESTIONS.length;
  const index = (((dayNumber(day) + offset) % total) + total) % total;
  return { ...DAILY_QUESTIONS[index], index, total };
}
export function questionFor(day: string, offset = 0) { return dailyQuestionItemFor(day, offset).prompt; }
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

export function shiftDay(day: string, offsetDays: number) {
  const [y, m, d] = day.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + offsetDays, 12, 0, 0));
  return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, '0')}-${String(dt.getUTCDate()).padStart(2, '0')}`;
}

export function recentDays(today: string, count = 7) {
  return Array.from({ length: count }, (_, idx) => shiftDay(today, idx - (count - 1)));
}

export function upsertMoodLog(logs: MoodLog[], entry: MoodLog): MoodLog[] {
  const filtered = logs.filter(item => !(item.authorId === entry.authorId && item.day === entry.day));
  return [...filtered, entry].sort((a, b) => a.day.localeCompare(b.day) || a.createdAt.localeCompare(b.createdAt)).slice(-120);
}

export function moodStreak(logs: MoodLog[], authorId: string, today: string) {
  const days = new Set(logs.filter(item => item.authorId === authorId).map(item => item.day));
  let cursor = days.has(today) ? today : shiftDay(today, -1);
  let count = 0;
  while (days.has(cursor)) {
    count++;
    cursor = shiftDay(cursor, -1);
  }
  return count;
}

export function coupleMoodTimeline(logs: MoodLog[] | undefined, profiles: Profile[], timeZone: string, today: string, userId: string) {
  let merged = [...(logs ?? [])];
  for (const profile of profiles) {
    if (!profile.moodAt) continue;
    const loggedDay = sharedDay(timeZone, new Date(profile.moodAt));
    if (!merged.some(item => item.authorId === profile.id && item.day === loggedDay)) {
      merged = upsertMoodLog(merged, {
        authorId: profile.id,
        day: loggedDay,
        mood: profile.mood,
        note: profile.moodNote,
        need: profile.need,
        createdAt: profile.moodAt,
      });
    }
  }
  const partnerId = profiles.find(p => p.id !== userId)?.id;
  const myStreak = moodStreak(merged, userId, today);
  const partnerStreak = partnerId ? moodStreak(merged, partnerId, today) : 0;
  const activeDays = new Set(merged.map(item => item.day));
  let cursor = activeDays.has(today) ? today : shiftDay(today, -1);
  let combinedStreak = 0;
  while (activeDays.has(cursor)) {
    combinedStreak++;
    cursor = shiftDay(cursor, -1);
  }
  const days = recentDays(today, 7).map(day => {
    const dt = new Date(`${day}T12:00:00`);
    const weekday = dt.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 3);
    const dayNum = day.slice(-2).replace(/^0/, '');
    return {
      day,
      weekday,
      dayNum,
      isToday: day === today,
      mine: merged.find(item => item.authorId === userId && item.day === day),
      theirs: partnerId ? merged.find(item => item.authorId === partnerId && item.day === day) : undefined,
    };
  });
  return { logs: merged, myStreak, partnerStreak, combinedStreak, days };
}

export function recentPhotoMoments(moments: Moment[], nowMs = Date.now(), days = 30): Moment[] {
  const cutoff = nowMs - days * 86400000;
  return moments
    .filter(m => m.kind === 'photo' && Boolean(m.image) && Date.parse(m.createdAt) >= cutoff)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function planVoteCount(plan: Plan): number {
  return (plan.acceptedBy ?? []).length;
}

export function togglePlanVote(plan: Plan, userId: string): Plan {
  const current = plan.acceptedBy ?? [];
  const next = current.includes(userId) ? current.filter(id => id !== userId) : [...current, userId];
  return { ...plan, acceptedBy: next };
}

export function rankUpcomingPlans(plans: Plan[], todayKey: string): Plan[] {
  return plans
    .filter(p => !p.done && (p.kind === 'wish' || !p.date || p.date >= todayKey))
    .sort((a, b) => {
      const voteDiff = planVoteCount(b) - planVoteCount(a);
      if (voteDiff !== 0) return voteDiff;
      return (a.date || '9999').localeCompare(b.date || '9999') || (a.time ?? '').localeCompare(b.time ?? '');
    });
}

export function createAdventureGoal(authorId: string, title: string, category: AdventureCategory, notes = '', nowIso = new Date().toISOString()): AdventureGoal {
  const cleanTitle = cleanText(title, 120);
  const cleanNotes = notes.trim().slice(0, 300);
  if (!ADVENTURE_CATEGORIES.some(c => c.id === category)) throw new Error('Choose a valid adventure category.');
  return {
    id: makeId(),
    authorId,
    title: cleanTitle,
    notes: cleanNotes,
    category,
    completed: false,
    archived: false,
    createdAt: nowIso,
  };
}

export function toggleAdventureCompleted(goals: AdventureGoal[], id: string, nowIso = new Date().toISOString()): AdventureGoal[] {
  return goals.map(g => (g.id === id ? { ...g, completed: !g.completed, completedAt: !g.completed ? nowIso : undefined } : g));
}

export function toggleAdventureArchived(goals: AdventureGoal[], id: string): AdventureGoal[] {
  return goals.map(g => (g.id === id ? { ...g, archived: !g.archived } : g));
}

export function adventureProgress(goals: AdventureGoal[] | undefined, category: AdventureCategory | 'all' = 'all') {
  const list = goals ?? [];
  const active = list.filter(g => !g.archived && (category === 'all' || g.category === category));
  const archived = list.filter(g => g.archived && (category === 'all' || g.category === category)).length;
  const total = active.length;
  const completed = active.filter(g => g.completed).length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  return { total, completed, archived, percent };
}

export function createJournalEntry(
  authorId: string,
  day: string,
  body: string,
  title = '',
  tag: JournalTag = 'reflection',
  nowIso = new Date().toISOString()
): JournalEntry {
  const cleanBody = cleanText(body, 1500);
  const cleanTitle = title.trim().slice(0, 120);
  if (!JOURNAL_TAGS.some(t => t.id === tag)) throw new Error('Choose a valid journal tag.');
  return {
    id: makeId(),
    authorId,
    day,
    title: cleanTitle,
    body: cleanBody,
    tag,
    hearts: [],
    createdAt: nowIso,
  };
}

export function toggleJournalHeart(entries: JournalEntry[], id: string, userId: string): JournalEntry[] {
  return entries.map(entry => {
    if (entry.id !== id) return entry;
    const has = entry.hearts.includes(userId);
    return {
      ...entry,
      hearts: has ? entry.hearts.filter(h => h !== userId) : [...entry.hearts, userId],
    };
  });
}

export function sortJournalEntries(
  entries: JournalEntry[] | undefined,
  order: 'newest' | 'oldest' = 'newest',
  authorFilter = 'all'
): JournalEntry[] {
  const list = (entries ?? []).filter(e => authorFilter === 'all' || e.authorId === authorFilter);
  return [...list].sort((a, b) =>
    order === 'newest'
      ? b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id)
      : a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id)
  );
}

function demoPhotoUri(bg: string, sun: string, hill1: string, hill2: string, detail: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="400" height="300" fill="${bg}"/><circle cx="295" cy="78" r="36" fill="${sun}"/><path d="M0 210 Q110 135 230 205 T400 175 V300 H0 Z" fill="${hill1}"/><path d="M0 242 Q160 175 280 245 T400 220 V300 H0 Z" fill="${hill2}"/><path d="${detail}" stroke="#FFFDF9" stroke-width="5" fill="none" stroke-linecap="round"/></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function createDemo(): Space {
  const now = Date.now();
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';
  const today = sharedDay(tz, new Date(now));
  const tomorrow = new Date(now); tomorrow.setDate(tomorrow.getDate() + 3);
  const nextWeekend = new Date(now); nextWeekend.setDate(nextWeekend.getDate() + 6);
  const start = new Date(now); start.setDate(start.getDate() - 247);
  return {
    id: 'demo', startedOn: dateKey(start), mode: 'distance', timeZone: tz, canvas: [], games: [], quizzes: [], pet: null, petCare: [], featuresReady: true, hasOlderMessages: false,
    messages: [
      { id: 'demo-chat-1', authorId: 'jamie', text: 'Hey you. What was the best little part of your day? 🌿', createdAt: new Date(now - 8 * 60000).toISOString() },
      { id: 'demo-chat-2', authorId: 'alex', text: 'Honestly? Having something to look forward to with you.', createdAt: new Date(now - 6 * 60000).toISOString() },
      { id: 'demo-chat-3', authorId: 'jamie', text: 'Then let’s plan something. Just us. ♡', createdAt: new Date(now - 5 * 60000).toISOString() },
    ],
    profiles: [
      { id: 'alex', name: 'Alex', mood: 'loved', moodNote: '', need: 'A hug', moodAt: new Date(now - 3600000).toISOString() },
      { id: 'jamie', name: 'Jamie', mood: 'happy', moodNote: 'The sun is out and I’m thinking about our next little adventure.', need: 'Something fun', moodAt: new Date(now - 12 * 60000).toISOString() },
    ],
    moodLogs: [
      { authorId: 'alex', day: shiftDay(today, -3), mood: 'calm', note: 'Slow morning coffee before work.', need: 'Quiet time', createdAt: new Date(now - 3 * 86400000).toISOString() },
      { authorId: 'jamie', day: shiftDay(today, -3), mood: 'loved', note: 'Still smiling about our call.', need: 'Nothing right now', createdAt: new Date(now - 3 * 86400000).toISOString() },
      { authorId: 'alex', day: shiftDay(today, -2), mood: 'missing', note: 'Counting down until next week.', need: 'A hug', createdAt: new Date(now - 2 * 86400000).toISOString() },
      { authorId: 'jamie', day: shiftDay(today, -2), mood: 'calm', note: 'Rainy evening on my side of town.', need: 'Just listen', createdAt: new Date(now - 2 * 86400000).toISOString() },
      { authorId: 'alex', day: shiftDay(today, -1), mood: 'happy', note: 'Finished a busy day early!', need: 'Something fun', createdAt: new Date(now - 86400000).toISOString() },
      { authorId: 'jamie', day: shiftDay(today, -1), mood: 'loved', note: 'Loved your voice note.', need: 'A hug', createdAt: new Date(now - 86400000).toISOString() },
      { authorId: 'alex', day: today, mood: 'loved', note: '', need: 'A hug', createdAt: new Date(now - 3600000).toISOString() },
      { authorId: 'jamie', day: today, mood: 'happy', note: 'The sun is out and I’m thinking about our next little adventure.', need: 'Something fun', createdAt: new Date(now - 12 * 60000).toISOString() },
    ],
    adventures: [
      { id: 'adv-travel-1', authorId: 'jamie', title: 'Rent a hillside cabin with no Wi-Fi for a weekend', notes: 'Bring board games, good coffee, and warm blankets.', category: 'travel', completed: false, archived: false, createdAt: new Date(now - 10 * 86400000).toISOString() },
      { id: 'adv-hobby-1', authorId: 'alex', title: 'Take a wheel-throwing pottery workshop together', notes: 'Make each other a morning coffee mug.', category: 'hobby', completed: true, completedAt: new Date(now - 4 * 86400000).toISOString(), archived: false, createdAt: new Date(now - 15 * 86400000).toISOString() },
      { id: 'adv-fantasy-1', authorId: 'jamie', title: 'Meet at a hotel bar pretending we’re strangers', notes: 'Dress up, use aliases, and go upstairs together.', category: 'fantasy', completed: false, archived: false, createdAt: new Date(now - 7 * 86400000).toISOString() },
      { id: 'adv-intimacy-1', authorId: 'alex', title: 'Unplugged candlelit massage & slow intimacy night', notes: 'Phones off at 8pm, warm oil, and zero rush.', category: 'intimacy', completed: false, archived: false, createdAt: new Date(now - 3 * 86400000).toISOString() },
    ],
    journal: [
      { id: 'journal-1', authorId: 'jamie', day: today, title: 'How easy it feels to talk to you', body: 'Even when we both have full days, ten minutes on the phone with you resets my whole evening. Grateful for our quiet rhythm.', tag: 'gratitude', hearts: ['alex'], createdAt: new Date(now - 2 * 3600000).toISOString() },
      { id: 'journal-2', authorId: 'alex', day: shiftDay(today, -2), title: 'Sunday coffee & open windows', body: 'I kept thinking about how we spent all morning laughing over burnt toast and crossword clues. I want a hundred more Sundays just like that.', tag: 'memory', hearts: ['jamie'], createdAt: new Date(now - 2 * 86400000).toISOString() },
      { id: 'journal-3', authorId: 'jamie', day: shiftDay(today, -5), title: 'A little note for mid-week', body: 'In case this week feels noisy: I’m so proud of how hard you’ve been working, and I’m always in your corner.', tag: 'letter', hearts: ['alex', 'jamie'], createdAt: new Date(now - 5 * 86400000).toISOString() },
    ],
    moments: [
      { id: 'demo-note', authorId: 'jamie', kind: 'note', text: 'Saw something beautiful today. Immediately wanted to tell you. ♡', createdAt: new Date(now - 34 * 60000).toISOString(), hearts: [] },
      { id: 'demo-hug', authorId: 'alex', kind: 'hug', text: 'A little hug, until the next real one.', createdAt: new Date(now - 6 * 3600000).toISOString(), hearts: ['jamie'] },
      { id: 'demo-photo-1', authorId: 'jamie', kind: 'photo', text: 'Golden hour on my walk home—wished you were right beside me.', image: demoPhotoUri('#F4E3D3', '#E09F67', '#C89B7B', '#9C6B53', 'M95 110 q14 -12 28 0 M132 92 q11 -9 22 0'), createdAt: new Date(now - 2 * 86400000).toISOString(), hearts: ['alex'] },
      { id: 'demo-photo-2', authorId: 'alex', kind: 'photo', text: 'Two mugs ready for our Sunday morning coffee call.', image: demoPhotoUri('#E8ECE6', '#D9B48F', '#95A792', '#5E725F', 'M180 260 Q190 215 235 190'), createdAt: new Date(now - 6 * 86400000).toISOString(), hearts: ['jamie', 'alex'] },
      { id: 'demo-photo-3', authorId: 'jamie', kind: 'photo', text: 'Quiet evening skies from the balcony tonight.', image: demoPhotoUri('#EAE2DC', '#C98A7A', '#9E7B76', '#6D4E52', 'M70 85 L74 95 L84 95 L76 101 L79 111 L70 105 L61 111 L64 101 L56 95 L66 95 Z'), createdAt: new Date(now - 14 * 86400000).toISOString(), hearts: ['alex'] },
    ],
    plans: [
      { id: 'demo-date', authorId: 'jamie', title: 'Coffee, a long walk & absolutely no rush', date: dateKey(tomorrow), time: '10:30', place: 'Corner Roasters & Park Trail', format: 'in-person', kind: 'date', done: false, acceptedBy: ['jamie'], revision: 1 },
      { id: 'demo-date-2', authorId: 'alex', title: 'Homemade pasta & vinyl night', date: dateKey(nextWeekend), time: '19:30', place: 'Our kitchen', format: 'in-person', kind: 'date', done: false, acceptedBy: ['alex', 'jamie'], revision: 1 },
      { id: 'demo-wish', authorId: 'alex', title: 'Watch the sunrise somewhere new', date: '', kind: 'wish', done: false, acceptedBy: ['alex'], revision: 1 },
    ],
    answers: [{ id: 'demo-answer', authorId: 'jamie', day: dateKey(), text: 'It’s the little moments with you. You always find a way to make an ordinary day feel special.' }],
  };
}

