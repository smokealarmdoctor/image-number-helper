import { test } from 'node:test';
import assert from 'node:assert/strict';
import { signLicense, verifyLicense } from '../extension/src/license.js';
import worker, { verifyStripeSignature } from '../license-server/src/index.js';

async function keypair() {
  const p = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
  return { pub: await crypto.subtle.exportKey('jwk', p.publicKey), priv: await crypto.subtle.exportKey('jwk', p.privateKey) };
}

test('license round-trips and survives pasted whitespace', async () => {
  const { pub, priv } = await keypair();
  const key = await signLicense({ v: 1, plan: 'pro', email: 'a@b.co', sid: 'x', iat: 1 }, priv);
  assert.match(key, /^INH1\.[\w-]+\.[\w-]+$/);
  assert.equal((await verifyLicense(key, pub)).email, 'a@b.co');
  const wrapped = key.replace(/(.{40})/g, '$1\n  ');
  assert.equal((await verifyLicense(wrapped, pub)).plan, 'pro');
});

test('license rejects tampering, other keys and junk', async () => {
  const a = await keypair();
  const b = await keypair();
  const key = await signLicense({ v: 1, plan: 'pro', email: 'a@b.co' }, a.priv);
  const [p, body, sig] = key.split('.');
  const forged = `${p}.${Buffer.from(JSON.stringify({ v: 1, plan: 'pro', email: 'evil@x' })).toString('base64url')}.${sig}`;
  assert.equal(await verifyLicense(forged, a.pub), null);
  assert.equal(await verifyLicense(key, b.pub), null);
  assert.equal(await verifyLicense('hello', a.pub), null);
  assert.equal(await verifyLicense(`${p}.${body}.AAAA`, a.pub), null);
  assert.equal(await verifyLicense(key, null), null);
});

async function stripeHeader(payload, secret, t = Math.floor(Date.now() / 1000)) {
  const k = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = Buffer.from(await crypto.subtle.sign('HMAC', k, new TextEncoder().encode(`${t}.${payload}`))).toString('hex');
  return `t=${t},v1=${sig}`;
}

test('stripe webhook signature: valid, wrong secret, stale', async () => {
  const body = '{"id":"evt_1"}';
  assert.equal(await verifyStripeSignature(body, await stripeHeader(body, 'whsec_a'), 'whsec_a'), true);
  assert.equal(await verifyStripeSignature(body, await stripeHeader(body, 'whsec_b'), 'whsec_a'), false);
  const old = Math.floor(Date.now() / 1000) - 3600;
  assert.equal(await verifyStripeSignature(body, await stripeHeader(body, 'whsec_a', old), 'whsec_a'), false);
  assert.equal(await verifyStripeSignature(body + ' ', await stripeHeader(body, 'whsec_a'), 'whsec_a'), false);
});

// ---- Worker routes with a fake Stripe API ----
function fakeStripe(session) {
  const pi = { id: 'pi_1', metadata: {} };
  const calls = [];
  const orig = globalThis.fetch;
  globalThis.fetch = async (url, init = {}) => {
    const u = String(url);
    calls.push([init.method || 'GET', u]);
    const json = (o) => new Response(JSON.stringify(o), { status: 200 });
    if (u.includes('/checkout/sessions/')) return json({ ...session, payment_intent: { ...pi, metadata: { ...pi.metadata } } });
    if (u.includes('/checkout/sessions?')) return json({ data: [{ ...session, payment_intent: { ...pi } }] });
    if (u.endsWith('/payment_intents/pi_1') && init.method === 'POST') {
      const f = new URLSearchParams(init.body);
      pi.metadata.license_key = f.get('metadata[license_key]');
      return json(pi);
    }
    if (u.includes('api.resend.com')) return json({ id: 'em_1' });
    return new Response('{}', { status: 404 });
  };
  return { pi, calls, restore: () => (globalThis.fetch = orig) };
}

const paid = {
  id: 'cs_test_abc123',
  status: 'complete',
  payment_status: 'paid',
  metadata: { app: 'image-number-helper', plan: 'pro' },
  customer_details: { email: 'buyer@example.com' },
};

test('success page issues one stable key and exposes it to the extension', async () => {
  const { pub, priv } = await keypair();
  const env = { STRIPE_SECRET_KEY: 'sk_test', LICENSE_PRIVATE_JWK: JSON.stringify(priv), APP_ID: 'image-number-helper' };
  const s = fakeStripe(paid);
  try {
    const r1 = await worker.fetch(new Request('https://w.dev/success?session_id=cs_test_abc123'), env);
    const html1 = await r1.text();
    const key = html1.match(/data-inh-license="([^"]+)"/)[1];
    assert.equal((await verifyLicense(key, pub)).email, 'buyer@example.com');
    const r2 = await worker.fetch(new Request('https://w.dev/success?session_id=cs_test_abc123'), env);
    assert.equal((await r2.text()).match(/data-inh-license="([^"]+)"/)[1], key, 'reload returns the same key');
    assert.equal(s.calls.filter(([m]) => m === 'POST').length, 1);
  } finally {
    s.restore();
  }
});

test('success page refuses unpaid or foreign sessions', async () => {
  const { priv } = await keypair();
  const env = { STRIPE_SECRET_KEY: 'sk_test', LICENSE_PRIVATE_JWK: JSON.stringify(priv) };
  for (const session of [{ ...paid, payment_status: 'unpaid' }, { ...paid, metadata: {} }]) {
    const s = fakeStripe(session);
    try {
      const r = await worker.fetch(new Request('https://w.dev/success?session_id=cs_test_abc123'), env);
      assert.equal(r.status, 202);
      assert.doesNotMatch(await r.text(), /data-inh-license/);
    } finally {
      s.restore();
    }
  }
  const bad = await worker.fetch(new Request('https://w.dev/success?session_id=../../x'), env);
  assert.equal(bad.status, 404);
});

test('webhook issues + emails key; rejects bad signature', async () => {
  const { priv } = await keypair();
  const env = { STRIPE_SECRET_KEY: 'sk_test', STRIPE_WEBHOOK_SECRET: 'whsec_t', RESEND_API_KEY: 're_x', LICENSE_PRIVATE_JWK: JSON.stringify(priv) };
  const s = fakeStripe(paid);
  try {
    const body = JSON.stringify({ type: 'checkout.session.completed', data: { object: { id: paid.id } } });
    const bad = await worker.fetch(new Request('https://w.dev/webhook', { method: 'POST', body, headers: { 'Stripe-Signature': 't=1,v1=00' } }), env);
    assert.equal(bad.status, 400);
    const ok = await worker.fetch(
      new Request('https://w.dev/webhook', { method: 'POST', body, headers: { 'Stripe-Signature': await stripeHeader(body, 'whsec_t') } }),
      env
    );
    assert.equal(ok.status, 200);
    assert.ok(s.pi.metadata.license_key?.startsWith('INH1.'));
    assert.ok(s.calls.some(([, u]) => u.includes('api.resend.com')));
  } finally {
    s.restore();
  }
});

test('recover answers identically whether or not the email bought', async () => {
  const { priv } = await keypair();
  const env = { STRIPE_SECRET_KEY: 'sk_test', RESEND_API_KEY: 're_x', LICENSE_PRIVATE_JWK: JSON.stringify(priv) };
  const s = fakeStripe(paid);
  try {
    const fd = new FormData();
    fd.set('email', 'buyer@example.com');
    const r = await worker.fetch(new Request('https://w.dev/recover', { method: 'POST', body: fd }), env);
    assert.match(await r.text(), /If that email bought Pro/);
    assert.ok(s.calls.some(([, u]) => u.includes('api.resend.com')));
  } finally {
    s.restore();
  }
});

test('license verifies against any key in a rotated key list', async () => {
  const a = await keypair();
  const b = await keypair();
  const oldKey = await signLicense({ v: 1, plan: 'pro', email: 'old@x.co' }, a.priv);
  const newKey = await signLicense({ v: 1, plan: 'pro', email: 'new@x.co' }, b.priv);
  assert.equal((await verifyLicense(oldKey, [a.pub, b.pub])).email, 'old@x.co');
  assert.equal((await verifyLicense(newKey, [a.pub, b.pub])).email, 'new@x.co');
  assert.equal(await verifyLicense(newKey, [a.pub]), null);
  assert.equal(await verifyLicense(oldKey, []), null);
});
