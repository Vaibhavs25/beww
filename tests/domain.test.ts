import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cleanText, daysTogether, dropPiece, newGame, questionFor, quizMatch, sharedDay, validDate, visibleAnswers, type Game } from '../src/domain.ts';
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
test('quiz percentage comes only from two complete valid answers', () => {
  assert.equal(quizMatch([0,0,1,0,1],[0,1,1,1,1]),60);
  assert.equal(quizMatch([0,0,1,0,1],[1,1,0,1,0]),0);
  assert.equal(quizMatch([0,0,1,0,1],[]),null);
  assert.equal(quizMatch([0,0,1,0,1],[0,0,1,0,2]),null);
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
