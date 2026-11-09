# Image Number Helper — review & growth plan

_November 2026_

## 1. Review: where v1 stood

| Area | v1 (README/PRIVACY only) | Problem |
|---|---|---|
| Source | Not in the repo | Nothing to review, test or ship from version control. **v2 is now rebuilt here.** |
| Payment | PayPal → key pasted by hand | Seller had to issue keys manually. Buyers waited. No promo codes, no Apple Pay or Google Pay. |
| Free tier | First 8 images | Good hook. But nothing told users what they were missing. |
| Discoverability | Bare listing + privacy policy | No screenshots, video, onboarding or keyword strategy. |
| Trust | Privacy policy ✓ | Good start. No refund statement and no support path except GitHub issues. |

## 2. UI / UX improvements

**Shipped in v2** (all in `extension/`):

1. **One-key toggle:** `Alt+Shift+N`, plus right-click → "Show / hide image numbers".
2. **Click a badge to copy "Image 7"**, and right-click any image → "Copy image number". The reference goes straight into chat, tickets and design comments.
3. **Go to image #**: type a number, the page scrolls there and spotlights the image. This is the "can we look at 11 again?" moment from real meetings.
4. **Stable numbers:** lazy-loaded images get the next number instead of shifting everyone else. A **Renumber** button resets to top-to-bottom order.
5. **Badges never break the page.** They live in a closed shadow-DOM overlay, ignore page CSS, don't block clicks underneath, and clamp to the visible part of half-scrolled images.
6. **Skip tiny images** (icons, tracking pixels): default 48 px, adjustable.
7. **"Always number on this site"**, per host, for daily QA targets.
8. **Toolbar badge count**, plus a popup "13 images numbered" status.
9. **Upsell at the right moment:** a "+5 more images · Unlock Pro" chip on the page, and a "Showing 8 of 13" meter in the popup. Pro features show a PRO tag and open the upgrade sheet with context ("The meeting report is a Pro feature").
10. **Onboarding page** on install with a live demo gallery. Users learn the shortcut in 10 seconds.
11. **Dark mode** popup. Accessible focus rings, ARIA labels, and keyboard-only operation throughout.
12. **Numbered screenshots (Pro):** one click copies a PNG to the clipboard and also saves it.

**Next (ranked by impact ÷ effort):**

| # | Idea | Why |
|---|---|---|
| 1 | Number **CSS background images, `<video>`, `<canvas>`, SVG** (Pro) | Hero banners are often backgrounds, and that's the #1 "it missed one" complaint category. |
| 2 | **Iframes / all frames** (opt-in) | Ad previews, CMS editors and email previews live in iframes. |
| 3 | **Notes per number** → report column | Turns the report into a review checklist ("7: crop tighter"). |
| 4 | **Shareable review link**: numbers + notes as a URL hash | Lets the other person see the same numbers without the extension. This is also a growth loop (see §4). |
| 5 | **Full-page numbered screenshot** (scroll-stitch) | Better than visible-area only for long pages. |
| 6 | **Alt-text audit mode**: highlight images with no alt or with "image.png"-style alt | Accessibility/SEO buyers will pay for this on its own. |
| 7 | **Localized UI** (es, de, fr, pt-BR, ja) | Store ranking is per locale. Cheap to add. |
| 8 | **Side panel mode** (`chrome.sidePanel`) | Keeps the list and jump box open during a meeting. |

## 3. Making more money

**Price: $2.99 lifetime** (lowered from $4.99, November 2026).

1. **Why $2.99.**
   - **Impulse price:** it's under the price of a coffee, so a buyer doesn't stop to think or ask a manager. Small one-job extensions sell best between $1.99 and $3.99.
   - **Fees still reasonable:** standard US card fees (2.9% + 30¢) take about 39¢, so you keep about **$2.60 (87%)**. At $1.99 you'd keep about $1.63 (82%), and at $0.99 only about 66¢ (67%). Below $2.99 the fixed 30¢ starts eating the sale.
   - **Room for a team plan:** a cheap single license makes a 5-seat team license at $9.99–14.99 look like a deal.
   - **Revisit after 200 sales:** if more than ~3% of weekly users buy, demand is strong and you can test $3.99.
   - **Launch code:** LAUNCH50 now gives $1.50. Fees leave about $1.16, which is fine for a launch day but not long-term.
2. **Team license, $9.99–14.99 lifetime for 5 seats.** Same Payment Link flow with a quantity field. The Worker signs `plan: "team", seats: 5` and emails five keys. QA teams and agencies expense this easily.
3. **"Pro + future features" bundle vs. "Pro 1.x".** Keep lifetime, but reserve AI/compute features for a later subscription.
4. **AI add-on (subscription, ~$4/mo):** auto-describe images and generate alt text for the report, using a vision model via the Worker. This is the only feature with real running cost, so it's the only one that should be recurring.
5. **Stripe extras worth turning on:** Apple Pay / Google Pay / Link (zero code; already available on Payment Links), Adaptive Pricing (local currencies), and **Managed Payments** (Stripe acts as merchant of record and handles global VAT/GST). Decide on tax before going live; see `docs/STRIPE-SETUP.md`.
6. **Recover abandoned checkouts:** enable "Recover abandoned carts" on the Payment Link (Stripe emails a reminder when the buyer consented to promotional emails).
7. **Sponsorships / affiliate:** a one-line "Made by Smoke Alarm Doctor" link on the welcome page cross-promotes your main business at no cost.

## 4. Automated Pro code setup (built)

```
Popup "Get Pro" ─▶ Stripe Payment Link (metadata app=image-number-helper)
                     │ paid
                     ▼
     Worker /success?session_id=…  ── verifies session with Stripe API
        │  signs INH1 key (ECDSA P-256), stores it on PaymentIntent metadata (idempotent)
        │  page carries data-inh-license → extension content script → background
        │  verifies signature + origin → Pro unlocks with zero copy/paste
        ▼
     Worker /webhook (checkout.session.completed) → same key → emails buyer (Resend)
     Worker /recover  → finds paid sessions by email → re-sends keys (no enumeration)
```

* **Offline verification:** the extension ships only the public key, so there's no license server call at runtime, no tracking, and no "server is down" support tickets.
* **Idempotent:** reloading the success page or a webhook retry returns the same key.
* **Zero manual work:** a sale needs nothing from you.
* Tests: `npm test` (7 tests: signature forgery, webhook signature, unpaid sessions, idempotency, recovery).

## 5. Getting more exposure

**Chrome Web Store SEO (biggest lever):**
* Title: **"Image Number Helper – Number & Label Images on Any Page"**. The store weights the title heavily, so include "number" and "label".
* First line of the description should match search intent: "Number every image on a webpage for design reviews, QA, and meetings."
* Use all 5 screenshots plus the promo video (`marketing/store/`, `marketing/video/`). Listings with video convert noticeably better.
* Small tile and marquee are ready, so you can request a **featured** placement once ratings are in.
* Ask for a rating at the moment of success: after the 3rd session where the user copies a number or a report, show a one-line "Enjoying it? ★ Rate" link in the popup. Never during first use.
* Localize the listing (es, pt-BR, de, fr, ja).

**Channels:**

| Channel | Play |
|---|---|
| Product Hunt | Launch with the video and the LAUNCH50 code. Aim for Tuesday–Thursday. |
| Reddit | r/webdev, r/QualityAssurance, r/web_design, r/userexperience. Post the GIF with "made this for our design reviews". |
| Show HN | Lead with "offline-verified license keys, no tracking". HN likes that angle. |
| YouTube Shorts / TikTok / LinkedIn | 15 s vertical cut of the video: "Stop saying 'the one on the left'". |
| SEO landing page | GitHub Pages: "how to reference images in design review", "number images on a webpage". Link to the store. |
| Agencies / QA communities | Ministry of Testing, Designer Hangout, Figma community forums. |
| Built-in growth loop | Numbered screenshots get a tiny "numbered with Image Number Helper" watermark (free tier only). Shared review links also show "Get the extension". |
| Directories | AlternativeTo, Chrome-Stats, There's An AI For That (once the alt-text AI ships), SaaSHub. |

## 6. Other ideas to make it great

* **Edge Add-ons + Firefox (MV3)**: the same code base with minor tweaks doubles reach.
* **Figma/Canva-style "presentation mode":** bigger badges plus a dimmed page for screen-share calls.
* **Keyboard navigation:** `Alt+Shift+.` / `,` steps through images in order during a meeting.
* **Export to Jira/Linear/GitHub issue template** (markdown already does 80% of this).
* **Changelog "What's new" dot** in the popup after updates, so users discover new features.
* **Uninstall survey URL** (`chrome.runtime.setUninstallURL`) for a one-question "why did you leave?".
