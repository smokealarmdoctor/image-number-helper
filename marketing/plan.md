# Phase 3 plan (awaiting approval; nothing has been changed)

Date: 2026-11-23. Read `audit.md` and `research.md` first.

## Targets: the honest version

The brief left the targets blank. Starting point: about 2 real installs a day, 0 sales, founders
excluded from revenue.

| | Proposed 90-day target | Why |
|---|---|---|
| Real installs/day | **8–10** by day 90 (from 2) | Needs 2–3 community posts or articles to land. Store search alone will not do it. |
| Weekly active users | **+250 real** over today's figure | Baseline not supplied, and the dashboard is polluted by the Romanian installs. Send the Users tab and I will set an absolute number. |
| Pro sales | **5–15** | 400–600 real installs at 1–2%. |
| Revenue | **$50–150** at $9.99, **$15–45** at $2.99 | See the math in research.md section 4. |
| Reviews | **10 genuine** | Needed for the Featured nomination and for any price above $2.99. |

**Blunt read:** this extension will not produce meaningful income in 90 days under any plan here.
The realistic win is proving whether demand exists (one use case that pulls installs) for under
ten hours of your time. If nothing moves installs by day 60, stop investing.

## Ranked actions

Impact is on installs or sales within 90 days. Effort: S = under 2 hours, M = half a day to
2 days, L = more. "You" = needs your account or a post from you.

| # | Action | Impact | Effort | Cost | Who | Top 5 |
|---|---|---|---|---|---|---|
| 1 | **Keep the licence server warm** with a free scheduled ping so the post-payment page never stalls | Protects every sale | S | $0 | Me | ★ |
| 2 | **Alt-text audit article + site guide**: "How to audit every image's alt text on a page" using the extension; draft for dev.to #a11y and r/seogrowth | High: the only use case with proven demand | M | $0 | Me draft, you post | ★ |
| 3 | **Make the demo video public** on YouTube with a keyworded title, description and link | Medium: free search traffic, zero work | S | $0 | You (I write the text) | ★ |
| 4 | **Three community posts**: Showoff Saturday on r/webdev, r/chrome_extensions, one photographers' proofing angle (numbered screenshot) | Medium-high, spiky | M | $0 | Me draft, you post | ★ |
| 5 | **Raise Pro to $9.99** once real installs reach ~10/day; new Stripe price and link, six languages of copy, 60-day test | Triples revenue per sale; zero effect on installs | M | $0 | Me, **needs your approval** | ★ |
| 6 | Confirm the live listing shows the 3.1.0 title and $2.99 copy (search indexes still show the old one) | Medium if it is wrong | S | $0 | You, 2 minutes | |
| 7 | "Copy numbered screenshot + image list for AI" action | Medium: new audience, easy to post about | M (2–3 days) | $0 | Me | |
| 8 | Product Hunt launch | Medium, one shot; better after reviews exist | M | $0 | Me draft, you launch | |
| 9 | Publish on Microsoft Edge Add-ons (same package) | Low-medium: a second store with less competition | S–M | $0 | Me package, you create the account | |
| 10 | Support email address in place of GitHub issues | Low-medium: trust at purchase | S | $0 | You create, I wire in | |
| 11 | Submit the Featured badge nomination | Medium if granted; weak without reviews | S | $0 | You, after ~10 reviews | |
| 12 | Onboarding: offer "number images on every site" on the welcome page | Low-medium: more first-day value | S | $0 | Me | |
| 13 | Custom domain for the site | Low until there is traffic | S | ~$12/yr | You buy | |
| 14 | Free alt-text sister extension | Unknown; test with #2 first | M (3–5 days) | $0 | Me | |
| 15 | Posts from @ArbyGold | Low unless the account has a relevant audience | S | $0 | You | |

## Not worth doing

| Idea | Why not |
|---|---|
| Paid ads | At roughly $2–5 per install and 1% conversion, a sale costs $200–500 and returns $2.99–9.99. |
| Rename | No keyword evidence for it (research.md section 3). |
| Subscription pricing | Wrong shape for an occasional-use tool; needs a rebuilt licence system. |
| ExtensionPay / WXT | Solve problems you do not have (research.md section 5). |
| Email capture | Breaks the "no account, no tracking" promise for a list of a few dozen people. |
| Image downloader or element-numbering sister extensions | Saturated, or won by SaaS products. |
| More screenshots, new promo tile, new video | The existing set is recent and adequate. Traffic is the constraint. |
| Anything about the Romanian installs | Cannot be blocked; no harm done. |

## Free-tier note (no change proposed)

Moving the alt-text report from Pro to free would make action #2 far stronger, because the
article's reader could finish the job without paying. Risk: it removes the Pro feature most likely
to sell to that audience. I am **not** proposing it now. If #2 pulls installs but no sales, it is
the first thing to revisit, with a before/after note.

## Order of work if approved

1. #1 keep-warm (before any traffic arrives)
2. #6 you confirm the live listing
3. #3 video text, then #2 article and guide
4. #4 community drafts, posted one per week so results can be told apart
5. #5 price change only when installs justify it

## Phase 3 summary
1. Realistic 90-day outcome: 8–10 real installs/day, 5–15 sales, $50–150. Not meaningful income.
2. The plan is a cheap demand test built on the alt-text use case, not a revenue plan.
3. Top 5: keep-warm ping, alt-text article, public video, three community posts, $9.99 price later.
4. Spend $0. Ads, rename, subscription, ExtensionPay, WXT and email capture are all rejected.
5. Nothing has been changed. Waiting for your approval of specific item numbers.

## Handoff prompt for the next session
> Approved items from `marketing/plan.md`: [list the numbers]. Execute only those, in the order
> given under "Order of work", in small tested slices. Reproduce and test before any code change,
> batch pushes, never delete files (move to `_to_delete`). Drafts for posts go in
> `marketing/posts/`; I post everything myself. Do not change the price or the free tier unless
> item 5 is in the approved list.
