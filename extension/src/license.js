// License keys: "INH1.<base64url(JSON payload)>.<base64url(ECDSA P-256 signature)>"
// The payload is { v:1, plan:'pro', email, sid, iat }. Verification is fully
// offline: the extension ships the public key, the Worker keeps the private key.
// Shared by the extension (background/popup) and the license Worker.

const PREFIX = 'INH1';
const ALG = { name: 'ECDSA', namedCurve: 'P-256' };
const SIGN = { name: 'ECDSA', hash: 'SHA-256' };

const enc = new TextEncoder();
const dec = new TextDecoder();

export function b64urlEncode(bytes) {
  let s = '';
  for (const b of new Uint8Array(bytes)) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function b64urlDecode(str) {
  const s = str.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(s + '='.repeat((4 - (s.length % 4)) % 4));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

/** Strip whitespace/newlines people pick up when copying from email. */
export function normalizeKey(raw) {
  return String(raw || '').replace(/\s+/g, '');
}

export async function signLicense(payload, privateJwk) {
  const key = await crypto.subtle.importKey('jwk', privateJwk, ALG, false, ['sign']);
  const body = b64urlEncode(enc.encode(JSON.stringify(payload)));
  const sig = await crypto.subtle.sign(SIGN, key, enc.encode(`${PREFIX}.${body}`));
  return `${PREFIX}.${body}.${b64urlEncode(sig)}`;
}

/** Returns the payload when the key is genuine, otherwise null. */
export async function verifyLicense(raw, publicJwk) {
  if (!publicJwk) return null;
  const key = normalizeKey(raw);
  const parts = key.split('.');
  if (parts.length !== 3 || parts[0] !== PREFIX) return null;
  try {
    const pub = await crypto.subtle.importKey('jwk', publicJwk, ALG, false, ['verify']);
    const ok = await crypto.subtle.verify(
      SIGN,
      pub,
      b64urlDecode(parts[2]),
      enc.encode(`${PREFIX}.${parts[1]}`)
    );
    if (!ok) return null;
    const payload = JSON.parse(dec.decode(b64urlDecode(parts[1])));
    return payload && payload.v === 1 && payload.plan ? payload : null;
  } catch {
    return null;
  }
}
