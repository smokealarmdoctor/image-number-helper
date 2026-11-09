import { test } from 'node:test';
import assert from 'node:assert/strict';
import { deriveKeys } from '../license-server/derive.mjs';
import { signLicense, verifyLicense } from '../extension/src/license.js';

test('seed-derived key is deterministic and signs verifiable licenses', async () => {
  const a = deriveKeys('seed-one');
  assert.deepEqual(deriveKeys('seed-one').publicJwk, a.publicJwk);
  assert.notDeepEqual(deriveKeys('seed-two').publicJwk, a.publicJwk);
  const key = await signLicense({ v: 1, plan: 'pro', email: 'x@y.z' }, a.privateJwk);
  assert.equal((await verifyLicense(key, [a.publicJwk])).email, 'x@y.z');
  assert.equal(await verifyLicense(key, [deriveKeys('seed-two').publicJwk]), null);
});
