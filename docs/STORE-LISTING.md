# Chrome Web Store: v2 release checklist and listing copy

## Release blockers (do these first, in order)

1. **Keep existing PayPal buyers on Pro.** Every v1 install auto-updates to v2, and v2 doesn't recognise the old Pro unlock. Without a migration, paying customers silently drop to Free. Send the currently published v1 package or source (Developer Dashboard → Package, or the installed extension folder) so the v2 update can carry the old unlock over. As a fallback, email each PayPal buyer a new key with `node scripts/issue-key.mjs`.
2. `npm run keys`: generate license signing keys and back up the private key.
3. Deploy the license Worker, then run `npm run stripe:setup` with the **live** Stripe key (`docs/STRIPE-SETUP.md`). Decide on tax / Managed Payments first.
4. Make one real $2.99 purchase and refund it, to confirm keys unlock end to end.
5. Upload the video to YouTube (unlisted is fine). The store's promo-video field takes a YouTube URL, not an MP4.
6. `npm run package`. It must build with no warnings.

## Uploading

Easiest is manual: Developer Dashboard → your item → **Package → Upload new package** → `dist/image-number-helper-2.0.0.zip`.

Or automated: `node scripts/publish-cws.mjs` uploads a draft, and `--publish` submits it for review. It needs Chrome Web Store API OAuth credentials:
- **Extension ID:** the 32-letter ID in the Dashboard.
- **Client ID and secret:** in a Google Cloud project, enable the *Chrome Web Store API* and create an OAuth client of type *Desktop app*.
- **Refresh token:** authorise once for the scope `https://www.googleapis.com/auth/chromewebstore`.

Supply these four values as environment variables. Never commit them.

## Listing fields

**Name:** Image Number Helper – Number & Label Images on Any Page

**Summary (≤132 chars):** Number every image on a page. Say “image 7” in reviews, QA and meetings instead of “the one on the left.”

**Category:** Workflow & Planning (alternative: Developer Tools)

**Description:**

> Say “image 7” instead of “the one on the left.”
>
> Image Number Helper puts a clear number on every image on any web page, so design reviews, QA passes, client calls and image-search comparisons all point at the same thing.
>
> FREE
> • Number the first 8 images on any page: press Alt+Shift+N or click the switch
> • Click a number to copy “Image 7”, or right-click any image → Copy image number
> • Jump to any image by number. The page scrolls there and spotlights it
> • Numbers stay put while lazy images load; tiny icons are skipped
> • Always-on for the sites you choose
>
> PRO — $2.99 once, no subscription
> • Unlimited numbers
> • Meeting report: alt text, size and file for every image (Markdown, text or CSV), with missing alt text flagged
> • Numbered screenshots, copied and saved in one click
> • 6 colors, 5 positions, custom start number
>
> PRIVATE BY DESIGN
> No account, no analytics, no tracking. Your license is checked offline on your device.

**Screenshots (5, in this order):** `marketing/store/01-say-image-7.png`, `07-image-search.png`, `02-jump-to-any-image.png`, `03-meeting-report.png`, `06-free-and-pro.png`

**Small promo tile:** `marketing/store/tile-small-440x280.png` · **Marquee:** `marketing/store/marquee-1400x560.png`

**Privacy policy URL:** https://github.com/smokealarmdoctor/image-number-helper/blob/main/PRIVACY.md (merge this branch to `main` first so it shows the v2 policy)

## Privacy tab (the reviewer reads this)

**Single purpose:** Overlay numbered labels on images in the current web page so people can refer to them by number.

| Permission | Justification |
|---|---|
| storage | Save the user’s settings and license key. |
| activeTab | Act on the current tab when the user opens the popup, and capture a numbered screenshot on request. |
| contextMenus | “Copy image number” and “Show / hide image numbers” right-click items. |
| scripting | Add the numbering script to tabs that were open before install or update. |
| Host permissions (http/https) | Read image positions on pages the user views to draw numbers over them; works on any site the user chooses. |
| Remote code | No. All code ships in the package. |

**Data usage:** Collects none of the listed categories, except payment and contact info (email) entered at Stripe checkout for Pro. That data isn't sold, isn't used for unrelated purposes, and isn't used for creditworthiness.
