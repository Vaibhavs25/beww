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
export type GenderId = 'girl' | 'boy';
export type CoupleOriginStory = {
  myName: string;
  partnerName: string;
  partnerNickname: string;
  myGender: GenderId;
  partnerGender: GenderId;
  whenWeMet: string;
  partnerOutfit: string;
  whoProposed: string;
  proposalNote?: string;
  whenRelationshipStarted: string;
  relationshipStartedAt: string;
  myAvatar?: string;
  partnerAvatar?: string;
  inviteCode: string;
  joinedCode?: string;
  isLinked?: boolean;
  linkedAt?: string;
  acceptedTerms?: boolean;
  acceptedPrivacy?: boolean;
  legalAcceptedAt?: string;
  legalVersion?: string;
};
export type Profile = { id: string; name: string; nickname?: string; gender?: GenderId; avatar?: string; mood: MoodId; moodNote: string; need: string; moodAt: string };
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
export type TriviaQuestion = { id: string; authorId: string; prompt: string; options: [string, string, string]; correctIndex: number; guesses: Record<string, number>; createdAt: string };
export type QuickNoteColor = 'butter' | 'blush' | 'sage' | 'peach';
export type QuickNote = { id: string; authorId: string; text: string; color: QuickNoteColor; image?: string; pinned?: boolean; hearts: string[]; createdAt: string };
export type InstantPicPreset = { id: string; label: string; emoji: string; color: QuickNoteColor; image: string };
export type ErrandCategory = 'groceries' | 'home' | 'admin' | 'treats';
export type ErrandItem = { id: string; authorId: string; title: string; category: ErrandCategory; assigneeId?: string; done: boolean; completedBy?: string; completedAt?: string; createdAt: string };
export type PartnerAlertKind = 'journal' | 'instant-pic' | 'quick-note';
export type PartnerAlertPreferences = {
  enabled: boolean;
  journal: boolean;
  instantPic: boolean;
  quickNote: boolean;
};
export type PartnerNotificationItem = {
  id: string;
  sourceId: string;
  kind: PartnerAlertKind;
  title: string;
  body: string;
  authorId: string;
  authorName: string;
  targetRoute: string;
  createdAt: string;
  read: boolean;
};
export type Space = { id: string; startedOn: string; originStory?: CoupleOriginStory; mode: 'nearby' | 'distance'; timeZone: string; profiles: Profile[]; moodLogs?: MoodLog[]; moodStreaks?: { authorId: string; days: number; lastDay: string }[]; adventures?: AdventureGoal[]; journal?: JournalEntry[]; trivia?: TriviaQuestion[]; quickNotes?: QuickNote[]; errands?: ErrandItem[]; moments: Moment[]; plans: Plan[]; answers: Answer[]; canvas: Stroke[]; games: Game[]; quizzes: QuizAnswer[]; messages: ChatMessage[]; hasOlderMessages: boolean; pet: Pet | null; petCare: PetCare[]; featuresReady: boolean };

export const QUICK_NOTE_COLORS: { id: QuickNoteColor; label: string; bg: string; border: string; tape: string; ink: string; muted: string }[] = [
  { id: 'butter', label: 'Butter', bg: '#FDF3C7', border: '#E6D284', tape: '#DFC364', ink: '#463514', muted: '#7A6230' },
  { id: 'blush', label: 'Blush', bg: '#FAE4DF', border: '#E4BEB6', tape: '#D69E93', ink: '#4E2520', muted: '#854B43' },
  { id: 'sage', label: 'Sage', bg: '#E5EFE4', border: '#BDD2BC', tape: '#9ABA99', ink: '#233D29', muted: '#4B6B52' },
  { id: 'peach', label: 'Peach', bg: '#FCEAD8', border: '#E6C6A8', tape: '#D9AC84', ink: '#4D3019', muted: '#825736' },
];

export function quickNoteColorMeta(color: QuickNoteColor) {
  return QUICK_NOTE_COLORS.find(c => c.id === color) ?? QUICK_NOTE_COLORS[0];
}

export const QUICK_NOTE_SPARKS: { text: string; color: QuickNoteColor }[] = [
  { text: 'Thinking of you right now ♡', color: 'blush' },
  { text: 'Coffee is on me later ☕', color: 'butter' },
  { text: 'So proud of you today.', color: 'sage' },
  { text: 'Can’t wait to see your face tonight!', color: 'peach' },
  { text: 'Saving a big hug for you.', color: 'blush' },
];

export const TRIVIA_TEMPLATES: { prompt: string; options: [string, string, string] }[] = [
  { prompt: 'My ultimate rainy-evening comfort order is…', options: ['Steaming ramen or noodle soup', 'Wood-fired pizza & a movie', 'Homemade grilled cheese & tea'] },
  { prompt: 'When I have a free Saturday morning, I secretly want to…', options: ['Sleep in with zero alarms', 'Head out early for pastries & coffee', 'Put on music and make a big breakfast'] },
  { prompt: 'The little gesture that melts me fastest is…', options: ['An unexpected hug from behind', 'A thoughtful text in the middle of the day', 'Bringing me my favorite drink unasked'] },
];

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

export type RelationshipClockBreakdown = {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalDays: number;
};

export function relationshipDurationBreakdown(startedAtOrDate: string, nowMs = Date.now()): RelationshipClockBreakdown {
  if (!startedAtOrDate) {
    return { years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0, totalDays: 0 };
  }
  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(startedAtOrDate.trim())
    ? `${startedAtOrDate.trim()}T00:00:00`
    : startedAtOrDate.trim();
  const start = new Date(normalized);
  const end = new Date(nowMs);
  if (Number.isNaN(start.getTime()) || end.getTime() <= start.getTime()) {
    return { years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0, totalDays: 0 };
  }

  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  let days = end.getDate() - start.getDate();
  let hours = end.getHours() - start.getHours();
  let minutes = end.getMinutes() - start.getMinutes();
  let seconds = end.getSeconds() - start.getSeconds();

  if (seconds < 0) {
    seconds += 60;
    minutes -= 1;
  }
  if (minutes < 0) {
    minutes += 60;
    hours -= 1;
  }
  if (hours < 0) {
    hours += 24;
    days -= 1;
  }
  if (days < 0) {
    const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0);
    days += prevMonth.getDate();
    months -= 1;
  }
  if (months < 0) {
    months += 12;
    years -= 1;
  }
  const totalDays = Math.max(0, Math.floor((end.getTime() - start.getTime()) / 86400000));
  return {
    years: Math.max(0, years),
    months: Math.max(0, months),
    days: Math.max(0, days),
    hours: Math.max(0, hours),
    minutes: Math.max(0, minutes),
    seconds: Math.max(0, seconds),
    totalDays,
  };
}

export function ordinalSuffix(n: number): string {
  const abs = Math.abs(Math.floor(n));
  const mod100 = abs % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${abs}th`;
  switch (abs % 10) {
    case 1:
      return `${abs}st`;
    case 2:
      return `${abs}nd`;
    case 3:
      return `${abs}rd`;
    default:
      return `${abs}th`;
  }
}

export function parseRelationshipStart(startedAtOrDate: string): Date | null {
  if (!startedAtOrDate || !startedAtOrDate.trim()) return null;
  const trimmed = startedAtOrDate.trim();
  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(trimmed) ? `${trimmed}T00:00:00` : trimmed;
  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function clampDayOfMonth(year: number, monthIndex: number, desiredDay: number): number {
  const maxDay = new Date(year, monthIndex + 1, 0).getDate();
  return Math.min(Math.max(1, desiredDay), maxDay);
}

export type CountdownBreakdown = {
  targetDate: string;
  targetIso: string;
  label: string;
  subtitle: string;
  anniversaryNumber: number;
  totalSeconds: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  progressPercent: number;
  isToday: boolean;
};

export function nextAnniversaryCountdown(startedAtOrDate: string, nowMs = Date.now()): CountdownBreakdown {
  const start = parseRelationshipStart(startedAtOrDate);
  const now = new Date(nowMs);
  if (!start) {
    const fallbackDate = dateKey(now);
    return {
      targetDate: fallbackDate,
      targetIso: now.toISOString(),
      label: '1st Anniversary',
      subtitle: 'Set your relationship start date to track your anniversary countdown',
      anniversaryNumber: 1,
      totalSeconds: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      progressPercent: 0,
      isToday: false,
    };
  }

  const startYear = start.getFullYear();
  const startMonth = start.getMonth();
  const startDay = start.getDate();
  const startHours = start.getHours();
  const startMinutes = start.getMinutes();
  const startSeconds = start.getSeconds();

  let yearsElapsed = Math.max(1, now.getFullYear() - startYear);
  let target = new Date(
    startYear + yearsElapsed,
    startMonth,
    clampDayOfMonth(startYear + yearsElapsed, startMonth, startDay),
    startHours,
    startMinutes,
    startSeconds
  );

  if (target.getTime() <= now.getTime()) {
    yearsElapsed += 1;
    target = new Date(
      startYear + yearsElapsed,
      startMonth,
      clampDayOfMonth(startYear + yearsElapsed, startMonth, startDay),
      startHours,
      startMinutes,
      startSeconds
    );
  }

  const prevYear = yearsElapsed - 1;
  const previousAnniversary = new Date(
    startYear + prevYear,
    startMonth,
    clampDayOfMonth(startYear + prevYear, startMonth, startDay),
    startHours,
    startMinutes,
    startSeconds
  );

  const diffMs = Math.max(0, target.getTime() - now.getTime());
  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const spanMs = Math.max(1, target.getTime() - previousAnniversary.getTime());
  const elapsedInCycle = Math.min(spanMs, Math.max(0, now.getTime() - previousAnniversary.getTime()));
  const progressPercent = Math.min(100, Math.max(0, Math.round((elapsedInCycle / spanMs) * 100)));

  const isToday =
    now.getFullYear() > startYear &&
    now.getMonth() === startMonth &&
    now.getDate() === clampDayOfMonth(now.getFullYear(), startMonth, startDay);

  return {
    targetDate: dateKey(target),
    targetIso: target.toISOString(),
    label: `${ordinalSuffix(yearsElapsed)} Anniversary`,
    subtitle: `Celebrating ${yearsElapsed} ${yearsElapsed === 1 ? 'year' : 'years'} together`,
    anniversaryNumber: yearsElapsed,
    totalSeconds,
    days,
    hours,
    minutes,
    seconds,
    progressPercent,
    isToday,
  };
}

export function nextMonthiversaryCountdown(startedAtOrDate: string, nowMs = Date.now()): CountdownBreakdown {
  const start = parseRelationshipStart(startedAtOrDate);
  const now = new Date(nowMs);
  if (!start) {
    const fallbackDate = dateKey(now);
    return {
      targetDate: fallbackDate,
      targetIso: now.toISOString(),
      label: '1st Monthiversary',
      subtitle: 'Monthly relationship milestone',
      anniversaryNumber: 1,
      totalSeconds: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      progressPercent: 0,
      isToday: false,
    };
  }

  const startDay = start.getDate();
  const startHours = start.getHours();
  const startMinutes = start.getMinutes();
  const startSeconds = start.getSeconds();

  let targetYear = now.getFullYear();
  let targetMonth = now.getMonth();
  let candidate = new Date(
    targetYear,
    targetMonth,
    clampDayOfMonth(targetYear, targetMonth, startDay),
    startHours,
    startMinutes,
    startSeconds
  );

  if (candidate.getTime() <= now.getTime() || candidate.getTime() <= start.getTime()) {
    targetMonth += 1;
    if (targetMonth > 11) {
      targetMonth = 0;
      targetYear += 1;
    }
    candidate = new Date(
      targetYear,
      targetMonth,
      clampDayOfMonth(targetYear, targetMonth, startDay),
      startHours,
      startMinutes,
      startSeconds
    );
  }

  const monthsCount = Math.max(
    1,
    (candidate.getFullYear() - start.getFullYear()) * 12 + (candidate.getMonth() - start.getMonth())
  );

  const prevMonthDate = new Date(
    candidate.getFullYear(),
    candidate.getMonth() - 1,
    clampDayOfMonth(candidate.getFullYear(), candidate.getMonth() - 1, startDay),
    startHours,
    startMinutes,
    startSeconds
  );

  const diffMs = Math.max(0, candidate.getTime() - now.getTime());
  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const spanMs = Math.max(1, candidate.getTime() - prevMonthDate.getTime());
  const elapsedInCycle = Math.min(spanMs, Math.max(0, now.getTime() - prevMonthDate.getTime()));
  const progressPercent = Math.min(100, Math.max(0, Math.round((elapsedInCycle / spanMs) * 100)));

  const isToday =
    now.getTime() >= start.getTime() &&
    now.getDate() === clampDayOfMonth(now.getFullYear(), now.getMonth(), startDay);

  return {
    targetDate: dateKey(candidate),
    targetIso: candidate.toISOString(),
    label: `${ordinalSuffix(monthsCount)} Monthiversary`,
    subtitle: `${monthsCount} ${monthsCount === 1 ? 'month' : 'months'} since your story began`,
    anniversaryNumber: monthsCount,
    totalSeconds,
    days,
    hours,
    minutes,
    seconds,
    progressPercent,
    isToday,
  };
}

export type RelationshipMilestoneKind =
  | 'origin'
  | 'onboarding-chapter'
  | 'anniversary'
  | 'monthiversary'
  | 'day-milestone'
  | 'linked'
  | 'date-plan';

export type RelationshipMilestone = {
  id: string;
  title: string;
  subtitle: string;
  detail?: string;
  date: string;
  timeLabel?: string;
  kind: RelationshipMilestoneKind;
  categoryLabel: string;
  isPast: boolean;
  isToday: boolean;
  daysDelta: number;
};

function extractEmbeddedDate(text: string | undefined, fallbackDate: string): string {
  if (!text) return fallbackDate;
  const isoMatch = text.match(/\b(\d{4}-\d{2}-\d{2})\b/);
  if (isoMatch && validDate(isoMatch[1])) {
    return isoMatch[1];
  }
  return fallbackDate;
}

export function buildRelationshipMilestones(
  startedAtOrDate: string,
  originStory?: CoupleOriginStory,
  plans: Plan[] = [],
  nowMs = Date.now()
): RelationshipMilestone[] {
  const effectiveStartRaw = originStory?.relationshipStartedAt || startedAtOrDate;
  const start = parseRelationshipStart(effectiveStartRaw);
  const now = new Date(nowMs);
  const todayStr = dateKey(now);

  if (!start) return [];

  const startDateStr = dateKey(start);
  const startTimeLabel = `${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}:${String(start.getSeconds()).padStart(2, '0')}`;
  const partnerDisplay = originStory?.partnerNickname || originStory?.partnerName || 'your partner';
  const pronounSubject = originStory?.partnerGender === 'girl' ? 'she' : 'he';

  const makeDelta = (targetDateStr: string) => {
    const delta = dayNumber(targetDateStr) - dayNumber(todayStr);
    return {
      daysDelta: delta,
      isPast: delta < 0,
      isToday: delta === 0,
    };
  };

  const milestones: RelationshipMilestone[] = [];

  // 1. Core Relationship Start (Collected in Onboarding Step 4)
  const originDelta = makeDelta(startDateStr);
  milestones.push({
    id: `origin-start-${startDateStr}`,
    title: 'When We Got in a Relationship',
    subtitle: originStory?.whenRelationshipStarted || `The day ${originStory?.myName || 'we'} & ${partnerDisplay} officially began`,
    detail: `Exact clock start: ${startDateStr} at ${startTimeLabel}`,
    date: startDateStr,
    timeLabel: startTimeLabel,
    kind: 'origin',
    categoryLabel: 'Relationship Start',
    ...originDelta,
  });

  // 2. Onboarding Question 1: When we first met
  if (originStory?.whenWeMet) {
    const metDate = extractEmbeddedDate(originStory.whenWeMet, startDateStr);
    const metDelta = makeDelta(metDate);
    milestones.push({
      id: `onboarding-met-${metDate}`,
      title: 'First Met Keepsake',
      subtitle: originStory.whenWeMet,
      detail: `Onboarding memory #1 with ${partnerDisplay}`,
      date: metDate,
      kind: 'onboarding-chapter',
      categoryLabel: 'Onboarding Story',
      ...metDelta,
    });
  }

  // 3. Onboarding Question 2: Partner's outfit
  if (originStory?.partnerOutfit) {
    const outfitDate = extractEmbeddedDate(originStory.whenWeMet, startDateStr);
    const outfitDelta = makeDelta(outfitDate);
    milestones.push({
      id: `onboarding-outfit-${outfitDate}`,
      title: `What ${pronounSubject === 'she' ? 'She' : 'He'} Was Wearing`,
      subtitle: originStory.partnerOutfit,
      detail: `Onboarding memory #2 · The outfit ${partnerDisplay} wore`,
      date: outfitDate,
      kind: 'onboarding-chapter',
      categoryLabel: 'Onboarding Story',
      ...outfitDelta,
    });
  }

  // 4. Onboarding Question 3: Who proposed first
  if (originStory?.whoProposed) {
    const proposalDelta = makeDelta(startDateStr);
    milestones.push({
      id: `onboarding-proposal-${startDateStr}`,
      title: 'The Proposal & Confession',
      subtitle: `${originStory.whoProposed} proposed first${originStory.proposalNote ? ` — "${originStory.proposalNote}"` : ''}`,
      detail: 'Onboarding memory #3 · How we said yes to us',
      date: startDateStr,
      kind: 'onboarding-chapter',
      categoryLabel: 'Onboarding Story',
      ...proposalDelta,
    });
  }

  // 5. Partner Account Link Milestone (Step 6 Code Verification)
  if (originStory?.linkedAt) {
    const linkedParsed = parseRelationshipStart(originStory.linkedAt);
    if (linkedParsed) {
      const linkedDate = dateKey(linkedParsed);
      const linkedDelta = makeDelta(linkedDate);
      milestones.push({
        id: `origin-linked-${linkedDate}`,
        title: 'Partner Space Linked',
        subtitle: 'Connected our private two-person space (one-time link)',
        detail: `${originStory.myName || 'You'} & ${partnerDisplay} linked accounts`,
        date: linkedDate,
        kind: 'linked',
        categoryLabel: 'Space Linked',
        ...linkedDelta,
      });
    }
  }

  // 6. Annual Anniversaries (Past completed + single Next Upcoming Anniversary)
  const nextAnniv = nextAnniversaryCountdown(effectiveStartRaw, nowMs);
  const maxYearToGenerate = Math.max(1, nextAnniv.anniversaryNumber);
  for (let yr = 1; yr <= maxYearToGenerate; yr++) {
    const targetYear = start.getFullYear() + yr;
    const targetDay = clampDayOfMonth(targetYear, start.getMonth(), start.getDate());
    const annivDate = new Date(targetYear, start.getMonth(), targetDay, start.getHours(), start.getMinutes(), start.getSeconds());
    const annivDateStr = dateKey(annivDate);
    const annivDelta = makeDelta(annivDateStr);
    milestones.push({
      id: `anniversary-year-${yr}`,
      title: `${ordinalSuffix(yr)} Anniversary`,
      subtitle: `${yr} ${yr === 1 ? 'full year' : 'years'} of ${originStory?.myName || 'you'} & ${partnerDisplay}`,
      detail: `Annual celebration on ${annivDateStr} at ${startTimeLabel}`,
      date: annivDateStr,
      timeLabel: startTimeLabel,
      kind: 'anniversary',
      categoryLabel: 'Annual Anniversary',
      ...annivDelta,
    });
  }

  // 7. Next Upcoming Monthiversary
  const nextMonthiv = nextMonthiversaryCountdown(effectiveStartRaw, nowMs);
  if (nextMonthiv.anniversaryNumber % 12 !== 0) {
    const monthDelta = makeDelta(nextMonthiv.targetDate);
    milestones.push({
      id: `monthiversary-${nextMonthiv.anniversaryNumber}`,
      title: nextMonthiv.label,
      subtitle: nextMonthiv.subtitle,
      detail: `Monthly milestone on day ${start.getDate()} of the month`,
      date: nextMonthiv.targetDate,
      timeLabel: startTimeLabel,
      kind: 'monthiversary',
      categoryLabel: 'Monthiversary',
      ...monthDelta,
    });
  }

  // 8. Special Day-Count Milestones (recent past + next 2 upcoming)
  const specialDays = [50, 100, 200, 300, 500, 750, 1000, 1500, 2000, 2500, 3000];
  let upcomingDayMilestonesCount = 0;
  for (const dayCount of specialDays) {
    const targetDate = new Date(start.getTime() + dayCount * 86400000);
    const targetDateStr = dateKey(targetDate);
    const delta = makeDelta(targetDateStr);
    if (delta.daysDelta >= -365 && (delta.daysDelta <= 0 || upcomingDayMilestonesCount < 2)) {
      if (delta.daysDelta > 0) {
        upcomingDayMilestonesCount += 1;
      }
      milestones.push({
        id: `day-milestone-${dayCount}`,
        title: `${dayCount.toLocaleString()} Days Together`,
        subtitle:
          delta.daysDelta > 0
            ? `In ${delta.daysDelta} ${delta.daysDelta === 1 ? 'day' : 'days'} · Special day-count celebration`
            : delta.daysDelta === 0
              ? 'Celebrating today!'
              : `Reached ${Math.abs(delta.daysDelta)} days ago`,
        detail: `${dayCount.toLocaleString()} days since ${startDateStr}`,
        date: targetDateStr,
        kind: 'day-milestone',
        categoryLabel: 'Day Milestone',
        ...delta,
      });
    }
  }

  // 9. Scheduled Date Plans from Planner
  for (const plan of plans) {
    if (plan.kind === 'date' && plan.date && validDate(plan.date)) {
      const planDelta = makeDelta(plan.date);
      milestones.push({
        id: `plan-${plan.id}`,
        title: plan.title,
        subtitle: plan.place ? `${plan.place}${plan.time ? ` · ${plan.time}` : ''}` : plan.notes || 'Planned date night',
        detail: plan.done ? 'Completed date memory' : 'Scheduled on your shared calendar',
        date: plan.date,
        timeLabel: plan.time,
        kind: 'date-plan',
        categoryLabel: 'Date Plan',
        ...planDelta,
      });
    }
  }

  return milestones.sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
}

export type CalendarDayCell = {
  date: string;
  dayOfMonth: number;
  inCurrentMonth: boolean;
  isToday: boolean;
  isStartDay: boolean;
  isAnniversaryDay: boolean;
  isMonthiversaryDay: boolean;
  milestones: RelationshipMilestone[];
};

export function buildCalendarMonthGrid(
  year: number,
  monthIndex: number,
  startedAtOrDate: string,
  milestones: RelationshipMilestone[],
  todayStr = dateKey()
): CalendarDayCell[] {
  const start = parseRelationshipStart(startedAtOrDate);
  const startDateStr = start ? dateKey(start) : '';
  const firstDayOfMonth = new Date(year, monthIndex, 1);
  const leadingWeekday = firstDayOfMonth.getDay(); // 0 (Sun) - 6 (Sat)

  const byDate = new Map<string, RelationshipMilestone[]>();
  for (const m of milestones) {
    const existing = byDate.get(m.date) ?? [];
    existing.push(m);
    byDate.set(m.date, existing);
  }

  const cells: CalendarDayCell[] = [];
  for (let i = 0; i < 42; i++) {
    const cellDate = new Date(year, monthIndex, 1 - leadingWeekday + i);
    const cellDateStr = dateKey(cellDate);
    const inCurrentMonth = cellDate.getFullYear() === year && cellDate.getMonth() === monthIndex;
    const isToday = cellDateStr === todayStr;
    const isStartDay = Boolean(startDateStr && cellDateStr === startDateStr);

    let isAnniversaryDay = false;
    let isMonthiversaryDay = false;
    const dayMilestones = [...(byDate.get(cellDateStr) ?? [])];

    if (start) {
      const targetDayInCellMonth = clampDayOfMonth(
        cellDate.getFullYear(),
        cellDate.getMonth(),
        start.getDate()
      );
      const monthsSinceStart =
        (cellDate.getFullYear() - start.getFullYear()) * 12 +
        (cellDate.getMonth() - start.getMonth());

      if (monthsSinceStart > 0 && cellDate.getDate() === targetDayInCellMonth) {
        if (cellDate.getMonth() === start.getMonth()) {
          isAnniversaryDay = true;
          const yr = cellDate.getFullYear() - start.getFullYear();
          if (!dayMilestones.some(m => m.kind === 'anniversary')) {
            const delta = dayNumber(cellDateStr) - dayNumber(todayStr);
            dayMilestones.push({
              id: `anniversary-year-${yr}`,
              title: `${ordinalSuffix(yr)} Anniversary`,
              subtitle: `Celebrating ${yr} ${yr === 1 ? 'year' : 'years'} together`,
              date: cellDateStr,
              kind: 'anniversary',
              categoryLabel: 'Annual Anniversary',
              daysDelta: delta,
              isPast: delta < 0,
              isToday: delta === 0,
            });
          }
        } else {
          isMonthiversaryDay = true;
          if (!dayMilestones.some(m => m.kind === 'monthiversary')) {
            const delta = dayNumber(cellDateStr) - dayNumber(todayStr);
            dayMilestones.push({
              id: `monthiversary-synth-${monthsSinceStart}`,
              title: `${ordinalSuffix(monthsSinceStart)} Monthiversary`,
              subtitle: `${monthsSinceStart} ${monthsSinceStart === 1 ? 'month' : 'months'} together`,
              date: cellDateStr,
              kind: 'monthiversary',
              categoryLabel: 'Monthiversary',
              daysDelta: delta,
              isPast: delta < 0,
              isToday: delta === 0,
            });
          }
        }
      }
    }

    cells.push({
      date: cellDateStr,
      dayOfMonth: cellDate.getDate(),
      inCurrentMonth,
      isToday,
      isStartDay,
      isAnniversaryDay,
      isMonthiversaryDay,
      milestones: dayMilestones,
    });
  }

  return cells;
}

export function generateSixDigitInviteCode(seed = '', existingCodes?: Iterable<string>): string {
  const existing = new Set(
    existingCodes ? Array.from(existingCodes, c => c.trim().replace(/\D/g, '')) : []
  );
  let seedHash = 0;
  for (let i = 0; i < seed.length; i++) {
    seedHash = (seedHash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  for (let attempt = 0; attempt < 50; attempt++) {
    const timeEntropy = (Date.now() + attempt * 7919) % 900000;
    const randomEntropy = Math.floor(Math.random() * 900000);
    const combined = ((timeEntropy ^ randomEntropy) + (seedHash % 900000)) % 900000;
    const sixDigit = String(100000 + Math.abs(combined)).slice(0, 6);
    if (!existing.has(sixDigit)) {
      return sixDigit;
    }
  }
  return String(100000 + Math.floor(Math.random() * 900000));
}

export function generateUniqueConnectionCode(seed = ''): string {
  return generateSixDigitInviteCode(seed);
}

export function generateCoupleInviteCode(): string {
  return generateSixDigitInviteCode();
}

export function normalizeConnectionCode(raw: string): string {
  const stripped = raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (!stripped) return '';
  const body = stripped.startsWith('CLSR') ? stripped.slice(4) : stripped;
  if (/^\d{6}$/.test(body)) {
    return body;
  }
  if (body.length === 8) {
    return `CLSR-${body.slice(0, 4)}-${body.slice(4, 8)}`;
  }
  if (body.length === 6) {
    return body;
  }
  return stripped.startsWith('CLSR') ? `CLSR-${body}` : body;
}

export function isValidSixDigitCode(raw: string): boolean {
  const normalized = normalizeConnectionCode(raw);
  return /^\d{6}$/.test(normalized);
}

export function isValidConnectionCode(raw: string): boolean {
  const normalized = normalizeConnectionCode(raw);
  if (/^\d{6}$/.test(normalized)) return true;
  const stripped = raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  const body = stripped.startsWith('CLSR') ? stripped.slice(4) : stripped;
  return body.length >= 6 && body.length <= 12;
}

function portraitSvgUri(bg: string, hair: string, skin: string, shirt: string, longHair: boolean) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240"><rect width="240" height="240" rx="120" fill="${bg}"/>${longHair ? `<path d="M62 115 C62 55 178 55 178 115 L186 190 L54 190 Z" fill="${hair}"/>` : `<path d="M68 108 C68 56 172 56 172 108 Z" fill="${hair}"/>`}<path d="M55 240 C62 178 178 178 185 240 Z" fill="${shirt}"/><circle cx="120" cy="116" r="44" fill="${skin}"/><path d="M74 102 C82 66 158 66 166 102 C146 84 94 84 74 102 Z" fill="${hair}"/><circle cx="104" cy="116" r="4.5" fill="#2B1E1A"/><circle cx="136" cy="116" r="4.5" fill="#2B1E1A"/><path d="M107 134 Q120 144 133 134" stroke="#8E352E" stroke-width="3.5" stroke-linecap="round" fill="none"/></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const AVATAR_PRESETS: { id: string; label: string; gender: GenderId; uri: string }[] = [
  { id: 'girl-rose', label: 'Warm Rose', gender: 'girl', uri: portraitSvgUri('#F5DFDA', '#3B231A', '#F2C6B2', '#9E3B33', true) },
  { id: 'girl-sun', label: 'Golden Sun', gender: 'girl', uri: portraitSvgUri('#F6E8D5', '#5C3A21', '#E5B59A', '#6B4258', true) },
  { id: 'boy-sage', label: 'Calm Sage', gender: 'boy', uri: portraitSvgUri('#E4EDE4', '#2C221E', '#E8BD9E', '#3D5A45', false) },
  { id: 'boy-clay', label: 'Terracotta', gender: 'boy', uri: portraitSvgUri('#EFE6DC', '#4A3222', '#F0C8B0', '#8C4A27', false) },
];

export const OUTFIT_SUGGESTIONS: Record<GenderId, string[]> = {
  girl: ['Floral sundress', 'Black dress', 'Kurti / traditional wear', 'Denim jacket & jeans', 'Cozy oversized sweater', 'White shirt & jeans'],
  boy: ['Crisp button-down shirt', 'Black hoodie & jeans', 'Casual tee & jacket', 'Kurta / traditional wear', 'Denim shirt', 'Smart blazer'],
};
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
  return [...filtered, entry].sort((a, b) => a.day.localeCompare(b.day) || a.createdAt.localeCompare(b.createdAt));
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

export function coupleMoodTimeline(logs: MoodLog[] | undefined, profiles: Profile[], timeZone: string, today: string, userId: string, streaks?: Space['moodStreaks']) {
  const merged = logs ?? [];
  const partnerId = profiles.find(p => p.id !== userId)?.id;
  const runFor = (id: string) => streaks ? (streaks.find(run => run.authorId === id && run.lastDay >= shiftDay(today, -1) && run.lastDay <= today)?.days ?? 0) : moodStreak(merged, id, today);
  const myStreak = runFor(userId);
  const partnerStreak = partnerId ? runFor(partnerId) : 0;
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
    .filter(m => m.kind === 'photo' && Boolean(m.image) && Date.parse(m.createdAt) >= cutoff && Date.parse(m.createdAt) <= nowMs)
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

export function createTriviaQuestion(
  authorId: string,
  prompt: string,
  options: [string, string, string],
  correctIndex: number,
  nowIso = new Date().toISOString()
): TriviaQuestion {
  const cleanPrompt = cleanText(prompt, 140);
  if (!Array.isArray(options) || options.length !== 3) throw new Error('Provide three answer options.');
  const cleanOptions = options.map(opt => cleanText(opt, 90)) as [string, string, string];
  if (!Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex > 2) {
    throw new Error('Select which option is the true answer.');
  }
  return {
    id: makeId(),
    authorId,
    prompt: cleanPrompt,
    options: cleanOptions,
    correctIndex,
    guesses: {},
    createdAt: nowIso,
  };
}

export function answerTriviaQuestion(
  questions: TriviaQuestion[],
  questionId: string,
  responderId: string,
  choiceIndex: number
): TriviaQuestion[] {
  if (!Number.isInteger(choiceIndex) || choiceIndex < 0 || choiceIndex > 2) {
    throw new Error('Choose one of the three options.');
  }
  return questions.map(q => {
    if (q.id !== questionId) return q;
    if (q.authorId === responderId) throw new Error('Your partner guesses the questions you wrote.');
    return {
      ...q,
      guesses: { ...q.guesses, [responderId]: choiceIndex },
    };
  });
}

export function triviaScoreboard(questions: TriviaQuestion[] | undefined, profiles: Profile[], userId: string) {
  const list = questions ?? [];
  const partnerId = profiles.find(p => p.id !== userId)?.id ?? '';

  const forMe = list.filter(q => q.authorId !== userId);
  const myAnswered = forMe.filter(q => typeof q.guesses[userId] === 'number');
  const myCorrect = myAnswered.filter(q => q.guesses[userId] === q.correctIndex).length;
  const myPending = forMe.length - myAnswered.length;

  const forPartner = list.filter(q => q.authorId === userId);
  const partnerAnswered = partnerId ? forPartner.filter(q => typeof q.guesses[partnerId] === 'number') : [];
  const partnerCorrect = partnerId ? partnerAnswered.filter(q => q.guesses[partnerId] === q.correctIndex).length : 0;
  const partnerPending = forPartner.length - partnerAnswered.length;

  const totalAnswered = myAnswered.length + partnerAnswered.length;
  const totalCorrect = myCorrect + partnerCorrect;
  const overallPercent = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;
  const totalPoints = totalCorrect * 10;
  const levelLabel =
    totalAnswered === 0
      ? 'Ready for Round One'
      : overallPercent >= 80
        ? 'Soulmate Scholars'
        : overallPercent >= 50
          ? 'In-Sync Sweethearts'
          : 'Curious Companions';

  return {
    myCorrect,
    myAnswered: myAnswered.length,
    myTotal: forMe.length,
    myPending,
    partnerCorrect,
    partnerAnswered: partnerAnswered.length,
    partnerTotal: forPartner.length,
    partnerPending,
    totalCorrect,
    totalAnswered,
    overallPercent,
    totalPoints,
    levelLabel,
  };
}

function demoPhotoUri(bg: string, sun: string, hill1: string, hill2: string, detail: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="400" height="300" fill="${bg}"/><circle cx="295" cy="78" r="36" fill="${sun}"/><path d="M0 210 Q110 135 230 205 T400 175 V300 H0 Z" fill="${hill1}"/><path d="M0 242 Q160 175 280 245 T400 220 V300 H0 Z" fill="${hill2}"/><path d="${detail}" stroke="#FFFDF9" stroke-width="5" fill="none" stroke-linecap="round"/></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const INSTANT_PIC_PRESETS: InstantPicPreset[] = [
  {
    id: 'coffee',
    label: 'Coffee break',
    emoji: '☕',
    color: 'butter',
    image: demoPhotoUri('#F6E8D5', '#D99B66', '#C49A76', '#8C5E3C', 'M175 230 Q195 180 225 230 M160 245 H240'),
  },
  {
    id: 'window',
    label: 'My view',
    emoji: '🌤️',
    color: 'peach',
    image: demoPhotoUri('#F4E3D3', '#E09F67', '#C89B7B', '#9C6B53', 'M95 110 q14 -12 28 0 M132 92 q11 -9 22 0'),
  },
  {
    id: 'desk',
    label: 'Desk hello',
    emoji: '🌿',
    color: 'sage',
    image: demoPhotoUri('#E4EDE4', '#C9B48F', '#8EA88E', '#536E58', 'M200 255 V185 M200 215 Q175 195 165 205 M200 200 Q225 180 235 190'),
  },
  {
    id: 'evening',
    label: 'Cozy night',
    emoji: '🌙',
    color: 'blush',
    image: demoPhotoUri('#EAE2DC', '#C98A7A', '#9E7B76', '#6D4E52', 'M70 85 L74 95 L84 95 L76 101 L79 111 L70 105 L61 111 L64 101 L56 95 L66 95 Z'),
  },
];

export function createQuickNote(
  authorId: string,
  text: string,
  color: QuickNoteColor = 'butter',
  nowIso = new Date().toISOString(),
  image?: string
): QuickNote {
  const validColor = QUICK_NOTE_COLORS.some(c => c.id === color) ? color : 'butter';
  const cleanedText = image ? text.trim().slice(0, 160) : cleanText(text, 160);
  return {
    id: makeId(),
    authorId,
    text: cleanedText,
    color: validColor,
    image,
    pinned: false,
    hearts: [],
    createdAt: nowIso,
  };
}

export function updateQuickNoteCaption(
  notes: QuickNote[],
  noteId: string,
  authorId: string,
  text: string
): QuickNote[] {
  const trimmed = text.trim().slice(0, 160);
  return notes.map(n => {
    if (n.id !== noteId) return n;
    if (n.authorId !== authorId) throw new Error('You can only edit your own sticky note.');
    if (!n.image && !trimmed) throw new Error('Sticky note text cannot be empty.');
    return { ...n, text: trimmed };
  });
}

export function toggleQuickNoteHeart(notes: QuickNote[], noteId: string, userId: string): QuickNote[] {
  return notes.map(n => {
    if (n.id !== noteId) return n;
    const has = n.hearts.includes(userId);
    return {
      ...n,
      hearts: has ? n.hearts.filter(id => id !== userId) : [...n.hearts, userId],
    };
  });
}

export function toggleQuickNotePin(notes: QuickNote[], noteId: string): QuickNote[] {
  return notes.map(n => (n.id === noteId ? { ...n, pinned: !n.pinned } : n));
}

export function removeQuickNote(notes: QuickNote[], noteId: string, userId: string): QuickNote[] {
  const target = notes.find(n => n.id === noteId);
  if (!target) return notes;
  if (target.authorId !== userId) throw new Error('You can only remove sticky notes you left.');
  return notes.filter(n => n.id !== noteId);
}

export function sortQuickNotes(notes: QuickNote[] | undefined): QuickNote[] {
  const list = [...(notes ?? [])];
  return list.sort((a, b) => {
    if (Boolean(a.pinned) !== Boolean(b.pinned)) return a.pinned ? -1 : 1;
    return Date.parse(b.createdAt) - Date.parse(a.createdAt);
  });
}

export const ERRAND_CATEGORIES: { id: ErrandCategory; label: string; placeholder: string; bg: string; accent: string }[] = [
  { id: 'groceries', label: 'Groceries', placeholder: 'Oat milk, sourdough, fresh berries…', bg: '#E4EDE4', accent: '#3D5A45' },
  { id: 'home', label: 'Home & Chores', placeholder: 'Water the balcony plants, fold warm laundry…', bg: '#EFE6DC', accent: '#6E4E3A' },
  { id: 'admin', label: 'Life & Bills', placeholder: 'Confirm Friday table, mail package, utilities…', bg: '#E5EAF0', accent: '#4A586E' },
  { id: 'treats', label: 'Little Treats', placeholder: 'Grab espresso beans, pick up fresh flowers…', bg: '#F5DFDA', accent: '#8E352E' },
];

export function errandCategoryMeta(category: ErrandCategory) {
  return ERRAND_CATEGORIES.find(c => c.id === category) ?? ERRAND_CATEGORIES[0];
}

export const QUICK_ERRAND_SUGGESTIONS: { title: string; category: ErrandCategory }[] = [
  { title: 'Pick up oat milk & eggs', category: 'groceries' },
  { title: 'Water the houseplants', category: 'home' },
  { title: 'Grab fresh coffee beans', category: 'treats' },
  { title: 'Confirm weekend dinner spot', category: 'admin' },
];

export function createErrandItem(
  authorId: string,
  title: string,
  category: ErrandCategory = 'groceries',
  assigneeId?: string,
  nowIso = new Date().toISOString()
): ErrandItem {
  const validCategory = ERRAND_CATEGORIES.some(c => c.id === category) ? category : 'groceries';
  const cleanedAssignee = assigneeId && assigneeId.trim() ? assigneeId.trim() : undefined;
  return {
    id: makeId(),
    authorId,
    title: cleanText(title, 140),
    category: validCategory,
    assigneeId: cleanedAssignee,
    done: false,
    createdAt: nowIso,
  };
}

export function toggleErrandItem(
  errands: ErrandItem[],
  id: string,
  actorId: string,
  nowIso = new Date().toISOString()
): ErrandItem[] {
  return errands.map(item => {
    if (item.id !== id) return item;
    const nextDone = !item.done;
    return {
      ...item,
      done: nextDone,
      completedBy: nextDone ? actorId : undefined,
      completedAt: nextDone ? nowIso : undefined,
    };
  });
}

export function removeErrandItem(errands: ErrandItem[], id: string): ErrandItem[] {
  return errands.filter(item => item.id !== id);
}

export function clearCompletedErrands(errands: ErrandItem[]): ErrandItem[] {
  return errands.filter(item => !item.done);
}

export function errandsProgress(errands: ErrandItem[] | undefined) {
  const list = [...(errands ?? [])];
  const activeList = list
    .filter(item => !item.done)
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  const completedList = list
    .filter(item => item.done)
    .sort((a, b) => Date.parse(b.completedAt ?? b.createdAt) - Date.parse(a.completedAt ?? a.createdAt));
  const total = list.length;
  const completed = completedList.length;
  const pending = activeList.length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  return {
    total,
    completed,
    pending,
    percent,
    activeList,
    completedList,
    allList: [...activeList, ...completedList],
  };
}

export const DEFAULT_PARTNER_ALERT_PREFS: PartnerAlertPreferences = {
  enabled: true,
  journal: true,
  instantPic: true,
  quickNote: true,
};

export function shouldSendPartnerAlert(kind: PartnerAlertKind, prefs: PartnerAlertPreferences): boolean {
  if (!prefs.enabled) return false;
  if (kind === 'journal') return prefs.journal;
  if (kind === 'instant-pic') return prefs.instantPic;
  if (kind === 'quick-note') return prefs.quickNote;
  return false;
}

export function buildPartnerAlertForJournal(
  entry: JournalEntry,
  authorName: string
): PartnerNotificationItem {
  const cleanAuthor = authorName.trim() || 'Your partner';
  const tagMeta = journalTagMeta(entry.tag);
  const snippet = entry.body.trim().slice(0, 96) + (entry.body.trim().length > 96 ? '…' : '');
  const body = entry.title.trim()
    ? `“${entry.title.trim()}” · ${snippet}`
    : `${tagMeta.label}: “${snippet}”`;
  return {
    id: `notif-journal-${entry.id}`,
    sourceId: entry.id,
    kind: 'journal',
    title: `${cleanAuthor} posted in your Shared Journal`,
    body,
    authorId: entry.authorId,
    authorName: cleanAuthor,
    targetRoute: '/journal',
    createdAt: entry.createdAt || new Date().toISOString(),
    read: false,
  };
}

export function buildPartnerAlertForQuickNote(
  note: QuickNote,
  authorName: string
): PartnerNotificationItem {
  const cleanAuthor = authorName.trim() || 'Your partner';
  const isInstantPic = Boolean(note.image);
  if (isInstantPic) {
    const caption = note.text.trim();
    return {
      id: `notif-pic-${note.id}`,
      sourceId: note.id,
      kind: 'instant-pic',
      title: `${cleanAuthor} shared an Instant Pic 📸`,
      body: caption
        ? `“${caption.slice(0, 96)}${caption.length > 96 ? '…' : ''}”`
        : 'A new instant snapshot was pinned to your dashboard.',
      authorId: note.authorId,
      authorName: cleanAuthor,
      targetRoute: '/',
      createdAt: note.createdAt || new Date().toISOString(),
      read: false,
    };
  }
  const snippet = note.text.trim().slice(0, 100) + (note.text.trim().length > 100 ? '…' : '');
  return {
    id: `notif-note-${note.id}`,
    sourceId: note.id,
    kind: 'quick-note',
    title: `${cleanAuthor} left a Quick Note on your board`,
    body: `“${snippet}”`,
    authorId: note.authorId,
    authorName: cleanAuthor,
    targetRoute: '/',
    createdAt: note.createdAt || new Date().toISOString(),
    read: false,
  };
}

export function buildPartnerAlertForPhotoMoment(
  moment: Moment,
  authorName: string
): PartnerNotificationItem {
  const cleanAuthor = authorName.trim() || 'Your partner';
  const caption = moment.text.trim();
  return {
    id: `notif-moment-pic-${moment.id}`,
    sourceId: moment.id,
    kind: 'instant-pic',
    title: `${cleanAuthor} shared an Instant Pic 📸`,
    body: caption
      ? `“${caption.slice(0, 96)}${caption.length > 96 ? '…' : ''}”`
      : 'A new photo moment just arrived in your shared space.',
    authorId: moment.authorId,
    authorName: cleanAuthor,
    targetRoute: '/',
    createdAt: moment.createdAt || new Date().toISOString(),
    read: false,
  };
}

export function diffNewPartnerActivities(
  prevSpace: Space,
  nextSpace: Space,
  currentUserId: string
): PartnerNotificationItem[] {
  if (!prevSpace.id || prevSpace.id !== nextSpace.id) return [];
  const alerts: PartnerNotificationItem[] = [];
  const resolveAuthorName = (authorId: string) => {
    const profile = nextSpace.profiles.find(p => p.id === authorId);
    return (
      profile?.nickname ||
      profile?.name ||
      nextSpace.originStory?.partnerNickname ||
      nextSpace.originStory?.partnerName ||
      'Your partner'
    );
  };

  const prevJournalIds = new Set((prevSpace.journal ?? []).map(j => j.id));
  for (const entry of nextSpace.journal ?? []) {
    if (entry.authorId !== currentUserId && !prevJournalIds.has(entry.id)) {
      alerts.push(buildPartnerAlertForJournal(entry, resolveAuthorName(entry.authorId)));
    }
  }

  const prevNoteIds = new Set((prevSpace.quickNotes ?? []).map(n => n.id));
  for (const note of nextSpace.quickNotes ?? []) {
    if (note.authorId !== currentUserId && !prevNoteIds.has(note.id)) {
      alerts.push(buildPartnerAlertForQuickNote(note, resolveAuthorName(note.authorId)));
    }
  }

  const prevMomentIds = new Set((prevSpace.moments ?? []).map(m => m.id));
  for (const moment of nextSpace.moments ?? []) {
    if (
      moment.kind === 'photo' &&
      moment.authorId !== currentUserId &&
      !prevMomentIds.has(moment.id)
    ) {
      alerts.push(buildPartnerAlertForPhotoMoment(moment, resolveAuthorName(moment.authorId)));
    }
  }

  return alerts.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
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
    trivia: [
      { id: 'triv-1', authorId: 'jamie', prompt: 'What is my ultimate rainy-evening comfort order?', options: ['Spicy ramen & gyoza', 'Margherita pizza & tiramisu', 'Grilled cheese & tomato soup'], correctIndex: 0, guesses: {}, createdAt: new Date(now - 4 * 3600000).toISOString() },
      { id: 'triv-2', authorId: 'jamie', prompt: 'Which small gesture melts me the fastest after a long day?', options: ['Making me a cup of tea unasked', 'A long hug in the hallway', 'Playing my favorite song in the car'], correctIndex: 1, guesses: { alex: 1 }, createdAt: new Date(now - 2 * 86400000).toISOString() },
      { id: 'triv-3', authorId: 'alex', prompt: 'If we had a free Sunday morning with zero plans, what would I pick first?', options: ['Walk to the corner bakery for croissants', 'Stay in bed reading & talking until noon', 'Drive somewhere scenic with iced coffee'], correctIndex: 0, guesses: { jamie: 0 }, createdAt: new Date(now - 3 * 86400000).toISOString() },
    ],
    quickNotes: [
      { id: 'qn-1', authorId: 'jamie', text: 'Don’t forget how proud I am of you today. Knock ’em dead in your afternoon meeting ♡', color: 'butter', pinned: true, hearts: ['alex'], createdAt: new Date(now - 25 * 60000).toISOString() },
      { id: 'qn-2', authorId: 'jamie', text: '', color: 'peach', image: demoPhotoUri('#F6E8D5', '#D99B66', '#C49A76', '#8C5E3C', 'M175 230 Q195 180 225 230 M160 245 H240'), pinned: false, hearts: ['alex'], createdAt: new Date(now - 95 * 60000).toISOString() },
      { id: 'qn-3', authorId: 'alex', text: 'I saved the last pastry on the counter for you ☕', color: 'sage', pinned: false, hearts: ['jamie'], createdAt: new Date(now - 4 * 3600000).toISOString() },
    ],
    errands: [
      { id: 'err-1', authorId: 'jamie', title: 'Pick up oat milk, sourdough & lemons on the way home', category: 'groceries', done: false, createdAt: new Date(now - 50 * 60000).toISOString() },
      { id: 'err-2', authorId: 'alex', title: 'Water the balcony herbs and living room fern', category: 'home', assigneeId: 'alex', done: false, createdAt: new Date(now - 2 * 3600000).toISOString() },
      { id: 'err-3', authorId: 'jamie', title: 'Confirm Friday 7:30pm table at Corner Bistro', category: 'admin', assigneeId: 'jamie', done: false, createdAt: new Date(now - 3 * 3600000).toISOString() },
      { id: 'err-4', authorId: 'alex', title: 'Restock whole-bean espresso for morning coffee', category: 'treats', done: true, completedBy: 'jamie', completedAt: new Date(now - 35 * 60000).toISOString(), createdAt: new Date(now - 6 * 3600000).toISOString() },
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

export const LEGAL_POLICY_VERSION = '2026.11';

export type LegalDocumentSection = {
  id: string;
  heading: string;
  body: string;
};

export const TERMS_OF_SERVICE_SECTIONS: LegalDocumentSection[] = [
  {
    id: 'tos-1',
    heading: '1. Private Two-Person Space & Eligibility',
    body: 'Closer is a private relationship space designed exclusively for two consenting partners. By creating or joining a space with a 6-digit connection code, you confirm that you have permission to link with your partner and share content within your private space.',
  },
  {
    id: 'tos-2',
    heading: '2. Your Shared Content & Ownership',
    body: 'You and your partner retain full ownership of all photos, journal entries, quick notes, drawings, mood check-ins, and messages you create in Closer. We use your content solely to synchronize and display your private couple space across your linked devices.',
  },
  {
    id: 'tos-3',
    heading: '3. Respectful Use & One-Time Partner Link',
    body: 'Connection codes are intended solely for linking once with your partner. You agree not to share your couple code publicly, attempt to guess another couple’s code, or use Closer to send unsolicited, abusive, or unlawful material.',
  },
  {
    id: 'tos-4',
    heading: '4. Space Reset, Unlinking & Data Export',
    body: 'Either partner may export their shared keepsake archive or reset/leave the shared space at any time from the Us settings tab.',
  },
];

export const PRIVACY_POLICY_SECTIONS: LegalDocumentSection[] = [
  {
    id: 'priv-1',
    heading: '1. What We Collect & Store',
    body: 'Closer stores your relationship configuration (names, nicknames, relationship start date, milestones), shared moments, journal entries, mood logs, and chat messages so both partners can access their shared world.',
  },
  {
    id: 'priv-2',
    heading: '2. Zero Ad Tracking or Data Selling',
    body: 'We never sell, rent, or share your relationship data, photos, or messages with advertisers or third-party data brokers. Your space has no public profile, no social feed, and no third-party ad SDKs.',
  },
  {
    id: 'priv-3',
    heading: '3. Camera, Photo Library, Microphone & Notifications',
    body: 'Camera and photo library permissions are used strictly when you choose to upload profile avatars, Instant Pics, or Memory Lane photos. Microphone/camera access for calls and push notifications for partner alerts are used only when explicitly enabled by you.',
  },
  {
    id: 'priv-4',
    heading: '4. Security & Deletion Rights',
    body: 'Access to cloud-synced couple spaces is restricted via row-level security to the two linked partner accounts. You can export or permanently clear your local and shared space data at any time.',
  },
];

export function validateLegalAgreement(
  acceptedTerms: boolean,
  acceptedPrivacy: boolean
): { valid: boolean; error?: string } {
  if (!acceptedTerms && !acceptedPrivacy) {
    return {
      valid: false,
      error: 'Please accept both the Terms of Service and Privacy Policy before entering your main dashboard.',
    };
  }
  if (!acceptedTerms) {
    return {
      valid: false,
      error: 'Please accept the Terms of Service to continue.',
    };
  }
  if (!acceptedPrivacy) {
    return {
      valid: false,
      error: 'Please accept the Privacy Policy to continue.',
    };
  }
  return { valid: true };
}

export type OnboardingStepId = 'mode' | 'identity' | 'story' | 'date' | 'photos' | 'code' | 'legal';

export type OnboardingStepMeta = {
  step: number;
  id: OnboardingStepId;
  shortLabel: string;
  title: string;
  subtitle: string;
};

export const ONBOARDING_STEPS: OnboardingStepMeta[] = [
  {
    step: 1,
    id: 'mode',
    shortLabel: 'Distance',
    title: 'First, how close are the two of you?',
    subtitle: 'Choose whether you are in a long-distance relationship or near by right now.',
  },
  {
    step: 2,
    id: 'identity',
    shortLabel: 'Nicknames',
    title: 'Names, cute nicknames & who’s who.',
    subtitle: 'Tell us your name, the affectionate nickname you call your partner, and choose Girl or Boy for each of you.',
  },
  {
    step: 3,
    id: 'story',
    shortLabel: 'Our Story',
    title: 'How the two of you began.',
    subtitle: 'Answer a few sweet questions about when you met, what they wore, who proposed, and when you got together.',
  },
  {
    step: 4,
    id: 'date',
    shortLabel: 'Start Date',
    title: 'Set your relationship start date & clock.',
    subtitle: 'Pick the year, month, date, hour, minute, and second you got into a relationship—and watch your live timer tick.',
  },
  {
    step: 5,
    id: 'photos',
    shortLabel: 'Photos',
    title: 'Add your profile pictures.',
    subtitle: 'Upload photos from your camera or gallery (or pick a warm portrait) for both of your profiles.',
  },
  {
    step: 6,
    id: 'code',
    shortLabel: 'Invite Code',
    title: 'Share your unique connection code.',
    subtitle: 'Share your unique 6-digit connection code so your partner can join your shared world, or redeem their code.',
  },
  {
    step: 7,
    id: 'legal',
    shortLabel: 'Terms & Privacy',
    title: 'Terms of Service & Privacy Policy.',
    subtitle: 'Review and accept our mandatory Terms of Service and Privacy Policy before entering your main dashboard.',
  },
];

export type OnboardingDraft = {
  mode: 'nearby' | 'distance';
  myName: string;
  partnerName: string;
  partnerNickname: string;
  myGender: GenderId;
  partnerGender: GenderId;
  whenWeMet: string;
  partnerOutfit: string;
  whoProposed: string;
  proposalNote: string;
  whenRelationshipStarted: string;
  relationshipStartedAt: string;
  myAvatar?: string;
  partnerAvatar?: string;
  inviteCode: string;
  joinCode: string;
  acceptedTerms: boolean;
  acceptedPrivacy: boolean;
};

export function createInitialOnboardingDraft(
  existing?: Partial<CoupleOriginStory>,
  initialMode: 'nearby' | 'distance' = 'distance',
  fallbackDate?: Date
): OnboardingDraft {
  const defaultStart = fallbackDate ? new Date(fallbackDate.getTime()) : new Date();
  if (!fallbackDate) {
    defaultStart.setMonth(defaultStart.getMonth() - 6);
    defaultStart.setHours(20, 30, 0, 0);
  }
  const myGender: GenderId = existing?.myGender || 'boy';
  const partnerGender: GenderId = existing?.partnerGender || 'girl';
  const myName = existing?.myName || '';
  const partnerNickname = existing?.partnerNickname || '';
  const partnerName = existing?.partnerName || '';
  const inviteCode =
    existing?.inviteCode && isValidConnectionCode(existing.inviteCode)
      ? normalizeConnectionCode(existing.inviteCode)
      : generateSixDigitInviteCode(`${myName}-${partnerNickname}`);

  return {
    mode: initialMode,
    myName,
    partnerName,
    partnerNickname,
    myGender,
    partnerGender,
    whenWeMet: existing?.whenWeMet || '',
    partnerOutfit: existing?.partnerOutfit || '',
    whoProposed: existing?.whoProposed || 'Me',
    proposalNote: existing?.proposalNote || '',
    whenRelationshipStarted: existing?.whenRelationshipStarted || '',
    relationshipStartedAt: existing?.relationshipStartedAt || defaultStart.toISOString(),
    myAvatar: existing?.myAvatar || AVATAR_PRESETS.find(a => a.gender === myGender)?.uri,
    partnerAvatar: existing?.partnerAvatar || AVATAR_PRESETS.find(a => a.gender === partnerGender)?.uri,
    inviteCode,
    joinCode: existing?.joinedCode || '',
    acceptedTerms: Boolean(existing?.acceptedTerms),
    acceptedPrivacy: Boolean(existing?.acceptedPrivacy),
  };
}

export function validateOnboardingStep(
  step: number,
  draft: OnboardingDraft
): { valid: boolean; error?: string } {
  if (step === 1) {
    if (draft.mode !== 'distance' && draft.mode !== 'nearby') {
      return { valid: false, error: 'Select Long distance or Near by to continue.' };
    }
    return { valid: true };
  }
  if (step === 2) {
    if (draft.myGender !== 'girl' && draft.myGender !== 'boy') {
      return { valid: false, error: 'Select Girl or Boy for yourself.' };
    }
    if (draft.partnerGender !== 'girl' && draft.partnerGender !== 'boy') {
      return { valid: false, error: 'Select Girl or Boy for your partner.' };
    }
    return { valid: true };
  }
  if (step === 4) {
    const parsed = parseRelationshipStart(draft.relationshipStartedAt);
    if (!parsed) {
      return { valid: false, error: 'Choose a valid relationship start date and time.' };
    }
    return { valid: true };
  }
  if (step === 6) {
    const trimmedJoin = draft.joinCode.trim();
    if (trimmedJoin) {
      if (!isValidConnectionCode(trimmedJoin)) {
        return {
          valid: false,
          error: 'Enter a valid 6-digit partner connection code (e.g., 482917) or leave it blank to share your code.',
        };
      }
      if (normalizeConnectionCode(trimmedJoin) === normalizeConnectionCode(draft.inviteCode)) {
        return {
          valid: false,
          error: 'That is your own connection code. Enter the code your partner shared with you.',
        };
      }
    }
    return { valid: true };
  }
  if (step === 7) {
    return validateLegalAgreement(draft.acceptedTerms, draft.acceptedPrivacy);
  }
  return { valid: true };
}

export function finalizeOnboardingOriginStory(draft: OnboardingDraft, nowIso = new Date().toISOString()): CoupleOriginStory {
  const step6Check = validateOnboardingStep(6, draft);
  if (!step6Check.valid) {
    throw new Error(step6Check.error);
  }
  const step7Check = validateOnboardingStep(7, draft);
  if (!step7Check.valid) {
    throw new Error(step7Check.error);
  }
  const displayMyName = draft.myName.trim() || 'Me';
  const displayNickname =
    draft.partnerNickname.trim() ||
    draft.partnerName.trim() ||
    (draft.partnerGender === 'girl' ? 'Her' : 'Him');
  const displayPartnerName = draft.partnerName.trim() || displayNickname;
  const normalizedInvite = isValidConnectionCode(draft.inviteCode)
    ? normalizeConnectionCode(draft.inviteCode)
    : generateSixDigitInviteCode(`${displayMyName}-${displayNickname}`);
  const rawJoin = draft.joinCode.trim();
  const normalizedJoin = rawJoin && isValidConnectionCode(rawJoin) ? normalizeConnectionCode(rawJoin) : undefined;
  const parsedStart = parseRelationshipStart(draft.relationshipStartedAt) ?? new Date();

  return {
    myName: displayMyName,
    partnerName: displayPartnerName,
    partnerNickname: displayNickname,
    myGender: draft.myGender,
    partnerGender: draft.partnerGender,
    whenWeMet: draft.whenWeMet.trim() || 'The day our worlds crossed',
    partnerOutfit:
      draft.partnerOutfit.trim() ||
      (draft.partnerGender === 'girl' ? 'Floral sundress' : 'Crisp button-down shirt'),
    whoProposed: draft.whoProposed.trim() || 'Me',
    proposalNote: draft.proposalNote.trim(),
    whenRelationshipStarted:
      draft.whenRelationshipStarted.trim() || dateKey(parsedStart),
    relationshipStartedAt: parsedStart.toISOString(),
    myAvatar: draft.myAvatar || AVATAR_PRESETS.find(a => a.gender === draft.myGender)?.uri,
    partnerAvatar: draft.partnerAvatar || AVATAR_PRESETS.find(a => a.gender === draft.partnerGender)?.uri,
    inviteCode: normalizedInvite,
    joinedCode: normalizedJoin,
    isLinked: Boolean(normalizedJoin),
    linkedAt: normalizedJoin ? nowIso : undefined,
    acceptedTerms: true,
    acceptedPrivacy: true,
    legalAcceptedAt: nowIso,
    legalVersion: LEGAL_POLICY_VERSION,
  };
}

export type ImageOptimizationPreset = 'instant-pic' | 'memory-lane' | 'avatar';

export type ImageRenderVariant = 'thumbnail' | 'card' | 'full';

export type ImagePresetConfig = {
  id: ImageOptimizationPreset;
  label: string;
  maxDimension: number;
  initialQuality: number;
  fallbackQuality: number;
  maxBytes: number;
  pickerQuality: number;
};

export const IMAGE_OPTIMIZATION_PRESETS: Record<ImageOptimizationPreset, ImagePresetConfig> = {
  'instant-pic': {
    id: 'instant-pic',
    label: 'Instant Pic',
    maxDimension: 720,
    initialQuality: 0.68,
    fallbackQuality: 0.52,
    maxBytes: 180 * 1024,
    pickerQuality: 0.78,
  },
  'memory-lane': {
    id: 'memory-lane',
    label: 'Memory Lane',
    maxDimension: 960,
    initialQuality: 0.72,
    fallbackQuality: 0.56,
    maxBytes: 280 * 1024,
    pickerQuality: 0.82,
  },
  avatar: {
    id: 'avatar',
    label: 'Profile Photo',
    maxDimension: 420,
    initialQuality: 0.7,
    fallbackQuality: 0.55,
    maxBytes: 110 * 1024,
    pickerQuality: 0.78,
  },
};

export const CDN_VARIANT_SPECS: Record<
  ImageRenderVariant,
  { width: number; height?: number; quality: number; resize: 'cover' | 'contain' }
> = {
  thumbnail: { width: 240, height: 180, quality: 70, resize: 'cover' },
  card: { width: 420, height: 288, quality: 75, resize: 'cover' },
  full: { width: 960, quality: 85, resize: 'contain' },
};

export function computeTargetDimensions(
  sourceWidth?: number | null,
  sourceHeight?: number | null,
  maxDimension = 960
): { width: number; height?: number; resized: boolean } {
  const safeMax = Math.max(64, Math.round(maxDimension));
  const w = sourceWidth && sourceWidth > 0 ? Math.round(sourceWidth) : 0;
  const h = sourceHeight && sourceHeight > 0 ? Math.round(sourceHeight) : 0;

  if (!w && !h) {
    return { width: safeMax, resized: true };
  }
  if (w > 0 && h > 0) {
    const longest = Math.max(w, h);
    if (longest <= safeMax) {
      return { width: w, height: h, resized: false };
    }
    const scale = safeMax / longest;
    return {
      width: Math.max(1, Math.round(w * scale)),
      height: Math.max(1, Math.round(h * scale)),
      resized: true,
    };
  }
  const single = w || h;
  if (single <= safeMax) {
    return { width: single, resized: false };
  }
  return { width: safeMax, resized: true };
}

export function estimateBase64Bytes(base64OrDataUri: string): number {
  if (!base64OrDataUri) return 0;
  const commaIdx = base64OrDataUri.indexOf(',');
  const raw = commaIdx >= 0 ? base64OrDataUri.slice(commaIdx + 1).trim() : base64OrDataUri.trim();
  if (!raw) return 0;
  const padding = raw.endsWith('==') ? 2 : raw.endsWith('=') ? 1 : 0;
  return Math.max(0, Math.floor((raw.length * 3) / 4) - padding);
}

export function formatImageByteSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 KB';
  if (bytes < 1024) return `${Math.round(bytes)} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.max(1, Math.round(kb))} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export type CdnImageOptions = {
  variant?: ImageRenderVariant;
  width?: number;
  height?: number;
  quality?: number;
  resize?: 'cover' | 'contain';
  cdnBaseUrl?: string;
};

export function buildCdnImageUrl(uri: string | undefined | null, options: CdnImageOptions = {}): string {
  if (!uri) return '';
  const trimmed = uri.trim();
  if (!trimmed) return '';

  // Local data URIs, blob URIs, and device file URIs are already in-memory/local and must not be rewritten
  if (
    trimmed.startsWith('data:') ||
    trimmed.startsWith('file:') ||
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('content:') ||
    trimmed.startsWith('ph:')
  ) {
    return trimmed;
  }

  if (!/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  const variantSpec = options.variant ? CDN_VARIANT_SPECS[options.variant] : CDN_VARIANT_SPECS.card;
  const width = options.width ?? variantSpec.width;
  const height = options.height ?? variantSpec.height;
  const quality = Math.min(100, Math.max(30, options.quality ?? variantSpec.quality));
  const resize = options.resize ?? variantSpec.resize;
  const configuredCdn = (options.cdnBaseUrl ?? process.env.EXPO_PUBLIC_IMAGE_CDN_URL ?? '').trim().replace(/\/+$/, '');

  // If a dedicated image CDN base URL is configured, route through it with transformation query params
  if (configuredCdn && !trimmed.startsWith(configuredCdn)) {
    const params = new URLSearchParams();
    params.set('url', trimmed);
    params.set('w', String(width));
    if (height) params.set('h', String(height));
    params.set('q', String(quality));
    params.set('fit', resize);
    params.set('auto', 'format,compress');
    return `${configuredCdn}?${params.toString()}`;
  }

  // Otherwise append CDN / Supabase Storage transformation & edge-cache query parameters directly
  try {
    const parsed = new URL(trimmed);
    if (!parsed.searchParams.has('width')) {
      parsed.searchParams.set('width', String(width));
    }
    if (height && !parsed.searchParams.has('height')) {
      parsed.searchParams.set('height', String(height));
    }
    if (!parsed.searchParams.has('quality')) {
      parsed.searchParams.set('quality', String(quality));
    }
    if (!parsed.searchParams.has('resize')) {
      parsed.searchParams.set('resize', resize);
    }
    return parsed.toString();
  } catch {
    const sep = trimmed.includes('?') ? '&' : '?';
    const heightParam = height ? `&height=${height}` : '';
    return `${trimmed}${sep}width=${width}${heightParam}&quality=${quality}&resize=${resize}`;
  }
}

export type MonitoringSeverity = 'fatal' | 'error' | 'warning' | 'info';

export type ParsedSentryDsn = {
  dsn: string;
  protocol: 'http' | 'https';
  publicKey: string;
  host: string;
  pathPrefix: string;
  projectId: string;
  storeUrl: string;
  envelopeUrl: string;
};

export type MonitoringBreadcrumb = {
  timestamp: string;
  category: 'navigation' | 'auth' | 'sync' | 'ui' | 'notification' | 'media' | 'lifecycle';
  message: string;
  level: MonitoringSeverity;
  data?: Record<string, string | number | boolean>;
};

export type SentryStackFrame = {
  filename: string;
  function: string;
  lineno?: number;
  colno?: number;
  in_app: boolean;
};

export type SentryEventPayload = {
  event_id: string;
  timestamp: string;
  platform: 'javascript';
  level: MonitoringSeverity;
  release: string;
  environment: string;
  tags: Record<string, string>;
  user?: { id: string };
  exception?: {
    values: {
      type: string;
      value: string;
      mechanism: { type: string; handled: boolean };
      stacktrace: { frames: SentryStackFrame[] };
    }[];
  };
  message?: { formatted: string };
  breadcrumbs: { values: MonitoringBreadcrumb[] };
  extra?: Record<string, string | number | boolean>;
};

/**
 * Parses a standard Sentry DSN (`https://<public_key>@<host>/<project_id>`) into
 * its constituent Store and Envelope ingest endpoints. Returns null if unconfigured or invalid.
 */
export function parseSentryDsn(rawDsn?: string | null): ParsedSentryDsn | null {
  if (!rawDsn) return null;
  const trimmed = rawDsn.trim();
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed);
    const protocol = url.protocol === 'http:' ? 'http' : url.protocol === 'https:' ? 'https' : null;
    if (!protocol) return null;
    const publicKey = decodeURIComponent(url.username || '').trim();
    if (!publicKey) return null;
    const host = url.host.trim();
    if (!host) return null;
    const segments = url.pathname.split('/').map(s => s.trim()).filter(Boolean);
    if (segments.length === 0) return null;
    const projectId = segments[segments.length - 1];
    if (!/^[A-Za-z0-9_-]+$/.test(projectId)) return null;
    const prefixSegments = segments.slice(0, -1);
    const pathPrefix = prefixSegments.length ? `/${prefixSegments.join('/')}` : '';
    const baseApi = `${protocol}://${host}${pathPrefix}/api/${projectId}`;
    return {
      dsn: trimmed,
      protocol,
      publicKey,
      host,
      pathPrefix,
      projectId,
      storeUrl: `${baseApi}/store/`,
      envelopeUrl: `${baseApi}/envelope/`,
    };
  } catch {
    return null;
  }
}

/**
 * Scrubs sensitive couple data (emails, JWT/Bearer tokens, 6-digit connection codes, data URIs)
 * from error messages and breadcrumb strings before leaving the device.
 */
export function scrubSensitiveText(input: string | undefined | null, maxLength = 240): string {
  if (!input) return '';
  const scrubbed = String(input)
    .replace(/data:[^;\s]+;base64,[A-Za-z0-9+/=]+/gi, '[REDACTED_DATA_URI]')
    .replace(/Bearer\s+[A-Za-z0-9._~+/-]+=*/gi, 'Bearer [REDACTED_TOKEN]')
    .replace(/eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}/g, '[REDACTED_JWT]')
    .replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, '[REDACTED_EMAIL]')
    .replace(/\b(?:CLSR-)?\d{6}\b/g, '[REDACTED_INVITE_CODE]');
  return scrubbed.length > maxLength ? `${scrubbed.slice(0, maxLength)}…` : scrubbed;
}

const SENSITIVE_META_KEYS = /password|token|secret|key|authorization|cookie|email|code|note|body|caption|prompt|answer|message|text|image|photo|avatar|base64/i;

export function scrubMonitoringMetadata(
  meta?: Record<string, unknown> | null
): Record<string, string | number | boolean> {
  if (!meta || typeof meta !== 'object') return {};
  const clean: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(meta)) {
    if (value === undefined || value === null) continue;
    if (SENSITIVE_META_KEYS.test(key)) {
      clean[key] = '[REDACTED]';
      continue;
    }
    if (typeof value === 'boolean' || typeof value === 'number') {
      clean[key] = value;
    } else if (typeof value === 'string') {
      clean[key] = scrubSensitiveText(value, 140);
    } else {
      clean[key] = scrubSensitiveText( JSON.stringify(value), 140 );
    }
  }
  return clean;
}

/**
 * Parses a JavaScript/React Native Error.stack string into Sentry-compatible stack frames
 * ordered from oldest to newest frame (as expected by Sentry's stacktrace spec).
 */
export function parseStackFrames(stack?: string | null, maxFrames = 20): SentryStackFrame[] {
  if (!stack || typeof stack !== 'string') return [];
  const lines = stack
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean);
  const frames: SentryStackFrame[] = [];

  for (const line of lines) {
    if (/^(Error|TypeError|RangeError|ReferenceError|SyntaxError)/i.test(line) && !line.includes('at ') && !line.includes('@')) {
      continue;
    }
    // V8 / Hermes style: "at fnName (filename:line:col)" or "at filename:line:col"
    const v8Match = line.match(/^at\s+(?:(.+?)\s+\((.+?):(\d+):(\d+)\)|(.+?):(\d+):(\d+))$/);
    if (v8Match) {
      const fnName = (v8Match[1] || '<anonymous>').trim();
      const rawFile = (v8Match[2] || v8Match[5] || 'unknown').trim();
      const lineno = Number.parseInt(v8Match[3] || v8Match[6] || '0', 10);
      const colno = Number.parseInt(v8Match[4] || v8Match[7] || '0', 10);
      frames.push({
        filename: scrubSensitiveText(rawFile, 180),
        function: scrubSensitiveText(fnName, 100),
        lineno: Number.isFinite(lineno) && lineno > 0 ? lineno : undefined,
        colno: Number.isFinite(colno) && colno > 0 ? colno : undefined,
        in_app: !rawFile.includes('node_modules'),
      });
      continue;
    }

    // JavaScriptCore / Safari / Gecko style: "fnName@filename:line:col"
    const jscMatch = line.match(/^(.*?)@(.+?):(\d+):(\d+)$/);
    if (jscMatch) {
      const fnName = (jscMatch[1] || '<anonymous>').trim();
      const rawFile = jscMatch[2].trim();
      const lineno = Number.parseInt(jscMatch[3], 10);
      const colno = Number.parseInt(jscMatch[4], 10);
      frames.push({
        filename: scrubSensitiveText(rawFile, 180),
        function: scrubSensitiveText(fnName, 100),
        lineno: Number.isFinite(lineno) && lineno > 0 ? lineno : undefined,
        colno: Number.isFinite(colno) && colno > 0 ? colno : undefined,
        in_app: !rawFile.includes('node_modules'),
      });
    }
  }

  return frames.slice(0, maxFrames).reverse();
}

export function appendBreadcrumb(
  existing: MonitoringBreadcrumb[],
  crumb: Omit<MonitoringBreadcrumb, 'timestamp'> & { timestamp?: string },
  maxCount = 35
): MonitoringBreadcrumb[] {
  const safeLimit = Math.max(1, maxCount);
  const entry: MonitoringBreadcrumb = {
    timestamp: crumb.timestamp || new Date().toISOString(),
    category: crumb.category,
    message: scrubSensitiveText(crumb.message, 160),
    level: crumb.level,
    ...(crumb.data ? { data: scrubMonitoringMetadata(crumb.data) } : {}),
  };
  const next = [...existing, entry];
  return next.length > safeLimit ? next.slice(next.length - safeLimit) : next;
}

function makeSentryEventId(): string {
  let out = '';
  const hex = '0123456789abcdef';
  for (let i = 0; i < 32; i++) {
    out += hex[Math.floor(Math.random() * 16)];
  }
  return out;
}

export function buildSentryEventPayload(options: {
  error?: unknown;
  message?: string;
  level?: MonitoringSeverity;
  handled?: boolean;
  mechanismType?: string;
  environment?: string;
  release?: string;
  userId?: string | null;
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
  breadcrumbs?: MonitoringBreadcrumb[];
  timestamp?: string;
}): SentryEventPayload {
  const timestamp = options.timestamp || new Date().toISOString();
  const level: MonitoringSeverity = options.level ?? 'error';
  const environment = (options.environment || process.env.EXPO_PUBLIC_APP_ENV || 'production').trim();
  const release = (options.release || 'closer@1.0.0').trim();
  const tags: Record<string, string> = {};
  for (const [k, v] of Object.entries(options.tags ?? {})) {
    if (v) tags[k] = scrubSensitiveText(v, 64);
  }

  const payload: SentryEventPayload = {
    event_id: makeSentryEventId(),
    timestamp,
    platform: 'javascript',
    level,
    release,
    environment,
    tags,
    breadcrumbs: { values: (options.breadcrumbs ?? []).slice(-35) },
  };

  if (options.userId) {
    payload.user = { id: scrubSensitiveText(options.userId, 64) };
  }

  if (options.extra) {
    payload.extra = scrubMonitoringMetadata(options.extra);
  }

  if (options.error !== undefined && options.error !== null) {
    const errObj = options.error instanceof Error ? options.error : null;
    const errType = errObj && errObj.name ? errObj.name : 'Error';
    const rawMsg = errObj
      ? errObj.message
      : typeof options.error === 'string'
        ? options.error
        : JSON.stringify(options.error);
    const errStack = errObj ? errObj.stack : undefined;
    payload.exception = {
      values: [
        {
          type: scrubSensitiveText(errType, 80) || 'Error',
          value: scrubSensitiveText(rawMsg || options.message || 'Unexpected runtime error', 240),
          mechanism: {
            type: options.mechanismType || 'generic',
            handled: options.handled ?? true,
          },
          stacktrace: {
            frames: parseStackFrames(errStack),
          },
        },
      ],
    };
  } else if (options.message) {
    payload.message = {
      formatted: scrubSensitiveText(options.message, 240),
    };
  }

  return payload;
}

export type HapticIntent =
  | 'tap'
  | 'selection'
  | 'task-check'
  | 'task-uncheck'
  | 'instant-pic'
  | 'quick-note'
  | 'heart'
  | 'success'
  | 'warning'
  | 'error';

export type HapticFeedbackMethod = 'impact' | 'notification' | 'selection';

export type HapticImpactStyleName = 'Light' | 'Medium' | 'Heavy' | 'Soft' | 'Rigid';

export type HapticNotificationTypeName = 'Success' | 'Warning' | 'Error';

export type HapticProfile = {
  intent: HapticIntent;
  label: string;
  method: HapticFeedbackMethod;
  impactStyle?: HapticImpactStyleName;
  notificationType?: HapticNotificationTypeName;
  vibrationPattern: number[];
  cooldownMs: number;
};

export const HAPTIC_PROFILES: Record<HapticIntent, HapticProfile> = {
  tap: {
    intent: 'tap',
    label: 'Button Tap',
    method: 'impact',
    impactStyle: 'Light',
    vibrationPattern: [8],
    cooldownMs: 35,
  },
  selection: {
    intent: 'selection',
    label: 'Selection Change',
    method: 'selection',
    vibrationPattern: [5],
    cooldownMs: 25,
  },
  'task-check': {
    intent: 'task-check',
    label: 'Task Checked Off',
    method: 'notification',
    notificationType: 'Success',
    vibrationPattern: [12, 28, 18],
    cooldownMs: 60,
  },
  'task-uncheck': {
    intent: 'task-uncheck',
    label: 'Task Unchecked',
    method: 'impact',
    impactStyle: 'Light',
    vibrationPattern: [8],
    cooldownMs: 45,
  },
  'instant-pic': {
    intent: 'instant-pic',
    label: 'Instant Pic Shared',
    method: 'impact',
    impactStyle: 'Medium',
    vibrationPattern: [15, 25, 15],
    cooldownMs: 75,
  },
  'quick-note': {
    intent: 'quick-note',
    label: 'Quick Note Pinned',
    method: 'impact',
    impactStyle: 'Medium',
    vibrationPattern: [14],
    cooldownMs: 60,
  },
  heart: {
    intent: 'heart',
    label: 'Heart Reaction',
    method: 'impact',
    impactStyle: 'Soft',
    vibrationPattern: [10],
    cooldownMs: 45,
  },
  success: {
    intent: 'success',
    label: 'Action Completed',
    method: 'notification',
    notificationType: 'Success',
    vibrationPattern: [14, 28, 20],
    cooldownMs: 65,
  },
  warning: {
    intent: 'warning',
    label: 'Caution / Delete',
    method: 'notification',
    notificationType: 'Warning',
    vibrationPattern: [18, 35, 18],
    cooldownMs: 75,
  },
  error: {
    intent: 'error',
    label: 'Error Alert',
    method: 'notification',
    notificationType: 'Error',
    vibrationPattern: [28, 40, 28],
    cooldownMs: 90,
  },
};

export function resolveHapticProfile(intent: HapticIntent): HapticProfile {
  return HAPTIC_PROFILES[intent] ?? HAPTIC_PROFILES.tap;
}

export function shouldTriggerHaptic(
  intent: HapticIntent,
  enabled: boolean,
  lastTriggeredAtMs: number,
  nowMs = Date.now()
): boolean {
  if (!enabled) return false;
  const profile = resolveHapticProfile(intent);
  if (lastTriggeredAtMs > 0 && nowMs - lastTriggeredAtMs < profile.cooldownMs) {
    return false;
  }
  return true;
}





