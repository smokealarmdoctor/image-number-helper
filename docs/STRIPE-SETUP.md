# Stripe + license server: setup and go-live

## Live setup (done, November 2026)

| Piece | Where / ID |
|---|---|
| License server | Render, free plan: `image-number-helper-license-hecb` → https://image-number-helper-license-hecb.onrender.com (blueprint `render.yaml`, auto-deploys from the release branch) |
| Signing key | Derived on the server from `LICENSE_SEED`, a secret Render generated. Nobody, including Claude, has seen it. The public half is at `/pubkey` and embedded in `extension/src/config.js`. |
| Product | `prod_VbDqms5BZsvYmW` "Image Number Helper Pro", tax code `txcd_10202000` (Downloadable Software – personal use) |
| Price | `price_1Ua1OzLuxanaOHjS1TMgrHkk`: $2.99 one-time |
| Payment Link | `plink_1Ua1PdLuxanaOHjSVNQUbm4B` → https://buy.stripe.com/aFafZifwx32p0Ow8QCbsc01. **Managed Payments on**, so Stripe is merchant of record and handles sales tax/VAT. After payment it redirects to `/success`. |

**Still needed:** a restricted Stripe key in Render's `STRIPE_SECRET_KEY` (see below). Until it's set, the thank-you page can't confirm payments.

### Adding the Stripe key (about 3 minutes)
1. Stripe Dashboard (live mode) → Developers → API keys → **Create restricted key**. Name it "image-number-helper license server" and set:
   - **Checkout Sessions: Read**
   - **PaymentIntents: Write**
   - everything else: None
2. Copy the `rk_live_…` key.
3. Render Dashboard → `image-number-helper-license-hecb` → **Environment** → `STRIPE_SECRET_KEY` → paste → **Save, rebuild and deploy**.

### Optional later
- **Key emails and lost-key recovery:** add `RESEND_API_KEY` and `FROM_EMAIL` in Render, then add a Stripe webhook to `/webhook` and its `STRIPE_WEBHOOK_SECRET`. Until then, the "Lost your key?" page points buyers to support.
- **Render Starter ($7/mo):** stops the free plan sleeping, which otherwise adds a ~30–60 s wait on the thank-you page after a quiet spell.

---

# Reference: generic setup (Cloudflare Worker path)

Everything is automated after these steps. Expect about 20 minutes the first time.

## Already done (Stripe **test mode**, account "The Smoke Alarm Doctor")

| Object | ID |
|---|---|
| Product "Image Number Helper Pro" | `prod_VbBascool69IWy` |
| Price $2.99 one-time (`inh_pro_lifetime_usd_299`), the product's default | `price_1UZzOHLuxanaOHjS0i5XN4Sh` |
| Payment Link | `plink_1UZzOPLuxanaOHjSVl54elca` → https://buy.stripe.com/test_bJe4gAgAB46t8gYff0bsc02 |
| Old $4.99 price and link (deactivated; the old link now says the price moved) | `price_1UZzDGLuxanaOHjShPPc4FfV` / `plink_1UZzDPLuxanaOHjSOv2ew2z9` |
| Coupon "Launch 50%" + promo code `LAUNCH50` (100 uses) | `GX1KLwCH` / `promo_1UZzDdLuxanaOHjSKeoYPbAI` |

The test Payment Link currently shows Stripe's hosted confirmation page. Step 3 switches it to redirect to your Worker.

## 1. Generate the signing keys (once, ever)

```bash
npm run keys
```

* This writes the public key into `extension/src/config.js` (commit this).
* It writes the private key to `license-server/license.private.jwk.json` (gitignored). **Back it up in a password manager.** If you lose it, you can't issue keys that existing installs accept.

## 2. Deploy the Worker (Cloudflare free plan)

```bash
cd license-server
npx wrangler login
npx wrangler secret put LICENSE_PRIVATE_JWK < license.private.jwk.json
npx wrangler secret put STRIPE_SECRET_KEY        # sk_test_… for now
npx wrangler secret put RESEND_API_KEY           # optional, enables emailing keys
npx wrangler deploy                              # prints https://image-number-helper-license.<you>.workers.dev
```

Set `FROM_EMAIL` in `wrangler.toml` to an address on a domain you've verified in Resend.

## 3. Wire Stripe to the Worker

```bash
STRIPE_SECRET_KEY=sk_test_… npm run stripe:setup -- --worker-url https://image-number-helper-license.<you>.workers.dev
```

This reuses the product, price and link above. It also:

* sets the link to redirect to `/success?session_id={CHECKOUT_SESSION_ID}`
* creates the webhook endpoint and prints `whsec_…`. Run `npx wrangler secret put STRIPE_WEBHOOK_SECRET` with that value.
* writes `CHECKOUT_URL` and `LICENSE_ORIGIN` into `extension/src/config.js`

## 4. Test a purchase

Load `extension/` unpacked (chrome://extensions → Developer mode → Load unpacked). Click **Upgrade → Get Pro** and pay with card `4242 4242 4242 4242`. The success page should say "✓ Pro unlocked in this browser" and the popup should show **Pro**.

## 5. Go live

1. **Decide on tax first.** Options: (a) enable **Stripe Tax** and add registrations where you're required to collect, or (b) turn on **Managed Payments** on the Payment Link, so Stripe acts as merchant of record and handles VAT/GST worldwide for digital goods. The scripts don't set a tax code, so pick one in the Dashboard.
2. Run step 3 again with `sk_live_…`. It creates the live product, price, link, webhook and promo code.
3. `npx wrangler secret put STRIPE_SECRET_KEY` with the live key, then do the same for `STRIPE_WEBHOOK_SECRET` with the new live `whsec_`.
4. `npm run package` builds `dist/image-number-helper-2.0.0.zip` for the Chrome Web Store. It refuses to build while placeholders remain.

**Tip:** use a **restricted key** for the Worker with *Checkout Sessions: read* and *PaymentIntents: write* only.

## Existing PayPal customers and comp keys

v1 keys use the old format. Issue each buyer a new key and email it:

```bash
node scripts/issue-key.mjs buyer@example.com --note paypal
```
