import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MIN_DAYS, MIN_USES, nextUsage, shouldAskForRating } from '../extension/src/rating.js';

const DAY = 86_400_000;
const t0 = Date.UTC(2026, 10, 1);

test('never asks a new or light user', () => {
  assert.equal(shouldAskForRating(null, t0), false);
  assert.equal(shouldAskForRating({ uses: MIN_USES - 1, firstUse: t0 - 30 * DAY, done: false }, t0), false);
  assert.equal(shouldAskForRating({ uses: 50, firstUse: t0 - (MIN_DAYS - 1) * DAY, done: false }, t0), false);
});

test('asks once after enough use over enough days', () => {
  assert.equal(shouldAskForRating({ uses: MIN_USES, firstUse: t0 - MIN_DAYS * DAY, done: false }, t0), true);
});

test('never asks again once answered', () => {
  assert.equal(shouldAskForRating({ uses: 99, firstUse: t0 - 90 * DAY, done: true }, t0), false);
});

test('usage counter records first use once and counts up', () => {
  const a = nextUsage(null, t0);
  assert.deepEqual(a, { uses: 1, firstUse: t0, done: false });
  const b = nextUsage(a, t0 + DAY);
  assert.equal(b.uses, 2);
  assert.equal(b.firstUse, t0);
});
