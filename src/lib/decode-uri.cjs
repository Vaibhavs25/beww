'use strict';

// Expo Router 57 reaches decode-uri-component 0.2.x through query-string 7.
// That decoder recursively retries malformed input (GHSA-vcc3-ghjq-m6fr).
// The app uses the native decoder, preserving invalid input verbatim instead
// of recursively trying substrings. Valid URI decoding is unchanged.
module.exports = function decodeUri(value) {
  if (typeof value !== 'string') throw new TypeError('Expected a string');
  try { return decodeURIComponent(value); } catch { return value; }
};
