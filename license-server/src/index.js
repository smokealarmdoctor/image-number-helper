// Image Number Helper — license Worker (Cloudflare Workers, no dependencies).
//
// Flow:  Stripe Payment Link  ──paid──▶  /success?session_id=…  shows the key and
//        hands it to the extension automatically (content script reads
//        [data-inh-license]).  The webhook issues + emails the same key even if
//        the buyer closes the tab.  /recover re-sends keys by email.
//
// Keys are ECDSA-signed (see extension/src/license.js), so the extension
// verifies them offline — this Worker is only needed at purchase/recovery time.
//
// Secrets (wrangler secret put …):
//   STRIPE_SECRET_KEY       sk_test_… / sk_live_… (restricted key is fine: Checkout Sessions read, PaymentIntents write)
//   STRIPE_WEBHOOK_SECRET   whsec_…
//   LICENSE_PRIVATE_JWK     JSON from `npm run keys`
//   RESEND_API_KEY          optional — enables emailing keys (resend.com)
// Vars (wrangler.toml): FROM_EMAIL, SUPPORT_URL, APP_ID

import { signLicense } from '../../extension/src/license.js';

const STRIPE = 'https://api.stripe.com/v1';

// ---------- Stripe helpers ----------
function form(obj, prefix = '', out = new URLSearchParams()) {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}[${k}]` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) form(v, key, out);
    else if (Array.isArray(v)) v.forEach((item) => out.append(`${key}[]`, item));
    else if (v !== undefined) out.append(key, String(v));
  }
  return out;
}

async function stripe(env, method, path, body) {
  const res = await fetch(`${STRIPE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      'Stripe-Version': '2024-06-20',
      ...(body ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}),
    },
    body: body ? form(body) : undefined,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`Stripe ${method} ${path}: ${json?.error?.message || res.status}`);
  return json;
}

const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

/** Verifies a Stripe-Signature header (v1 scheme). Exported for tests. */
export async function verifyStripeSignature(payload, header, secret, toleranceSec = 300, now = Date.now()) {
  if (!header || !secret) return false;
  const parts = Object.fromEntries(
    header.split(',').map((p) => {
      const i = p.indexOf('=');
      return [p.slice(0, i).trim(), p.slice(i + 1)];
    })
  );
  const sigs = header
    .split(',')
    .filter((p) => p.trim().startsWith('v1='))
    .map((p) => p.trim().slice(3));
  const t = Number(parts.t);
  if (!t || !sigs.length) return false;
  if (Math.abs(now / 1000 - t) > toleranceSec) return false;
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const expected = hex(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${t}.${payload}`)));
  return sigs.some((s) => timingSafeEqual(s, expected));
}

// ---------- licensing ----------
function isOurPaidSession(session, env) {
  const appOk = (session.metadata?.app || '') === (env.APP_ID || 'image-number-helper');
  const paid = session.payment_status === 'paid' || session.payment_status === 'no_payment_required';
  return appOk && paid && session.status === 'complete';
}

/**
 * Returns the license key for a paid Checkout Session, creating it once and
 * storing it on the PaymentIntent's metadata so every later call (success page,
 * webhook retry, recovery email) returns the same key.
 */
async function licenseFor(env, session) {
  const pi =
    typeof session.payment_intent === 'string'
      ? await stripe(env, 'GET', `/payment_intents/${session.payment_intent}`)
      : session.payment_intent;
  if (pi?.metadata?.license_key) return { key: pi.metadata.license_key, created: false };
  const email = session.customer_details?.email || '';
  const key = await signLicense(
    { v: 1, plan: session.metadata?.plan || 'pro', email, sid: session.id.slice(-10), iat: Math.floor(Date.now() / 1000) },
    JSON.parse(env.LICENSE_PRIVATE_JWK)
  );
  if (pi?.id) {
    await stripe(env, 'POST', `/payment_intents/${pi.id}`, {
      metadata: { license_key: key, license_email: email },
    });
  }
  return { key, created: true };
}

async function getSession(env, id) {
  return stripe(env, 'GET', `/checkout/sessions/${encodeURIComponent(id)}?expand[]=payment_intent`);
}

async function sendKeyEmail(env, to, keys) {
  if (!env.RESEND_API_KEY || !to) return false;
  const list = keys.map((k) => `<pre style="white-space:pre-wrap;word-break:break-all;background:#f5f6f8;padding:12px;border-radius:8px;font-size:13px">${esc(k)}</pre>`).join('');
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: env.FROM_EMAIL || 'Image Number Helper <onboarding@resend.dev>',
      to: [to],
      subject: 'Your Image Number Helper Pro key',
      html: `<div style="font-family:system-ui,sans-serif;max-width:520px">
        <h2>Thanks for going Pro!</h2>
        <p>Open the extension → click <b>Upgrade</b> → paste this key → <b>Activate</b>. It works on every Chrome profile you sign into.</p>
        ${list}
        <p style="color:#5d6673;font-size:13px">Keep this email. Lost it later? Use “Lost your key?” in the extension.</p></div>`,
      text: `Thanks for going Pro!\n\nPaste this key in the extension (Upgrade → Activate):\n\n${keys.join('\n\n')}\n`,
    }),
  });
  return res.ok;
}

// ---------- HTML ----------
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

function page(title, body, status = 200) {
  return new Response(
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title><meta name="robots" content="noindex">
<style>
:root{--bg:#f7f8fa;--card:#fff;--text:#111418;--muted:#5d6673;--line:#e4e7ec;--accent:#e5243b;--ok:#12b76a}
@media (prefers-color-scheme:dark){:root{--bg:#111418;--card:#1a1e24;--text:#eef1f5;--muted:#9aa4b2;--line:#2d333c}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font:16px/1.5 Inter,system-ui,-apple-system,"Segoe UI",sans-serif}
.card{max-width:560px;margin:48px auto;background:var(--card);border:1px solid var(--line);border-radius:16px;padding:28px}
@media (max-width:600px){.card{margin:16px;padding:20px}}
.mark{width:48px;height:48px;border-radius:50%;background:var(--accent);color:#fff;display:grid;place-items:center;font-weight:800;font-size:24px;margin-bottom:12px}
h1{margin:0 0 6px;font-size:26px;letter-spacing:-.01em}p{color:var(--muted)}
textarea{width:100%;height:110px;font:13px/1.4 ui-monospace,monospace;padding:10px;border:1px solid var(--line);border-radius:10px;background:var(--bg);color:var(--text);resize:none;word-break:break-all}
button,input[type=email]{font:inherit;border-radius:10px;padding:11px 14px;border:1px solid var(--line)}
input[type=email]{width:100%;background:var(--bg);color:var(--text);margin:8px 0}
button{background:var(--accent);border-color:var(--accent);color:#fff;font-weight:600;cursor:pointer}
.ok{display:none;margin-top:14px;padding:12px 14px;border-radius:10px;background:color-mix(in srgb,var(--ok) 15%,transparent);color:var(--ok);font-weight:600}
ol{color:var(--muted);padding-left:20px}
</style></head><body><div class="card"><div class="mark">7</div>${body}</div></body></html>`,
    { status, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' } }
  );
}

function successPage(key, email) {
  return page(
    'You’re Pro — Image Number Helper',
    `<h1>You’re Pro. Thank you!</h1>
<p>If the extension is installed in this browser it unlocks by itself in a second. Otherwise paste this key into the extension (<b>Upgrade → Activate</b>).${email ? ` We also emailed it to <b>${esc(email)}</b>.` : ''}</p>
<textarea readonly id="k" data-inh-license="${esc(key)}">${esc(key)}</textarea>
<p><button id="c">Copy key</button></p>
<div class="ok" id="ok">✓ Pro unlocked in this browser. You can close this tab.</div>
<ol><li>Pin the extension (puzzle icon → pin).</li><li>Press <b>Alt+Shift+N</b> on any page.</li><li>Use <b>Copy report</b> and <b>Screenshot</b> in your next review.</li></ol>
<script>
document.getElementById('c').onclick=async()=>{await navigator.clipboard.writeText(document.getElementById('k').value);document.getElementById('c').textContent='Copied ✓'};
document.addEventListener('inh-activated',()=>{document.getElementById('ok').style.display='block'});
</script>`
  );
}

const recoverForm = (note = '') =>
  page(
    'Recover your key — Image Number Helper',
    `<h1>Lost your Pro key?</h1><p>Enter the email you used at checkout and we’ll send your key again.</p>
<form method="post"><input type="email" name="email" required placeholder="you@example.com" autocomplete="email"><button>Email my key</button></form>
${note ? `<p>${note}</p>` : ''}`
  );

// ---------- routes ----------
async function handleSuccess(url, env) {
  const id = url.searchParams.get('session_id') || '';
  if (!/^cs_(test|live)_[A-Za-z0-9]+$/.test(id)) return page('Not found', '<h1>Link not recognised</h1><p>Open the link from your Stripe receipt, or use “Lost your key?”.</p>', 404);
  const session = await getSession(env, id);
  if (!isOurPaidSession(session, env)) {
    return page('Payment pending', '<h1>Payment still processing</h1><p>Refresh this page in a minute. Your key will also arrive by email.</p>', 202);
  }
  const { key } = await licenseFor(env, session);
  return successPage(key, env.RESEND_API_KEY ? session.customer_details?.email : '');
}

async function handleWebhook(req, env) {
  const body = await req.text();
  const ok = await verifyStripeSignature(body, req.headers.get('Stripe-Signature'), env.STRIPE_WEBHOOK_SECRET);
  if (!ok) return new Response('bad signature', { status: 400 });
  const event = JSON.parse(body);
  if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
    const session = await getSession(env, event.data.object.id);
    if (isOurPaidSession(session, env)) {
      const { key, created } = await licenseFor(env, session);
      if (created || event.type === 'checkout.session.async_payment_succeeded') {
        await sendKeyEmail(env, session.customer_details?.email, [key]);
      }
    }
  }
  return new Response('ok');
}

function handleRecoverNoEmail(env) {
  const support = esc(env.SUPPORT_URL || 'https://github.com/smokealarmdoctor/image-number-helper/issues');
  return recoverForm(`Automatic key emails aren’t switched on yet. Please <a href="${support}">contact support</a> with the email you used at checkout and we’ll send your key.`);
}

async function handleRecover(req, env) {
  if (req.method !== 'POST') return recoverForm();
  const email = String((await req.formData()).get('email') || '').trim().toLowerCase();
  const generic = 'If that email bought Pro, the key is on its way. Check spam, or open an issue on GitHub if nothing arrives in 10 minutes.';
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return recoverForm('Please enter a valid email.');
  if (!env.RESEND_API_KEY) return handleRecoverNoEmail(env);
  const list = await stripe(env, 'GET', `/checkout/sessions?limit=20&status=complete&customer_details[email]=${encodeURIComponent(email)}&expand[]=data.payment_intent`);
  const keys = [];
  for (const s of list.data || []) if (isOurPaidSession(s, env)) keys.push((await licenseFor(env, s)).key);
  if (keys.length) await sendKeyEmail(env, email, [...new Set(keys)]);
  return recoverForm(generic); // same answer either way: no email enumeration
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    try {
      if (url.pathname === '/webhook' && req.method === 'POST') return await handleWebhook(req, env);
      if (url.pathname === '/success') return await handleSuccess(url, env);
      if (url.pathname === '/recover') return await handleRecover(req, env);
      if (url.pathname === '/health') return new Response('ok');
      return Response.redirect(env.SUPPORT_URL || 'https://github.com/smokealarmdoctor/image-number-helper', 302);
    } catch (err) {
      console.error(err);
      return page('Error', '<h1>Something went wrong</h1><p>Your payment is safe. Refresh in a minute or use “Lost your key?” in the extension.</p>', 500);
    }
  },
};
