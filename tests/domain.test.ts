import { test } from 'node:test';
import assert from 'node:assert/strict';
import { adventureProgress, answerTriviaQuestion, appendBreadcrumb, buildCalendarMonthGrid, buildCdnImageUrl, buildPartnerAlertForJournal, buildPartnerAlertForPhotoMoment, buildPartnerAlertForQuickNote, buildRelationshipMilestones, buildSentryEventPayload, cleanText, clearCompletedErrands, computeTargetDimensions, coupleMoodTimeline, createAdventureGoal, createDemo, createErrandItem, createInitialOnboardingDraft, createJournalEntry, createQuickNote, createTriviaQuestion, dailyQuestionItemFor, DAILY_QUESTIONS, daysTogether, DEFAULT_PARTNER_ALERT_PREFS, diffNewPartnerActivities, dropPiece, errandsProgress, estimateBase64Bytes, finalizeOnboardingOriginStory, formatImageByteSize, generateSixDigitInviteCode, HAPTIC_PROFILES, IMAGE_OPTIMIZATION_PRESETS, INSTANT_PIC_PRESETS, isValidConnectionCode, isValidSixDigitCode, LEGAL_POLICY_VERSION, moodStreak, newGame, nextAnniversaryCountdown, nextMonthiversaryCountdown, normalizeConnectionCode, ONBOARDING_STEPS, ordinalSuffix, parseSentryDsn, parseStackFrames, planVoteCount, PRIVACY_POLICY_SECTIONS, questionFor, quizFor, quizMatch, QUIZ_PACKS, rankUpcomingPlans, recentPhotoMoments, relationshipDurationBreakdown, removeErrandItem, removeQuickNote, resolveHapticProfile, scrubMonitoringMetadata, scrubSensitiveText, sharedDay, shouldSendPartnerAlert, shouldTriggerHaptic, sortJournalEntries, sortQuickNotes, TERMS_OF_SERVICE_SECTIONS, toggleAdventureArchived, toggleAdventureCompleted, toggleErrandItem, toggleJournalHeart, togglePlanVote, toggleQuickNoteHeart, toggleQuickNotePin, triviaScoreboard, updateQuickNoteCaption, upsertMoodLog, validateLegalAgreement, validateOnboardingStep, validDate, visibleAnswers, type CoupleOriginStory, type Game, type Moment, type MoodLog, type MonitoringBreadcrumb, type Plan } from '../src/domain.ts';
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
test('Relationship Quiz creates trivia questions, records partner guesses, and calculates scoreboard', () => {
  const q1 = createTriviaQuestion('alex', 'What is my favorite Sunday breakfast?', ['Pancakes', 'Shakshuka', 'Croissants'], 0);
  const q2 = createTriviaQuestion('jamie', 'Which movie can I quote by heart?', ['Before Sunrise', 'In the Mood for Love', 'La La Land'], 1);
  const q3 = createTriviaQuestion('alex', 'Where would I love to live for a month?', ['Lisbon', 'Kyoto', 'Montreal'], 1);
  let list = [q1, q2, q3];

  // Author cannot guess their own question
  assert.throws(() => answerTriviaQuestion(list, q1.id, 'alex', 0), /partner guesses/);

  // Jamie guesses q1 right and q3 wrong; Alex guesses q2 right
  list = answerTriviaQuestion(list, q1.id, 'jamie', 0);
  list = answerTriviaQuestion(list, q3.id, 'jamie', 2);
  list = answerTriviaQuestion(list, q2.id, 'alex', 1);

  const profiles = [
    { id: 'alex', name: 'Alex', mood: 'calm' as const, moodNote: '', need: '', moodAt: '2026-11-03T08:00:00Z' },
    { id: 'jamie', name: 'Jamie', mood: 'happy' as const, moodNote: '', need: '', moodAt: '2026-11-03T09:00:00Z' },
  ];
  const board = triviaScoreboard(list, profiles, 'alex');
  assert.equal(board.myCorrect, 1);
  assert.equal(board.myAnswered, 1);
  assert.equal(board.partnerCorrect, 1);
  assert.equal(board.partnerAnswered, 2);
  assert.equal(board.totalCorrect, 2);
  assert.equal(board.totalAnswered, 3);
  assert.equal(board.totalPoints, 20);
  assert.equal(board.overallPercent, 67);
});
test('Quick Notes and Instant Pic support sticky notes, captionless instant pics, pinning, hearts, and removal', () => {
  const n1 = createQuickNote('alex', 'Thinking of you ♡', 'blush', '2026-11-03T10:00:00Z');
  // Instant Pic requires no text (text is optional)
  const instantPic = createQuickNote('jamie', '', 'peach', '2026-11-03T11:00:00Z', INSTANT_PIC_PRESETS[0].image);
  assert.equal(instantPic.text, '');
  assert.ok(instantPic.image);

  // Text-only sticky note rejects blank text
  assert.throws(() => createQuickNote('alex', '   ', 'butter'), /Add a few words first/);

  let list = [n1, instantPic];
  // Optional caption can be added or updated later by the author
  list = updateQuickNoteCaption(list, instantPic.id, 'jamie', 'Morning coffee for two');
  assert.equal(list.find(n => n.id === instantPic.id)?.text, 'Morning coffee for two');
  // Instant pic caption can also be cleared back to empty
  list = updateQuickNoteCaption(list, instantPic.id, 'jamie', '');
  assert.equal(list.find(n => n.id === instantPic.id)?.text, '');

  // Pinning puts older note ahead of newer unpinned note
  list = toggleQuickNotePin(list, n1.id);
  const sorted = sortQuickNotes(list);
  assert.deepEqual(sorted.map(n => n.id), [n1.id, instantPic.id]);

  // Hearts toggle cleanly
  list = toggleQuickNoteHeart(list, instantPic.id, 'alex');
  assert.deepEqual(list.find(n => n.id === instantPic.id)?.hearts, ['alex']);

  // Only the author can remove their note
  assert.throws(() => removeQuickNote(list, n1.id, 'jamie'), /only remove/);
  list = removeQuickNote(list, n1.id, 'alex');
  assert.equal(list.length, 1);
});

test('Daily Errands lets either partner add, check off, uncheck, delete, and clear completed joint items', () => {
  const e1 = createErrandItem('alex', 'Pick up oat milk & sourdough', 'groceries', undefined, '2026-11-03T09:00:00Z');
  const e2 = createErrandItem('jamie', 'Water the balcony plants', 'home', 'alex', '2026-11-03T10:00:00Z');
  const e3 = createErrandItem('alex', 'Confirm Friday dinner reservation', 'admin', 'jamie', '2026-11-03T11:00:00Z');

  assert.throws(() => createErrandItem('alex', '   ', 'groceries'), /Add a few words first/);

  let list = [e1, e2, e3];
  assert.equal(errandsProgress(list).percent, 0);
  assert.equal(errandsProgress(list).pending, 3);

  // Jamie can check off an errand Alex added
  list = toggleErrandItem(list, e1.id, 'jamie', '2026-11-03T12:00:00Z');
  const checkedE1 = list.find(item => item.id === e1.id);
  assert.equal(checkedE1?.done, true);
  assert.equal(checkedE1?.completedBy, 'jamie');

  // Alex can check off an errand Jamie added
  list = toggleErrandItem(list, e2.id, 'alex', '2026-11-03T12:30:00Z');
  const stats = errandsProgress(list);
  assert.equal(stats.total, 3);
  assert.equal(stats.completed, 2);
  assert.equal(stats.pending, 1);
  assert.equal(stats.percent, 67);

  // Either partner can uncheck an item if needed
  list = toggleErrandItem(list, e2.id, 'jamie');
  assert.equal(list.find(item => item.id === e2.id)?.done, false);
  assert.equal(list.find(item => item.id === e2.id)?.completedBy, undefined);

  // Either partner can delete any item (even one created by the other partner)
  list = removeErrandItem(list, e3.id);
  assert.equal(list.length, 2);
  assert.ok(!list.some(item => item.id === e3.id));

  // Clear completed removes checked-off items and keeps active ones
  list = clearCompletedErrands(list);
  assert.deepEqual(list.map(item => item.id), [e2.id]);
});

test('generateSixDigitInviteCode produces unique 6-digit codes and normalizes partner codes', () => {
  const seen = new Set<string>();
  for (let i = 0; i < 20; i++) {
    const code = generateSixDigitInviteCode(`seed-${i}`, seen);
    assert.match(code, /^\d{6}$/);
    assert.equal(seen.has(code), false);
    seen.add(code);
    assert.equal(isValidSixDigitCode(code), true);
    assert.equal(isValidConnectionCode(code), true);
  }
  assert.equal(normalizeConnectionCode(' 482-917 '), '482917');
  assert.equal(normalizeConnectionCode('clsr-482917'), '482917');
  assert.equal(isValidSixDigitCode('482 917'), true);
  assert.equal(isValidSixDigitCode('12345'), false);
});

test('relationshipDurationBreakdown, nextAnniversaryCountdown, and buildCalendarMonthGrid compute elapsed time, countdowns, and onboarding calendar milestones', () => {
  assert.equal(ordinalSuffix(1), '1st');
  assert.equal(ordinalSuffix(2), '2nd');
  assert.equal(ordinalSuffix(3), '3rd');
  assert.equal(ordinalSuffix(4), '4th');
  assert.equal(ordinalSuffix(11), '11th');

  const startIso = '2025-05-14T18:30:00';
  const nowMs = new Date('2026-11-04T20:45:15').getTime();

  const elapsed = relationshipDurationBreakdown(startIso, nowMs);
  assert.equal(elapsed.years, 1);
  assert.equal(elapsed.months, 5);
  assert.equal(elapsed.days, 21);
  assert.equal(elapsed.hours, 2);
  assert.equal(elapsed.minutes, 15);
  assert.equal(elapsed.seconds, 15);
  assert.ok(elapsed.totalDays >= 539);

  const nextAnniv = nextAnniversaryCountdown(startIso, nowMs);
  assert.equal(nextAnniv.anniversaryNumber, 2);
  assert.equal(nextAnniv.label, '2nd Anniversary');
  assert.equal(nextAnniv.targetDate, '2027-05-14');
  assert.ok(nextAnniv.days > 180 && nextAnniv.days < 195);

  const nextMonthiv = nextMonthiversaryCountdown(startIso, nowMs);
  assert.equal(nextMonthiv.targetDate, '2026-11-14');
  assert.equal(nextMonthiv.anniversaryNumber, 18);
  assert.equal(nextMonthiv.label, '18th Monthiversary');

  const originStory: CoupleOriginStory = {
    myName: 'Aarav',
    partnerName: 'Meera',
    partnerNickname: 'Mimi',
    myGender: 'boy',
    partnerGender: 'girl',
    whenWeMet: 'Rainy evening at the bookstore on 2025-05-01',
    partnerOutfit: 'Floral sundress',
    whoProposed: 'Aarav',
    proposalNote: 'Under the fairy lights',
    whenRelationshipStarted: 'Walking home after coffee',
    relationshipStartedAt: startIso,
    inviteCode: '482917',
    joinedCode: '482917',
    isLinked: true,
    linkedAt: '2025-05-15T09:00:00',
  };

  const milestones = buildRelationshipMilestones(startIso, originStory, [], nowMs);
  assert.ok(milestones.some(m => m.kind === 'origin' && m.date === '2025-05-14'));
  assert.ok(milestones.some(m => m.kind === 'onboarding-chapter' && m.title === 'First Met Keepsake' && m.date === '2025-05-01'));
  assert.ok(milestones.some(m => m.kind === 'onboarding-chapter' && m.subtitle === 'Floral sundress'));
  assert.ok(milestones.some(m => m.kind === 'onboarding-chapter' && m.title === 'The Proposal & Confession'));
  assert.ok(milestones.some(m => m.kind === 'linked' && m.date === '2025-05-15'));
  assert.ok(milestones.some(m => m.kind === 'anniversary' && m.date === '2026-05-14'));
  assert.ok(milestones.some(m => m.kind === 'anniversary' && m.date === '2027-05-14'));
  assert.ok(milestones.some(m => m.kind === 'day-milestone'));

  // Build calendar grid for May 2025 (start month)
  const may2025Grid = buildCalendarMonthGrid(2025, 4, startIso, milestones, '2026-11-04');
  assert.equal(may2025Grid.length, 42);
  const startCell = may2025Grid.find(c => c.date === '2025-05-14');
  assert.ok(startCell);
  assert.equal(startCell.isStartDay, true);
  assert.ok(startCell.milestones.length >= 2);

  // Build calendar grid for May 2027 (2nd anniversary month)
  const may2027Grid = buildCalendarMonthGrid(2027, 4, startIso, milestones, '2026-11-04');
  const annivCell = may2027Grid.find(c => c.date === '2027-05-14');
  assert.ok(annivCell);
  assert.equal(annivCell.isAnniversaryDay, true);
  assert.ok(annivCell.milestones.some(m => m.kind === 'anniversary'));
});

test('partner notification builders and diffing alert on shared journal entries, instant pics, and quick notes', () => {
  assert.equal(shouldSendPartnerAlert('journal', DEFAULT_PARTNER_ALERT_PREFS), true);
  assert.equal(shouldSendPartnerAlert('instant-pic', DEFAULT_PARTNER_ALERT_PREFS), true);
  assert.equal(shouldSendPartnerAlert('quick-note', DEFAULT_PARTNER_ALERT_PREFS), true);
  assert.equal(shouldSendPartnerAlert('journal', { ...DEFAULT_PARTNER_ALERT_PREFS, enabled: false }), false);
  assert.equal(shouldSendPartnerAlert('instant-pic', { ...DEFAULT_PARTNER_ALERT_PREFS, instantPic: false }), false);

  const journalEntry = createJournalEntry('jamie', '2026-11-04', 'Loved our quiet evening walk together.', 'Evening Walk', 'gratitude', '2026-11-04T19:00:00Z');
  const journalAlert = buildPartnerAlertForJournal(journalEntry, 'Jamie');
  assert.equal(journalAlert.kind, 'journal');
  assert.equal(journalAlert.targetRoute, '/journal');
  assert.ok(journalAlert.title.includes('Jamie posted in your Shared Journal'));
  assert.ok(journalAlert.body.includes('Evening Walk'));

  const stickyNote = createQuickNote('jamie', 'Coffee is waiting on the counter ☕', 'butter', '2026-11-04T19:05:00Z');
  const noteAlert = buildPartnerAlertForQuickNote(stickyNote, 'Jamie');
  assert.equal(noteAlert.kind, 'quick-note');
  assert.equal(noteAlert.targetRoute, '/');
  assert.ok(noteAlert.title.includes('Jamie left a Quick Note'));

  const instantPic = createQuickNote('jamie', 'Sunset from my window', 'peach', '2026-11-04T19:10:00Z', 'data:image/jpeg;base64,abc123');
  const picAlert = buildPartnerAlertForQuickNote(instantPic, 'Jamie');
  assert.equal(picAlert.kind, 'instant-pic');
  assert.equal(picAlert.targetRoute, '/');
  assert.ok(picAlert.title.includes('Instant Pic'));

  const photoMoment: Moment = {
    id: 'm-photo-99',
    authorId: 'jamie',
    kind: 'photo',
    text: 'Morning espresso',
    image: 'data:image/jpeg;base64,xyz987',
    createdAt: '2026-11-04T19:15:00Z',
    hearts: [],
  };
  const momentPicAlert = buildPartnerAlertForPhotoMoment(photoMoment, 'Jamie');
  assert.equal(momentPicAlert.kind, 'instant-pic');

  const prevSpace = createDemo();
  const nextSpace = {
    ...prevSpace,
    journal: [journalEntry, ...(prevSpace.journal ?? [])],
    quickNotes: [instantPic, stickyNote, ...(prevSpace.quickNotes ?? [])],
  };
  const diffed = diffNewPartnerActivities(prevSpace, nextSpace, 'alex');
  assert.equal(diffed.length, 3);
  assert.ok(diffed.some(a => a.kind === 'journal'));
  assert.ok(diffed.some(a => a.kind === 'instant-pic'));
  assert.ok(diffed.some(a => a.kind === 'quick-note'));
});

test('multi-step onboarding sequence initializes draft, validates steps including mandatory Terms & Privacy, and finalizes origin story with 6-digit connection code', () => {
  assert.equal(ONBOARDING_STEPS.length, 7);
  assert.deepEqual(
    ONBOARDING_STEPS.map(s => s.id),
    ['mode', 'identity', 'story', 'date', 'photos', 'code', 'legal']
  );
  assert.ok(TERMS_OF_SERVICE_SECTIONS.length >= 4);
  assert.ok(PRIVACY_POLICY_SECTIONS.length >= 4);

  const fixedStart = new Date('2025-08-19T21:15:30Z');
  const draft = createInitialOnboardingDraft(
    {
      myName: 'Rohan',
      partnerNickname: 'Jaan',
      partnerName: 'Ananya',
      myGender: 'boy',
      partnerGender: 'girl',
    },
    'distance',
    fixedStart
  );

  assert.equal(draft.mode, 'distance');
  assert.equal(draft.myName, 'Rohan');
  assert.equal(draft.partnerNickname, 'Jaan');
  assert.equal(draft.myGender, 'boy');
  assert.equal(draft.partnerGender, 'girl');
  assert.match(draft.inviteCode, /^\d{6}$/);
  assert.ok(draft.myAvatar);
  assert.ok(draft.partnerAvatar);
  assert.equal(draft.acceptedTerms, false);
  assert.equal(draft.acceptedPrivacy, false);

  assert.equal(validateOnboardingStep(1, draft).valid, true);
  assert.equal(validateOnboardingStep(2, draft).valid, true);
  assert.equal(validateOnboardingStep(4, draft).valid, true);
  assert.equal(validateOnboardingStep(6, draft).valid, true);

  // Step 7 requires both Terms of Service and Privacy Policy acceptance
  assert.equal(validateOnboardingStep(7, draft).valid, false);
  assert.equal(validateLegalAgreement(true, false).valid, false);
  assert.equal(validateLegalAgreement(false, true).valid, false);
  assert.equal(validateLegalAgreement(true, true).valid, true);
  assert.throws(() => finalizeOnboardingOriginStory(draft), /Terms of Service and Privacy Policy/);

  // Rejects self-redemption of own connection code
  const selfJoinCheck = validateOnboardingStep(6, { ...draft, joinCode: draft.inviteCode });
  assert.equal(selfJoinCheck.valid, false);
  assert.match(selfJoinCheck.error || '', /own connection code/);

  // Finalize origin story with partner code redemption + accepted Terms & Privacy
  const finalized = finalizeOnboardingOriginStory(
    {
      ...draft,
      whenWeMet: 'In college library',
      partnerOutfit: 'Yellow kurti',
      whoProposed: 'I (Rohan) proposed',
      proposalNote: 'With handwritten notes',
      whenRelationshipStarted: '19 August 2025',
      joinCode: '839201',
      acceptedTerms: true,
      acceptedPrivacy: true,
    },
    '2026-11-04T12:00:00Z'
  );

  assert.equal(finalized.myName, 'Rohan');
  assert.equal(finalized.partnerNickname, 'Jaan');
  assert.equal(finalized.partnerName, 'Ananya');
  assert.equal(finalized.myGender, 'boy');
  assert.equal(finalized.partnerGender, 'girl');
  assert.equal(finalized.whenWeMet, 'In college library');
  assert.equal(finalized.partnerOutfit, 'Yellow kurti');
  assert.equal(finalized.inviteCode, draft.inviteCode);
  assert.equal(finalized.joinedCode, '839201');
  assert.equal(finalized.isLinked, true);
  assert.equal(finalized.linkedAt, '2026-11-04T12:00:00Z');
  assert.equal(finalized.acceptedTerms, true);
  assert.equal(finalized.acceptedPrivacy, true);
  assert.equal(finalized.legalAcceptedAt, '2026-11-04T12:00:00Z');
  assert.equal(finalized.legalVersion, LEGAL_POLICY_VERSION);
});

test('image optimization presets, dimension bounding, byte estimation, and CDN URL builder work for Memory Lane and Instant Pic', () => {
  assert.equal(IMAGE_OPTIMIZATION_PRESETS['instant-pic'].maxDimension, 720);
  assert.equal(IMAGE_OPTIMIZATION_PRESETS['memory-lane'].maxDimension, 960);
  assert.equal(IMAGE_OPTIMIZATION_PRESETS.avatar.maxDimension, 420);

  // Dimension bounding preserves aspect ratio and avoids upscaling smaller images
  const downscaled = computeTargetDimensions(3000, 2000, 960);
  assert.equal(downscaled.width, 960);
  assert.equal(downscaled.height, 640);
  assert.equal(downscaled.resized, true);

  const portrait = computeTargetDimensions(1200, 2400, 720);
  assert.equal(portrait.width, 360);
  assert.equal(portrait.height, 720);
  assert.equal(portrait.resized, true);

  const alreadySmall = computeTargetDimensions(500, 400, 960);
  assert.equal(alreadySmall.width, 500);
  assert.equal(alreadySmall.height, 400);
  assert.equal(alreadySmall.resized, false);

  // Base64 byte estimation handles both raw base64 and data URIs
  const sampleBase64 = Buffer.from('closer-couple-image-payload').toString('base64');
  assert.equal(estimateBase64Bytes(sampleBase64), 27);
  assert.equal(estimateBase64Bytes(`data:image/jpeg;base64,${sampleBase64}`), 27);
  assert.equal(formatImageByteSize(92 * 1024), '92 KB');

  // Local data URIs pass through unchanged
  const dataUri = 'data:image/svg+xml;utf8,<svg></svg>';
  assert.equal(buildCdnImageUrl(dataUri, { variant: 'card' }), dataUri);

  // Remote storage URLs receive CDN width, height, quality, and resize query params
  const remoteUrl = 'https://example.supabase.co/storage/v1/object/sign/couple-photos/123.jpg?token=abc';
  const cardCdnUrl = buildCdnImageUrl(remoteUrl, { variant: 'card', width: 410, height: 284, quality: 75 });
  assert.match(cardCdnUrl, /token=abc/);
  assert.match(cardCdnUrl, /width=410/);
  assert.match(cardCdnUrl, /height=284/);
  assert.match(cardCdnUrl, /quality=75/);
  assert.match(cardCdnUrl, /resize=cover/);

  // Explicit CDN proxy base URL wraps source URL with edge optimization params
  const proxiedUrl = buildCdnImageUrl('https://images.example.com/photo.jpg', {
    cdnBaseUrl: 'https://cdn.closer.app/img',
    width: 420,
    height: 260,
    quality: 72,
  });
  assert.match(proxiedUrl, /^https:\/\/cdn\.closer\.app\/img\?/);
  assert.match(proxiedUrl, /w=420/);
  assert.match(proxiedUrl, /h=260/);
  assert.match(proxiedUrl, /q=72/);
});

test('Sentry error monitoring parses DSNs, scrubs couple PII, parses stack traces, and builds Sentry v7 event payloads', () => {
  // Valid Sentry DSN parsing
  const parsed = parseSentryDsn('https://abc123publickey@o450000.ingest.sentry.io/987654');
  assert.ok(parsed);
  assert.equal(parsed.publicKey, 'abc123publickey');
  assert.equal(parsed.host, 'o450000.ingest.sentry.io');
  assert.equal(parsed.projectId, '987654');
  assert.equal(parsed.storeUrl, 'https://o450000.ingest.sentry.io/api/987654/store/');
  assert.equal(parsed.envelopeUrl, 'https://o450000.ingest.sentry.io/api/987654/envelope/');

  // Invalid or empty DSN returns null gracefully
  assert.equal(parseSentryDsn(''), null);
  assert.equal(parseSentryDsn('https://ingest.sentry.io/987654'), null);
  assert.equal(parseSentryDsn('not-a-url'), null);

  // Sensitive text scrubbing redacts emails, invite codes, Bearer tokens, and data URIs
  const rawLeak = 'Failed for rohan@example.com with code 482910 and Bearer secretToken123 and data:image/jpeg;base64,AAAA';
  const scrubbed = scrubSensitiveText(rawLeak);
  assert.doesNotMatch(scrubbed, /rohan@example\.com/);
  assert.doesNotMatch(scrubbed, /482910/);
  assert.doesNotMatch(scrubbed, /secretToken123/);
  assert.match(scrubbed, /\[REDACTED_EMAIL\]/);
  assert.match(scrubbed, /\[REDACTED_INVITE_CODE\]/);
  assert.match(scrubbed, /\[REDACTED_TOKEN\]/);
  assert.match(scrubbed, /\[REDACTED_DATA_URI\]/);

  // Metadata scrubber redacts sensitive couple keys
  const meta = scrubMonitoringMetadata({
    screen: 'journal',
    noteBody: 'Secret love letter',
    inviteCode: '849201',
    retryCount: 2,
  });
  assert.equal(meta.screen, 'journal');
  assert.equal(meta.noteBody, '[REDACTED]');
  assert.equal(meta.inviteCode, '[REDACTED]');
  assert.equal(meta.retryCount, 2);

  // Stack trace parser handles V8 and JSC frames
  const sampleStack = [
    'TypeError: Class extends value undefined is not a constructor or null',
    '    at sendMoment (src/store.tsx:314:15)',
    '    at Object.apply (node_modules/react-native/index.js:42:9)',
  ].join('\n');
  const frames = parseStackFrames(sampleStack);
  assert.equal(frames.length, 2);
  assert.equal(frames[1].function, 'sendMoment');
  assert.equal(frames[1].filename, 'src/store.tsx');
  assert.equal(frames[1].lineno, 314);
  assert.equal(frames[1].in_app, true);
  assert.equal(frames[0].in_app, false);

  // Breadcrumb ring buffer bounds length and scrubs message PII
  let crumbs: MonitoringBreadcrumb[] = [];
  crumbs = appendBreadcrumb(crumbs, { category: 'navigation', level: 'info', message: 'Opened /connect with 938271' }, 2);
  crumbs = appendBreadcrumb(crumbs, { category: 'sync', level: 'warning', message: 'Retrying sync for user@couple.io' }, 2);
  crumbs = appendBreadcrumb(crumbs, { category: 'ui', level: 'info', message: 'Tapped save' }, 2);
  assert.equal(crumbs.length, 2);
  assert.match(crumbs[0].message, /\[REDACTED_EMAIL\]/);
  assert.equal(crumbs[1].message, 'Tapped save');

  // Sentry event payload builder constructs spec-compliant payload
  const sampleErr = new TypeError('Upload failed for user@couple.io');
  sampleErr.stack = sampleStack;
  const payload = buildSentryEventPayload({
    error: sampleErr,
    level: 'error',
    handled: false,
    mechanismType: 'window.onerror',
    environment: 'production',
    userId: 'user-uuid-123',
    breadcrumbs: crumbs,
    extra: { caption: 'Private photo caption', attempt: 1 },
  });
  assert.equal(payload.event_id.length, 32);
  assert.equal(payload.level, 'error');
  assert.equal(payload.environment, 'production');
  assert.equal(payload.exception?.values[0].type, 'TypeError');
  assert.match(payload.exception?.values[0].value || '', /\[REDACTED_EMAIL\]/);
  assert.equal(payload.exception?.values[0].mechanism.handled, false);
  assert.equal(payload.extra?.caption, '[REDACTED]');
  assert.equal(payload.extra?.attempt, 1);
});

test('haptic feedback profiles map user interactions to expo-haptics styles and respect cooldown throttling', () => {
  assert.equal(resolveHapticProfile('tap').method, 'impact');
  assert.equal(resolveHapticProfile('tap').impactStyle, 'Light');
  assert.equal(resolveHapticProfile('selection').method, 'selection');
  assert.equal(resolveHapticProfile('task-check').method, 'notification');
  assert.equal(resolveHapticProfile('task-check').notificationType, 'Success');
  assert.equal(resolveHapticProfile('instant-pic').method, 'impact');
  assert.equal(resolveHapticProfile('instant-pic').impactStyle, 'Medium');
  assert.equal(resolveHapticProfile('heart').impactStyle, 'Soft');
  assert.equal(resolveHapticProfile('warning').notificationType, 'Warning');
  assert.equal(resolveHapticProfile('error').notificationType, 'Error');

  // Disabled haptics never trigger
  assert.equal(shouldTriggerHaptic('tap', false, 0, 1000), false);

  // First trigger succeeds, rapid duplicate within cooldown is throttled, post-cooldown succeeds
  assert.equal(shouldTriggerHaptic('task-check', true, 0, 1000), true);
  assert.equal(shouldTriggerHaptic('task-check', true, 1000, 1020), false);
  assert.equal(shouldTriggerHaptic('task-check', true, 1000, 1000 + HAPTIC_PROFILES['task-check'].cooldownMs + 5), true);
});


