import { test } from 'node:test';
import assert from 'node:assert/strict';
import { currentMoodStreak, logDemoMood, offsetDay, recentPhotos, streakFor } from '../src/dashboard.ts';
import { questionFor, sharedDay, type MoodEntry, type Moment } from '../src/domain.ts';

const entry = (day: string, authorId = 'alex'): MoodEntry => ({ authorId, day, mood: 'low', updatedAt: `${day}T12:00:00Z` });
test('daily mood edits replace the day, preserve the partner, and count every feeling', () => {
  let history = logDemoMood(null, entry('2026-11-04'));
  history = logDemoMood(history, entry('2026-11-04', 'jamie'));
  history = logDemoMood(history, { ...entry('2026-11-04'), mood: 'happy' });
  assert.equal(history.entries.length, 2); assert.equal(history.entries.find(row => row.authorId === 'alex')?.mood, 'happy');
  assert.equal(currentMoodStreak(history, 'alex', '2026-11-04'), 1);
  assert.equal(currentMoodStreak(history, 'jamie', '2026-11-04'), 1);
  assert.equal(currentMoodStreak(history, 'alex', '2026-11-05'), 1);
  assert.equal(currentMoodStreak(history, 'alex', '2026-11-06'), 0);
});
test('mood streaks handle leap days, duplicates, gaps, future entries, and runs longer than 30 days', () => {
  const entries = ['2024-02-28', '2024-02-29', '2024-03-01', '2024-03-01', '2024-03-03'].map(day => entry(day));
  assert.equal(streakFor(entries, 'alex', '2024-03-01').days, 3);
  assert.equal(streakFor(entries, 'alex', '2024-03-02').days, 3);
  assert.equal(streakFor(entries, 'alex', '2024-03-03').days, 1);
  assert.equal(streakFor(entries, 'jamie', '2024-03-01').days, 0);
  assert.equal(streakFor(Array.from({ length: 90 }, (_, i) => entry(offsetDay('2026-11-04', -i))), 'alex', '2026-11-04').days, 90);
});
test('calendar days survive DST changes and both partners use the couple’s midnight', () => {
  assert.equal(offsetDay('2026-11-01', 1), '2026-11-02');
  const before = sharedDay('Asia/Kolkata', new Date('2026-11-04T18:29:59Z'));
  const after = sharedDay('Asia/Kolkata', new Date('2026-11-04T18:30:00Z'));
  assert.equal(before, '2026-11-04'); assert.equal(after, '2026-11-05');
  assert.equal(streakFor([entry(before), entry(after)], 'alex', after).days, 2);
});
test('Memory Lane includes only photos in the rolling 30-day window, newest first', () => {
  const now = Date.parse('2026-11-04T12:00:00Z');
  const photo = (id: string, age: number, kind: Moment['kind'] = 'photo'): Moment => ({ id, kind, authorId: 'alex', text: '', hearts: [], createdAt: new Date(now - age).toISOString() });
  const input = [photo('old', 30 * 86400000 + 1), photo('boundary', 30 * 86400000), photo('b', 0), photo('a', 0), photo('note', 0, 'note'), photo('future', -1)];
  assert.deepEqual(recentPhotos(input, now).map(row => row.id), ['b', 'a', 'boundary']);
  assert.equal(input[0].id, 'old'); assert.deepEqual(recentPhotos([], now), []);
});
test('daily prompts rotate at the shared midnight without relabeling earlier answers', () => {
  assert.equal(questionFor('2026-11-05'), 'If we opened a tiny café, what would we call it?');
  assert.notEqual(questionFor('2026-11-05'), questionFor('2026-11-06'));
  assert.equal(questionFor('2026-11-05'), questionFor('2026-11-19'));
  assert.equal(questionFor('2026-11-04'), 'What does your ideal slow Sunday with me look like?');
});
