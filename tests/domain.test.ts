import { test } from 'node:test';
import assert from 'node:assert/strict';
import { adventureProgress, cleanText, coupleMoodTimeline, createAdventureGoal, createJournalEntry, dailyQuestionItemFor, DAILY_QUESTIONS, daysTogether, dropPiece, moodStreak, newGame, planVoteCount, questionFor, quizFor, quizMatch, QUIZ_PACKS, rankUpcomingPlans, recentPhotoMoments, sharedDay, sortJournalEntries, toggleAdventureArchived, toggleAdventureCompleted, toggleJournalHeart, togglePlanVote, upsertMoodLog, validDate, visibleAnswers, type Game, type Moment, type MoodLog, type Plan } from '../src/domain.ts';
import { adoptPet, careForPet, mergeMessages, reconcileMessages, petGrowth, validatePlan, type PlanDraft } from '../src/shared-features.ts';

function play(columns: number[]) { return columns.reduce((game, col) => dropPiece(game, col, game.turn), newGame(['alex', 'jamie'])); }
test('Four in a Row saves a win and rejects moves after the round', () => {
  const game = play([0, 1, 0, 1, 0, 1, 0]);
  assert.equal(game.winner, 1); assert.equal(game.status, 'finished'); assert.ok(game.finishedAt);
  assert.throws(() => dropPiece(game, 4, game.turn), /finished/);
});
test('horizontal and diagonal wins work in both directions', () => {
  assert.equal(play([0,0,1,1,2,2,3]).winner,1);
  const columns = [0,1,1,2,4,2,2,3,4,3,5,3,3];
  assert.equal(play(columns).winner,1);
  assert.equal(play(columns.map(c => 6-c)).winner,1);
});
test('a full column, invalid column, and wrong turn do not change the board', () => {
  const game = play([0,0,0,0,0,0]); const before = [...game.board];
  assert.throws(() => dropPiece(game,0,game.turn), /full/);
  assert.throws(() => dropPiece(game,7,game.turn), /column/);
  assert.throws(() => dropPiece(game,0.5,game.turn), /column/);
  assert.throws(() => dropPiece(game,1,2), /partner/);
  assert.deepEqual(game.board,before);
});
test('a full board without four in a row is recorded as a draw', () => {
  // Alternating pairs, shifted each row, contain no horizontal, vertical or diagonal four.
  const board = [1,1,2,2,1,1,0,2,2,1,1,2,2,1,1,1,2,2,1,1,2,2,2,1,1,2,2,1,1,1,2,2,1,1,2,2,2,1,1,2,2,1];
  const game: Game = { ...newGame(['a','b']), board, turn: 2 };
  const result = dropPiece(game,6,2); assert.equal(result.winner,0); assert.equal(result.status,'finished');
});
test('quiz percentage comes only from two complete valid answers and packs rotate by day', () => {
  assert.equal(quizMatch([0,0,1,0,1],[0,1,1,1,1]),60);
  assert.equal(quizMatch([0,0,1,0,1],[1,1,0,1,0]),0);
  assert.equal(quizMatch([0,0,1,0,1],[]),null);
  assert.equal(quizMatch([0,0,1,0,1],[0,0,1,0,2]),null);
  assert.equal(QUIZ_PACKS.length,3);
  assert.notEqual(quizFor('2026-11-03').id, quizFor('2026-11-04').id);
  assert.equal(quizFor('2026-11-03', 1).id, quizFor('2026-11-04').id);
});
test('couples in different zones share the same daily boundary', () => {
  const instant = new Date('2026-11-03T20:00:00Z');
  assert.equal(sharedDay('Asia/Kolkata',instant),'2026-11-04');
  assert.equal(sharedDay('America/New_York',instant),'2026-11-03');
  assert.equal(questionFor(sharedDay('Asia/Kolkata',instant)),questionFor('2026-11-04'));
  assert.equal(daysTogether('2024-02-28','2024-03-01'),2);
});
test('dates and text reject invalid or oversized input', () => {
  assert.equal(validDate('2024-02-29'),true); assert.equal(validDate('2025-02-29'),false); assert.equal(validDate('2026-13-01'),false);
  assert.equal(cleanText('  hello  '),'hello'); assert.throws(() => cleanText('  ')); assert.throws(() => cleanText('x'.repeat(501)));
});
test('daily answers are hidden from a partner until they answer', () => {
  const answers = [{ id:'1',authorId:'alex',day:'2026-11-03',text:'A quiet morning' }];
  assert.deepEqual(visibleAnswers(answers,'2026-11-03','jamie'),[]);
  assert.equal(visibleAnswers([...answers,{id:'2',authorId:'jamie',day:'2026-11-03',text:'You'}],'2026-11-03','jamie').length,2);
});

test('both partners raise one pet with once-daily care and persistent growth', () => {
  let state = { pet: adoptPet('  Mochi  ', 'bear'), care: [] as import('../src/domain.ts').PetCare[] };
  assert.equal(state.pet.name, 'Mochi');
  state = careForPet(state.pet, state.care, 'alex', 'feed', '2026-11-03');
  state = careForPet(state.pet, state.care, 'alex', 'feed', '2026-11-03');
  assert.equal(state.pet.points, 5); assert.equal(state.care.length, 1);
  for (const person of ['alex', 'jamie']) for (const action of ['feed', 'play', 'rest'] as const) state = careForPet(state.pet, state.care, person, action, '2026-11-03');
  assert.equal(state.pet.points, 30); assert.equal(petGrowth(state.pet.points).level, 2);
  state = careForPet(state.pet, state.care, 'alex', 'feed', '2026-11-04');
  assert.equal(state.pet.points, 35); assert.equal(petGrowth(35).progress, 5);
  assert.throws(() => adoptPet('   ', 'cat')); assert.throws(() => adoptPet('x'.repeat(25), 'bunny'));
});
test('date details validate time, dates and limits while wishes need no schedule', () => {
  const draft: PlanDraft = { title: '  A cozy evening  ', kind: 'date', date: '2026-11-04', time: '19:30', place: ' Our call ', notes: 'Snacks!', format: 'virtual' };
  assert.equal(validatePlan(draft, '2026-11-03').place, 'Our call');
  for (const time of ['24:00', '09:60', '7:30', '19:30:00']) assert.throws(() => validatePlan({ ...draft, time }, '2026-11-03'));
  assert.throws(() => validatePlan({ ...draft, date: '2026-11-02' }, '2026-11-03'));
  assert.throws(() => validatePlan({ ...draft, date: '2026-02-30' }, '2026-01-01'));
  assert.throws(() => validatePlan({ ...draft, notes: 'x'.repeat(501) }, '2026-11-03'));
  assert.equal(validatePlan({ ...draft, kind: 'wish', date: '', time: '24:00' }, '2026-11-03').time, '');
});
test('message merging preserves older pages and deduplicates a retried send', () => {
  const old = { id: 'a', authorId: 'alex', text: 'First', createdAt: '2026-11-03T10:00:00.000001+00:00' };
  const next = { ...old, id: 'b', text: 'Next', createdAt: '2026-11-03T10:00:00.000002+00:00' };
  assert.deepEqual(mergeMessages([next], [old, next]).map(m => m.id), ['a', 'b']);
  assert.equal(mergeMessages([old], [old]).length, 1);
});
test('reconnecting after more than a page of new messages keeps missing history reachable', () => {
  const message = (n: number) => ({ id: String(n), authorId: 'alex', text: `Message ${n}`, createdAt: new Date(1800000000000 + n * 1000).toISOString() });
  const previous = { messages: Array.from({ length: 150 }, (_, i) => message(i + 1)), hasOlderMessages: false };
  const latest = { messages: Array.from({ length: 100 }, (_, i) => message(i + 251)), hasOlderMessages: true };
  const next = reconcileMessages(previous, latest);
  assert.equal(next.messages[0].id, '251');
  assert.equal(next.hasOlderMessages, true);
  const recovered = mergeMessages(Array.from({ length: 250 }, (_, i) => message(i + 1)), next.messages);
  assert.deepEqual(recovered.map(m => m.id), Array.from({ length: 350 }, (_, i) => String(i + 1)));
});
test('overlapping chat snapshots preserve already-loaded history and the oldest-page flag', () => {
  const messages = Array.from({ length: 150 }, (_, i) => ({ id: String(i), authorId: 'alex', text: 'hello', createdAt: new Date(1800000000000 + i * 1000).toISOString() }));
  const next = reconcileMessages({ messages, hasOlderMessages: false }, { messages: messages.slice(-100), hasOlderMessages: true });
  assert.equal(next.messages.length, 150); assert.equal(next.hasOlderMessages, false);
  const empty = reconcileMessages(next, { messages: [], hasOlderMessages: false });
  assert.equal(empty.messages.length, 0);
});
test('daily mood logs deduplicate per partner per day and compute consecutive streaks', () => {
  let logs: MoodLog[] = [];
  logs = upsertMoodLog(logs, { authorId: 'alex', day: '2026-11-01', mood: 'calm', note: '', need: '', createdAt: '2026-11-01T08:00:00Z' });
  logs = upsertMoodLog(logs, { authorId: 'alex', day: '2026-11-02', mood: 'happy', note: '', need: '', createdAt: '2026-11-02T08:00:00Z' });
  logs = upsertMoodLog(logs, { authorId: 'alex', day: '2026-11-02', mood: 'loved', note: 'Updated', need: 'A hug', createdAt: '2026-11-02T19:00:00Z' });
  assert.equal(logs.length, 2);
  assert.equal(logs[1].mood, 'loved');
  assert.equal(moodStreak(logs, 'alex', '2026-11-03'), 2);
  logs = upsertMoodLog(logs, { authorId: 'jamie', day: '2026-11-03', mood: 'happy', note: 'Sunny', need: '', createdAt: '2026-11-03T09:00:00Z' });
  const timeline = coupleMoodTimeline(logs, [
    { id: 'alex', name: 'Alex', mood: 'loved', moodNote: 'Updated', need: 'A hug', moodAt: '2026-11-02T19:00:00Z' },
    { id: 'jamie', name: 'Jamie', mood: 'happy', moodNote: 'Sunny', need: '', moodAt: '2026-11-03T09:00:00Z' },
  ], 'UTC', '2026-11-03', 'alex');
  assert.equal(timeline.combinedStreak, 3);
  assert.equal(timeline.myStreak, 2);
  assert.equal(timeline.partnerStreak, 1);
  assert.equal(timeline.days.length, 7);
  assert.equal(timeline.days[6].isToday, true);
  assert.equal(timeline.days[6].theirs?.mood, 'happy');
});
test('Memory Lane filters shared photo moments to the last 30 days newest first', () => {
  const now = Date.parse('2026-11-03T12:00:00Z');
  const moments: Moment[] = [
    { id: 'old-photo', authorId: 'alex', kind: 'photo', text: '45 days ago', image: 'data:image/jpeg;base64,abc', createdAt: new Date(now - 45 * 86400000).toISOString(), hearts: [] },
    { id: 'recent-note', authorId: 'jamie', kind: 'note', text: 'Just a note', createdAt: new Date(now - 2 * 86400000).toISOString(), hearts: [] },
    { id: 'photo-10d', authorId: 'alex', kind: 'photo', text: '10 days ago', image: 'data:image/jpeg;base64,def', createdAt: new Date(now - 10 * 86400000).toISOString(), hearts: [] },
    { id: 'photo-1d', authorId: 'jamie', kind: 'photo', text: 'Yesterday', image: 'data:image/jpeg;base64,ghi', createdAt: new Date(now - 1 * 86400000).toISOString(), hearts: ['alex'] },
  ];
  const recent = recentPhotoMoments(moments, now, 30);
  assert.deepEqual(recent.map(m => m.id), ['photo-1d', 'photo-10d']);
});
test('Daily Question rotates lighthearted prompts with category tags and hints', () => {
  const first = dailyQuestionItemFor('2026-11-03', 0);
  const next = dailyQuestionItemFor('2026-11-03', 1);
  assert.notEqual(first.id, next.id);
  assert.equal(first.prompt, questionFor('2026-11-03', 0));
  assert.equal(next.prompt, questionFor('2026-11-03', 1));
  assert.equal(dailyQuestionItemFor('2026-11-03', DAILY_QUESTIONS.length).id, first.id);
  assert.ok(first.tag.length > 0 && first.hint.length > 0);
});
test('Date Night Planner toggles votes and ranks mutual picks first', () => {
  const basePlan: Plan = { id: 'p1', authorId: 'alex', title: 'Picnic', date: '2026-11-10', kind: 'date', done: false, acceptedBy: ['alex'] };
  const bothVoted = togglePlanVote(basePlan, 'jamie');
  assert.equal(planVoteCount(bothVoted), 2);
  const unvoted = togglePlanVote(bothVoted, 'alex');
  assert.deepEqual(unvoted.acceptedBy, ['jamie']);

  const plans: Plan[] = [
    { id: 'one-vote', authorId: 'alex', title: 'Early coffee', date: '2026-11-05', kind: 'date', done: false, acceptedBy: ['alex'] },
    { id: 'two-votes', authorId: 'jamie', title: 'Pasta night', date: '2026-11-08', kind: 'date', done: false, acceptedBy: ['alex', 'jamie'] },
    { id: 'done-plan', authorId: 'alex', title: 'Already done', date: '2026-11-04', kind: 'date', done: true, acceptedBy: ['alex', 'jamie'] },
  ];
  const ranked = rankUpcomingPlans(plans, '2026-11-03');
  assert.deepEqual(ranked.map(p => p.id), ['two-votes', 'one-vote']);
});
test('Future Adventures adds, categorizes, completes, archives, and calculates progress', () => {
  const g1 = createAdventureGoal('alex', 'Coastal train trip', 'travel', 'Window seats');
  const g2 = createAdventureGoal('jamie', 'Pottery workshop', 'hobby');
  const g3 = createAdventureGoal('alex', 'Hotel bar stranger roleplay', 'fantasy');
  const g4 = createAdventureGoal('jamie', 'Candlelit massage night', 'intimacy');
  let list = [g1, g2, g3, g4];
  assert.deepEqual(adventureProgress(list), { total: 4, completed: 0, archived: 0, percent: 0 });

  list = toggleAdventureCompleted(list, g1.id);
  list = toggleAdventureCompleted(list, g4.id);
  assert.deepEqual(adventureProgress(list), { total: 4, completed: 2, archived: 0, percent: 50 });
  assert.deepEqual(adventureProgress(list, 'intimacy'), { total: 1, completed: 1, archived: 0, percent: 100 });

  list = toggleAdventureArchived(list, g2.id);
  assert.deepEqual(adventureProgress(list), { total: 3, completed: 2, archived: 1, percent: 67 });
});
test('Shared Journal creates entries, toggles hearts, and sorts chronologically', () => {
  const e1 = createJournalEntry('alex', '2026-11-01', 'First reflection', 'Morning coffee', 'reflection', '2026-11-01T09:00:00Z');
  const e2 = createJournalEntry('jamie', '2026-11-02', 'Grateful for our walk', '', 'gratitude', '2026-11-02T18:00:00Z');
  const e3 = createJournalEntry('alex', '2026-11-03', 'Love note for tonight', 'Thinking of you', 'letter', '2026-11-03T21:00:00Z');
  let entries = [e1, e2, e3];

  entries = toggleJournalHeart(entries, e1.id, 'jamie');
  assert.deepEqual(entries.find(e => e.id === e1.id)?.hearts, ['jamie']);

  const newest = sortJournalEntries(entries, 'newest', 'all');
  assert.deepEqual(newest.map(e => e.id), [e3.id, e2.id, e1.id]);

  const oldest = sortJournalEntries(entries, 'oldest', 'all');
  assert.deepEqual(oldest.map(e => e.id), [e1.id, e2.id, e3.id]);

  const jamieOnly = sortJournalEntries(entries, 'newest', 'jamie');
  assert.deepEqual(jamieOnly.map(e => e.id), [e2.id]);
});




