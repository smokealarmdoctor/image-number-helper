// Uploads dist/image-number-helper-<version>.zip to the Chrome Web Store.
// Uploads as a DRAFT by default; add --publish to submit it for review.
//
//   CWS_EXTENSION_ID=… CWS_CLIENT_ID=… CWS_CLIENT_SECRET=… CWS_REFRESH_TOKEN=… \
//     node scripts/publish-cws.mjs [--publish] [--trusted-testers]
//
// Credentials: Google Cloud project → enable "Chrome Web Store API" → OAuth client
// (Desktop app) → get a refresh token for scope
// https://www.googleapis.com/auth/chromewebstore (see docs/STORE-LISTING.md).
import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const { CWS_EXTENSION_ID: ID, CWS_CLIENT_ID, CWS_CLIENT_SECRET, CWS_REFRESH_TOKEN } = process.env;
if (!ID || !CWS_CLIENT_ID || !CWS_CLIENT_SECRET || !CWS_REFRESH_TOKEN) {
  console.error('Set CWS_EXTENSION_ID, CWS_CLIENT_ID, CWS_CLIENT_SECRET and CWS_REFRESH_TOKEN.');
  process.exit(1);
}

// Build (refuses while license keys / Stripe live config are placeholders).
execFileSync('node', ['scripts/package.mjs'], { stdio: 'inherit' });
const { version } = JSON.parse(readFileSync('extension/manifest.json', 'utf8'));
const zip = `dist/image-number-helper-${version}.zip`;
if (!existsSync(zip)) throw new Error(`${zip} missing`);
if (/test_/.test(readFileSync('extension/src/config.js', 'utf8'))) {
  console.error('CHECKOUT_URL is a Stripe TEST link — run the live stripe:setup first.');
  process.exit(1);
}

const tok = await fetch('https://oauth2.googleapis.com/token', {
  method: 'POST',
  body: new URLSearchParams({ client_id: CWS_CLIENT_ID, client_secret: CWS_CLIENT_SECRET, refresh_token: CWS_REFRESH_TOKEN, grant_type: 'refresh_token' }),
}).then((r) => r.json());
if (!tok.access_token) throw new Error(`OAuth failed: ${JSON.stringify(tok)}`);
const auth = { Authorization: `Bearer ${tok.access_token}`, 'x-goog-api-version': '2' };

const up = await fetch(`https://www.googleapis.com/upload/chromewebstore/v1.1/items/${ID}`, {
  method: 'PUT',
  headers: auth,
  body: readFileSync(zip),
}).then((r) => r.json());
console.log('upload:', up.uploadState, up.itemError ? JSON.stringify(up.itemError) : '');
if (up.uploadState !== 'SUCCESS') process.exit(1);

if (process.argv.includes('--publish')) {
  const target = process.argv.includes('--trusted-testers') ? '?publishTarget=trustedTesters' : '';
  const pub = await fetch(`https://www.googleapis.com/chromewebstore/v1.1/items/${ID}/publish${target}`, { method: 'POST', headers: auth }).then((r) => r.json());
  console.log('publish:', JSON.stringify(pub.status), pub.statusDetail || '');
} else {
  console.log(`Draft v${version} uploaded. Review the listing in the Developer Dashboard, then rerun with --publish.`);
}
