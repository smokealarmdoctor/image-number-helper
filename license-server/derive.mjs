// Deterministically derives the ECDSA P-256 license signing key from a secret
// seed (Render's generated LICENSE_SEED), so the private key is never copied.
import { createECDH, hkdfSync } from 'node:crypto';

const N = BigInt('0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551'); // P-256 order
const b64u = (buf) => Buffer.from(buf).toString('base64url');

export function deriveKeys(seed) {
  const okm = Buffer.from(hkdfSync('sha256', seed, 'image-number-helper', 'license-signing-key-v1', 48));
  const d = Buffer.from(((BigInt('0x' + okm.toString('hex')) % (N - 1n)) + 1n).toString(16).padStart(64, '0'), 'hex');
  const ecdh = createECDH('prime256v1');
  ecdh.setPrivateKey(d);
  const pub = ecdh.getPublicKey(); // 0x04 || X || Y
  const publicJwk = { kty: 'EC', crv: 'P-256', x: b64u(pub.subarray(1, 33)), y: b64u(pub.subarray(33, 65)) };
  return { publicJwk, privateJwk: { ...publicJwk, d: b64u(d), ext: true, key_ops: ['sign'] } };
}
