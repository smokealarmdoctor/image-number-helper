# Phase 1 audit: what hurts conversion

Date: 2026-11-23. Read-only. Based on the repo at `dfd6d1d`, the live package (v3.1.0), the
install/uninstall exports sent on Nov 22, and Stripe (checked Nov 18).

## Corrections to the brief

| Brief says | Actually live |
|---|---|
| Pro $4.99 one-time, PayPal | Pro **$2.99** one-time, **Stripe** Payment Link (Managed Payments, Stripe is merchant of record) |
| Licence key sent manually | **Automatic**: key shown and activated on the thank-you page, verified offline in the extension |
| Baseline blank | ~661 users (Nov 9), about **2 real installs/day**, **0 real Pro sales**, rating/review count not supplied |

Not verified from here: the live store page itself (this environment cannot load
chromewebstore.google.com), the rating and review count, weekly users, and the X account's reach.

## The blunt version

**The problem is traffic, not conversion.** Real installs run at about 2 a day (the ~24/day from
Romania since Oct 30 are not real users). At 60 installs a month, even a strong 3% paid conversion
is 2 sales a month, about $6. No listing tweak fixes that. Everything below is ranked with that in
mind.

Second structural fact: the ~661 existing users are founding users with Pro free forever. They can
never pay. **Only new installs can become revenue.**

## Findings by area

### Name
- "Image Number Helper" describes the mechanism, not the job. "Helper" carries no meaning and
  nobody searches "image number".
- The 3.1.0 title ("Image Number Helper – Number & Label Images on Any Page") already adds the
  searchable words. Whether a full rename is justified depends on keyword evidence: see research.md.
- The store URL slug still reads `image-number-helper-pro`. Cosmetic, cannot be changed, ignore.

### Summary (132 chars)
- Current: "Number every image on a page so reviews, QA and meetings can say “image 7” instead of
  “the one on the left.”" Clear and specific. **No change needed.**

### Screenshots and video
- Five 1280x800 screenshots, small tile and marquee exist and were uploaded with 3.0. Order is
  sensible (hero, image search, jump, report, free vs Pro).
- Screenshot 5 leads with the paywall split. That is honest, but it spends a slot on pricing
  instead of a use case. Low priority.
- The demo video is **unlisted** on YouTube. Unlisted video earns zero YouTube search traffic.
  Making it public with a keyworded title and description is free.

### Onboarding
- New installs get a welcome page with three steps and a live "try it" grid. Good.
- Numbers do not appear until the user presses Alt+Shift+N or the switch. Someone who installs,
  skips the welcome tab and clicks nothing sees no value. The "always on" options exist but are
  buried in the popup.
- No prompt to pin the icon beyond a line of text.

### Upgrade prompt
- Free limit is 8 images. On-page chip: "+N more images · Unlock Pro". Popup meter: "Showing 8 of
  N — number all N with Pro →". Locked features name themselves. This is competent.
- Risk: on image-search pages (the second screenshot's use case) the cap is hit instantly, so the
  first impression for that audience is a paywall. Expect some 1-star "paywall" reviews as real
  installs grow. Not changing the free tier without your approval.
- $2.99 is so low it signals "toy" to work buyers and makes every sale nearly worthless. Pricing
  evidence is in research.md.

### Payment flow
- Stripe Payment Link → thank-you page → auto-unlock. Verified end to end on Nov 10. Good.
- **Real defect: the licence server is on Render's free plan, which sleeps when idle.** The first
  request after a quiet period can take 30–60 seconds. That request is the buyer's thank-you page,
  immediately after paying. A hanging page at that moment causes refund requests and distrust.
  Fix is free (a scheduled keep-warm ping) and should be done before any traffic push.
- Lost-key recovery sends the buyer to GitHub issues. Fine for developers, hostile for a marketing
  manager. A support email address is the fix (your call, you create it).
- Refunded keys keep working (you chose to leave this). Acceptable at this volume.

### Website
- Lives on `image-number-helper-site-hecb.onrender.com`. A throwaway-looking hostname hurts trust
  at checkout time and is a weak base for search. A real domain is about $12/year: the only spend
  I would even consider, and only once there is traffic to justify it.
- Search Console verified and sitemap submitted Nov 15. Three guides exist. Too early for data.
- The Chrome dashboard "Official URL" is still unverified (account mismatch). Optional.

### Measurement
- No analytics by design. That is a selling point, but it means the funnel is invisible between
  "install" and "Stripe payment". The only numbers available are the store dashboard and Stripe.
- The store dashboard is currently polluted by the Romanian installs, so the headline install and
  user counts cannot be trusted until that stops.

## What is already fine (do not spend time here)
- Summary line, localisation into six languages, the automated licence system, the welcome page,
  the privacy story, the review prompt added in 3.1.0.

## Phase 1 summary
1. Traffic is the bottleneck: ~2 real installs/day caps revenue at a few dollars a month.
2. Existing users are all free-forever founders, so revenue can only come from new installs.
3. One real defect: the sleeping licence server can stall the post-payment page. Free to fix.
4. $2.99 is probably too low to matter; the unlisted video and the onrender.com hostname waste reach and trust.
5. Listing basics (summary, screenshots, localisation) are in decent shape and are not the constraint.

## Handoff prompt for the next session
> Read `marketing/audit.md`, `marketing/research.md` and `marketing/plan.md` in
> github.com/smokealarmdoctor/image-number-helper. Facts: Pro is $2.99 one-time via Stripe with
> automatic licence keys; ~2 real installs/day; 0 sales; founders have Pro free. Do not change the
> free tier or price without approval. Execute only the plan items I list as approved, in small
> tested slices, and never delete files (move to `_to_delete`).
