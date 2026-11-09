// One-command Stripe setup for Image Number Helper Pro. Idempotent — safe to re-run.
//
//   STRIPE_SECRET_KEY=sk_test_… node scripts/stripe-setup.mjs --worker-url https://image-number-helper-license.<you>.workers.dev
//   STRIPE_SECRET_KEY=sk_live_… node scripts/stripe-setup.mjs --worker-url … --price 299
//
// Creates (or reuses) in that Stripe mode:
//   • Product "Image Number Helper Pro"  (metadata.app = image-number-helper)
//   • One-time price, lookup_key inh_pro_lifetime_<currency>_<amount>
//     (Stripe Tax is NOT configured — decide on tax / Managed Payments before going live)
//   • Payment Link → redirects to <worker>/success?session_id={CHECKOUT_SESSION_ID}
//     with promotion codes enabled and metadata { app, plan } copied to every session
//   • Webhook endpoint <worker>/webhook for checkout.session.completed /
//     async_payment_succeeded (prints the whsec_ secret the first time)
//   • Promotion code LAUNCH50 (50% off, first 100 uses) unless --no-promo
// …then writes CHECKOUT_URL and LICENSE_ORIGIN into extension/src/config.js.
import { readFileSync, writeFileSync } from 'node:fs';

const args = process.argv.slice(2);
const arg = (name, dflt) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : dflt;
};
const KEY = process.env.STRIPE_SECRET_KEY;
const WORKER = (arg('worker-url') || '').replace(/\/$/, '');
const AMOUNT = Number(arg('price', '299'));
const CURRENCY = arg('currency', 'usd');
const APP = 'image-number-helper';
if (!KEY || !WORKER) {
  console.error('Usage: STRIPE_SECRET_KEY=sk_… node scripts/stripe-setup.mjs --worker-url https://… [--price 299] [--currency usd] [--no-promo]');
  process.exit(1);
}
const live = KEY.startsWith('sk_live_') || KEY.startsWith('rk_live_');

function form(obj, prefix = '', out = new URLSearchParams()) {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}[${k}]` : k;
    if (Array.isArray(v)) v.forEach((item, i) => (item && typeof item === 'object' ? form(item, `${key}[${i}]`, out) : out.append(`${key}[${i}]`, item)));
    else if (v && typeof v === 'object') form(v, key, out);
    else if (v !== undefined) out.append(key, String(v));
  }
  return out;
}
async function api(method, path, body) {
  const res = await fetch(`https://api.stripe.com/v1${path}`, {
    method,
    headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body ? form(body) : undefined,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`${method} ${path}: ${json.error?.message}`);
  return json;
}

console.log(`Stripe ${live ? 'LIVE' : 'test'} mode`);

// Product
const found = await api('GET', `/products/search?query=${encodeURIComponent(`metadata['app']:'${APP}' AND active:'true'`)}`);
const product =
  found.data[0] ||
  (await api('POST', '/products', {
    name: 'Image Number Helper Pro',
    description: 'Lifetime Pro license: unlimited image numbers, meeting report, numbered screenshots, colors and positions.',
    metadata: { app: APP, plan: 'pro' },
  }));
console.log(`✓ product ${product.id}`);

// Price
const lookup = `inh_pro_lifetime_${CURRENCY}_${AMOUNT}`;
const prices = await api('GET', `/prices?lookup_keys[]=${lookup}&active=true`);
const price =
  prices.data[0] ||
  (await api('POST', '/prices', {
    product: product.id,
    unit_amount: AMOUNT,
    currency: CURRENCY,
    lookup_key: lookup,
    metadata: { app: APP, plan: 'pro' },
  }));
console.log(`✓ price ${price.id} (${(AMOUNT / 100).toFixed(2)} ${CURRENCY.toUpperCase()})`);

// Payment link
const redirect = `${WORKER}/success?session_id={CHECKOUT_SESSION_ID}`;
const links = await api('GET', '/payment_links?active=true&limit=100');
let link = links.data.find((l) => l.metadata?.app === APP && l.metadata?.price === price.id);
const linkBody = {
  after_completion: { type: 'redirect', redirect: { url: redirect } },
  allow_promotion_codes: true,
  metadata: { app: APP, plan: 'pro', price: price.id },
  customer_creation: 'always',
  submit_type: 'pay',
};
if (link) link = await api('POST', `/payment_links/${link.id}`, { after_completion: linkBody.after_completion, allow_promotion_codes: true });
else link = await api('POST', '/payment_links', { line_items: [{ price: price.id, quantity: 1 }], ...linkBody });
console.log(`✓ payment link ${link.url}`);

// Webhook
const hooks = await api('GET', '/webhook_endpoints?limit=100');
const hookUrl = `${WORKER}/webhook`;
const events = ['checkout.session.completed', 'checkout.session.async_payment_succeeded'];
let hook = hooks.data.find((h) => h.url === hookUrl);
if (!hook) {
  hook = await api('POST', '/webhook_endpoints', { url: hookUrl, enabled_events: events, description: 'Image Number Helper license keys' });
  console.log(`✓ webhook ${hook.id}\n\n  STRIPE_WEBHOOK_SECRET=${hook.secret}\n  → cd license-server && npx wrangler secret put STRIPE_WEBHOOK_SECRET\n`);
} else console.log(`✓ webhook ${hook.id} (exists — secret unchanged)`);

// Launch promo
if (!args.includes('--no-promo')) {
  const promos = await api('GET', '/promotion_codes?code=LAUNCH50&limit=1');
  if (!promos.data.length) {
    const coupon = await api('POST', '/coupons', { percent_off: 50, duration: 'once', name: 'Launch 50%', applies_to: { products: [product.id] } });
    // Newer API versions nest the coupon under `promotion`; older ones take `coupon`.
    await api('POST', '/promotion_codes', { promotion: { type: 'coupon', coupon: coupon.id }, code: 'LAUNCH50', max_redemptions: 100 }).catch(() =>
      api('POST', '/promotion_codes', { coupon: coupon.id, code: 'LAUNCH50', max_redemptions: 100 })
    );
    console.log('✓ promo code LAUNCH50');
  } else console.log('✓ promo code LAUNCH50 (exists)');
}

// Extension config
const CONFIG = new URL('../extension/src/config.js', import.meta.url);
const cfg = readFileSync(CONFIG, 'utf8')
  .replace(/export const CHECKOUT_URL = .*; \/\/ @checkout-url/, `export const CHECKOUT_URL = '${link.url}'; // @checkout-url`)
  .replace(/export const LICENSE_ORIGIN = .*; \/\/ @license-origin/, `export const LICENSE_ORIGIN = '${new URL(WORKER).origin}'; // @license-origin`)
  .replace(/export const PRICE_LABEL = .*;/, `export const PRICE_LABEL = '${new Intl.NumberFormat('en-US', { style: 'currency', currency: CURRENCY.toUpperCase() }).format(AMOUNT / 100)}';`);
writeFileSync(CONFIG, cfg);
console.log('✓ extension/src/config.js updated');
