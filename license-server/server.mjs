// Node entry point for hosts other than Cloudflare (e.g. Render): wraps the
// Worker's fetch handler in a plain HTTP server. Config comes from env vars:
//   STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, LICENSE_PRIVATE_JWK,
//   RESEND_API_KEY (optional), FROM_EMAIL, SUPPORT_URL, APP_ID, PORT
import http from 'node:http';
import { deriveKeys } from './derive.mjs';
import worker from './src/index.js';

const env = { ...process.env };
const port = Number(env.PORT || 8787);

// The signing key can be derived from LICENSE_SEED (a random secret Render
// generates and keeps), so the private key never has to be copied anywhere.
// Only the public half is exposed, at /pubkey, for embedding in the extension.
let publicJwk = null;
if (!env.LICENSE_PRIVATE_JWK && env.LICENSE_SEED) {
  const k = deriveKeys(env.LICENSE_SEED);
  env.LICENSE_PRIVATE_JWK = JSON.stringify(k.privateJwk);
  publicJwk = k.publicJwk;
} else if (env.LICENSE_PRIVATE_JWK) {
  const { kty, crv, x, y } = JSON.parse(env.LICENSE_PRIVATE_JWK);
  publicJwk = { kty, crv, x, y };
}

http
  .createServer(async (req, res) => {
    try {
      const chunks = [];
      for await (const c of req) chunks.push(c);
      const body = chunks.length ? Buffer.concat(chunks) : undefined;
      if (req.url === '/pubkey') {
        res.writeHead(publicJwk ? 200 : 503, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
        return res.end(JSON.stringify(publicJwk));
      }
      const proto = req.headers['x-forwarded-proto'] || 'http';
      const url = `${proto}://${req.headers.host}${req.url}`;
      const request = new Request(url, {
        method: req.method,
        headers: Object.entries(req.headers).flatMap(([k, v]) => (Array.isArray(v) ? v.map((x) => [k, x]) : [[k, v]])),
        body: req.method === 'GET' || req.method === 'HEAD' ? undefined : body,
      });
      const response = await worker.fetch(request, env);
      res.writeHead(response.status, Object.fromEntries(response.headers));
      res.end(Buffer.from(await response.arrayBuffer()));
    } catch (err) {
      console.error(err);
      res.writeHead(500).end('error');
    }
  })
  .listen(port, () => console.log(`license server on :${port}`));
