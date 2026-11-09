// Generates the ECDSA P-256 key pair used to sign Pro license keys.
//  - public key  -> written into extension/src/config.js (ships in the extension)
//  - private key -> license-server/license.private.jwk.json (gitignored) +
//                   license-server/.dev.vars for `wrangler dev`
// Upload the private key to the Worker:  npx wrangler secret put LICENSE_PRIVATE_JWK < license-server/license.private.jwk.json
// Run once. Re-running invalidates every key you've already sold, so the
// script refuses if a public key is already configured (pass --force to override).
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const CONFIG = new URL('../extension/src/config.js', import.meta.url);
const cfg = readFileSync(CONFIG, 'utf8');
if (!/LICENSE_PUBLIC_JWK = null;/.test(cfg) && !process.argv.includes('--force')) {
  console.error('A public key is already configured. Re-generating would invalidate sold licenses. Use --force if you really mean it.');
  process.exit(1);
}

const pair = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
const pub = await crypto.subtle.exportKey('jwk', pair.publicKey);
const priv = await crypto.subtle.exportKey('jwk', pair.privateKey);
const pubLite = { kty: pub.kty, crv: pub.crv, x: pub.x, y: pub.y };

writeFileSync(
  CONFIG,
  cfg.replace(/export const LICENSE_PUBLIC_JWK = .*; \/\/ @license-public-jwk/, `export const LICENSE_PUBLIC_JWK = ${JSON.stringify(pubLite)}; // @license-public-jwk`)
);
const privPath = new URL('../license-server/license.private.jwk.json', import.meta.url);
writeFileSync(privPath, JSON.stringify(priv));
const devVars = new URL('../license-server/.dev.vars', import.meta.url);
const existing = existsSync(devVars) ? readFileSync(devVars, 'utf8').replace(/^LICENSE_PRIVATE_JWK=.*\n?/m, '') : '';
writeFileSync(devVars, `${existing}LICENSE_PRIVATE_JWK=${JSON.stringify(priv)}\n`);

console.log('✓ Public key written to extension/src/config.js');
console.log('✓ Private key written to license-server/license.private.jwk.json (gitignored — back it up in a password manager)');
console.log('\nNext: cd license-server && npx wrangler secret put LICENSE_PRIVATE_JWK < license.private.jwk.json');
