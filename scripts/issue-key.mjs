// Manually issue a Pro key (migrating PayPal buyers, comps, giveaways).
//   node scripts/issue-key.mjs buyer@example.com [--plan pro] [--note paypal]
import { readFileSync } from 'node:fs';
import { signLicense } from '../extension/src/license.js';

const [email, ...rest] = process.argv.slice(2);
if (!email || !email.includes('@')) {
  console.error('Usage: node scripts/issue-key.mjs <email> [--plan pro] [--note text]');
  process.exit(1);
}
const opt = (n, d) => (rest.includes(`--${n}`) ? rest[rest.indexOf(`--${n}`) + 1] : d);
const priv = JSON.parse(readFileSync(new URL('../license-server/license.private.jwk.json', import.meta.url), 'utf8'));
const key = await signLicense(
  { v: 1, plan: opt('plan', 'pro'), email: email.trim().toLowerCase(), sid: opt('note', 'manual'), iat: Math.floor(Date.now() / 1000) },
  priv
);
console.log(key);
