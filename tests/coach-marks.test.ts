import { test } from 'node:test';
import assert from 'node:assert/strict';
import { coachMarkLayout, dashboardTipsKey } from '../src/coach-marks.ts';

test('coach marks stay below a phone target when there is room', () => {
  const { highlight, side, card } = coachMarkLayout({ x: 38, y: 240, width: 284, height: 44 }, { width: 360, height: 800 }, 270);
  assert.equal(side, 'below'); assert.equal(highlight.width, 296);
  assert.ok(card.top > highlight.y + highlight.height);
  assert.ok(card.left >= 16 && card.left + card.width <= 344);
  assert.ok(card.top + Math.min(270, card.maxHeight) <= 784);
});
test('a target near the bottom places the explanation above it', () => {
  const { highlight, side, card } = coachMarkLayout({ x: 1250, y: 820, width: 155, height: 42 }, { width: 1440, height: 900 }, 260);
  assert.equal(side, 'above'); assert.ok(card.top + 260 < highlight.y);
  assert.ok(card.left + card.width <= 1424);
});
test('landscape screens and enlarged text get a bounded scrolling explanation', () => {
  const { highlight, card } = coachMarkLayout({ x: 8, y: 90, width: 120, height: 44 }, { width: 568, height: 320 }, 520);
  assert.ok(highlight.x >= 0); assert.ok(card.maxHeight < 520);
  assert.ok(card.top >= 16 && card.top + card.maxHeight <= 304);
});
test('spotlights clip to the viewport and completion keys separate accounts', () => {
  const { highlight } = coachMarkLayout({ x: -3, y: 8, width: 380, height: 52 }, { width: 360, height: 640 });
  assert.ok(highlight.x >= 0 && highlight.x + highlight.width <= 360);
  assert.notEqual(dashboardTipsKey('alice'), dashboardTipsKey('bob'));
  assert.notEqual(dashboardTipsKey('local:couple-space'), dashboardTipsKey('alice'));
});
