// Deployment configuration. `npm run keys` and `npm run stripe:setup` rewrite
// the marked values; everything else is safe to edit by hand.

// Stripe Payment Link for Pro (test-mode link until you run the live setup).
export const CHECKOUT_URL = 'https://buy.stripe.com/test_bJe4gAgAB46t8gYff0bsc02'; // @checkout-url

// Origin of the license Worker (license-server/). Its /success page hands the
// key to the extension automatically; /recover emails a lost key.
export const LICENSE_ORIGIN = 'https://image-number-helper-license.example.workers.dev'; // @license-origin

// ECDSA P-256 public keys that verify license keys offline. `npm run keys`
// appends one; the matching private key lives only in the Worker secret.
// Keep old entries: every key ever sold must keep verifying after a rotation.
export const LICENSE_PUBLIC_JWK = [{"kty":"EC","crv":"P-256","x":"yL2q67po8PHBfPHEW1Iq7opRGlf94vHs1aeGCVlbBEs","y":"XrHjjunzZCHqu49m3iUSl6RCEum6ejzFOUe2rRZFTYE"}]; // @license-public-jwk

export const PRICE_LABEL = '$2.99';
export const FREE_LIMIT = 8;
