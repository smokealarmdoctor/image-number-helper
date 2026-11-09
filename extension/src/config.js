// Deployment configuration. `npm run keys` and `npm run stripe:setup` rewrite
// the marked values; everything else is safe to edit by hand.

// Live Stripe Payment Link for Pro (Managed Payments: Stripe is merchant of record).
export const CHECKOUT_URL = 'https://buy.stripe.com/aFafZifwx32p0Ow8QCbsc01'; // @checkout-url

// Origin of the license Worker (license-server/). Its /success page hands the
// key to the extension automatically; /recover emails a lost key.
export const LICENSE_ORIGIN = 'https://image-number-helper-license-hecb.onrender.com'; // @license-origin

// ECDSA P-256 public keys that verify license keys offline. `npm run keys`
// appends one; the matching private key lives only in the Worker secret.
// Keep old entries: every key ever sold must keep verifying after a rotation.
export const LICENSE_PUBLIC_JWK = [{"kty": "EC", "crv": "P-256", "x": "1rbLlMoEhGjxEjloSHIQKJfWKrTIfSXv4zSKs-wPPzU", "y": "9l8OpNQAZNMxIeAGapHViW92vp2ROaUFIDa3-M0uWdA"}]; // @license-public-jwk

export const PRICE_LABEL = '$2.99';
export const FREE_LIMIT = 8;
