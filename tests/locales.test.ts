import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isLanguage, normalizeLanguage, translate, TRANSLATIONS, type TranslationKey } from '../src/locales.ts';

test('English and Hindi catalogues cover the same keys and interpolation fields', () => {
  assert.deepEqual(Object.keys(TRANSLATIONS.en).sort(), Object.keys(TRANSLATIONS.hi).sort());
  for (const key of Object.keys(TRANSLATIONS.en) as TranslationKey[]) {
    const fields = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map(match => match[1]).sort();
    assert.deepEqual(fields(TRANSLATIONS.en[key]), fields(TRANSLATIONS.hi[key]), key);
    assert.ok(TRANSLATIONS.hi[key].trim(), key);
  }
});
test('unsupported and missing profile preferences fall back to English', () => {
  for (const value of [undefined, null, '', 'fr', 'HI', 'hi-IN', { language: 'hi' }]) {
    assert.equal(isLanguage(value), false); assert.equal(normalizeLanguage(value), 'en');
  }
  assert.equal(normalizeLanguage('hi'), 'hi'); assert.equal(isLanguage('en'), true);
});
test('translations preserve user-authored interpolation values', () => {
  assert.equal(translate('en', 'home.title', { name: 'Asha' }), 'A little closer, Asha.');
  assert.equal(translate('hi', 'home.title', { name: 'Jamie ♡' }), 'थोड़ा और करीब, Jamie ♡।');
  assert.equal(translate('hi', 'settings.signedIn', { email: 'person@example.invalid' }), 'person@example.invalid से साइन इन हैं');
});
