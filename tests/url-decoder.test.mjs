import { test } from 'node:test';
import assert from 'node:assert/strict';
import decode from '../src/lib/decode-uri.cjs';

test('deep links decode Unicode, whitespace and reserved characters', () => {
  for (const value of ['A note for you ♡','coffee & a walk?','तुम और मैं','100% together','🌿']) assert.equal(decode(encodeURIComponent(value)),value);
});
test('malformed percent-encoded links stay bounded and are preserved', () => {
  const attack='%EA'.repeat(20000); const start=performance.now();
  assert.equal(decode(attack),attack); assert.equal(decode('hello%xy%'), 'hello%xy%');
  assert.ok(performance.now()-start<1000,'malformed input should not trigger recursive decoding');
});
