# Phase 2 research

Date: 2026-11-23.

## Read this first: evidence quality

Most primary sources could not be opened from this environment (Chrome Web Store, Reddit,
Indie Hackers, extensionpay.com, wxt.dev and keyword tools were all unreachable; only GitHub
opened). So:

- **[opened]** = the page was read directly.
- **[snippet]** = taken from a search-result summary of the linked page. Undated, may be stale.
- **No keyword volumes exist in this document.** None could be obtained without a paid tool.
  Demand is judged by proxy: who occupies each phrase in the store and how big they are.
- Every user count, price and community rule below needs a live check before you act on it.

Two stale things turned up in search indexes: the store listing is still indexed as "Image Number
Helper Pro" with "$5 one-time" and a "50-image cap". The live package is 3.1.0 and the repo says
$2.99 everywhere, so this is most likely an old index. **Open the live listing once and confirm
the new title and description are showing.**

## 1. Comparable extensions that make money

| Extension | What it does | Pricing | Users | Public revenue | Where users come from |
|---|---|---|---|---|---|
| GoFullPage | Full-page screenshots | Free capture; premium editor $12/yr [snippet, [IH](https://www.indiehackers.com/product/full-page-screen-capture/released-premium-editing-tools--LrBFJPRG6k-Akw3ZS8j)] | ~8–9M [snippet, [store](https://chrome.google.com/webstore/detail/fdpohaocaechififmbbbbbknoalclacl)] | ~$10k/mo c. 2021 [snippet, [ExtensionPay](https://extensionpay.com/articles/browser-extensions-make-money)] | Unverified. Monetised only after ~3M users [snippet, [ebizfacts](https://ebizfacts.com/peter-coles-10000-people-paying-him-1-month)] |
| CSS Scan | Hover to copy CSS | Paid only, one-time. Started pay-what-you-want from $1.99, raised to ~$69–80 [snippet, [IH AMA](https://www.indiehackers.com/post/i-made-over-100-000-with-a-browser-extension-css-scan-ama-04f2bde465)] | Unverified | $100k+ total [snippet, [IH](https://www.indiehackers.com/product/css-scan/100-000-in-revenue-with-css-scan--MF_-4QWdBIJscbnJMSK)] | Product Hunt (twice), deal groups, YouTube, Twitter, SEO [snippet, IH AMA] |
| Hoverify | Web inspector toolkit | $30/yr or $89 one-time, no free tier [snippet, [pricing](https://tryhoverify.com/pricing/)] | "26,000+ developers" (self-reported) [snippet, [site](https://tryhoverify.com/author/himanshu-mishra/)] | None public | Indie Hackers launch [snippet, [IH](https://www.indiehackers.com/post/show-ih-just-launched-hoverify-hover-to-inspect-element-be44a3190f)] |
| Night Eye | Dark mode | Free tier; $9/yr, $14/yr, $40 one-time [snippet, [store](https://chrome.google.com/webstore/detail/alncdjedloppbablonallfbkeiknmkdi)] | Unverified | $1.8k–3.1k/mo depending on source [snippet, [IH interview](https://www.indiehackers.com/interview/overcoming-the-expectation-of-free-to-build-a-profitable-product-cc308a033d)] | Unverified |
| Weather Extension | Toolbar weather | Free; premium $9.99 [snippet, ExtensionPay article] | Unverified | $2.5k/mo [snippet, same] | Unverified |
| Easy Folders | Folders for AI chats | Unverified | Unverified | $3.7k MRR, $42k total at 6 months [snippet, [IH](https://www.indiehackers.com/product/easy-folders/6-months-post-launch-my-chrome-extension-has-hit-3-700-in-mrr-and-42-000-in-total-revenue--O3qs28VAnAkcJw0j--M)] | Unverified |
| Web Highlights | Web/PDF highlighter | Free offline; paid sync ~$2–3/mo (third-party, unverified) [snippet, [AlternativeTo](https://alternativeto.net/software/web-highlights--pdf-and-web-highlighter/about)] | "100k+" [snippet, [founder blog](https://www.web-highlights.com/blog/the-tech-stack-behind-web-highlights-a-chrome-extension-with-over-10-000-weekly-users/)] | ~$6.3k for 2024, low confidence [snippet, [Latka](https://getlatka.com/companies/web-highlights)] | Founder blogging |
| Checkbot | SEO/speed checker | Free basic; Pro ~$15/user/mo (unverified) [snippet, [Toolradar](https://toolradar.com/tools/checkbot)] | ~15k [snippet, [Capterra](https://www.capterra.in/software/178960/checkbot)] | None public | Product Hunt [snippet, [PH](https://www.producthunt.com/posts/checkbot-for-chrome)] |
| Closet Tools (niche contrast) | Poshmark automation | $30/mo [snippet, ExtensionPay article] | Unverified | ~$42k/mo [snippet, same] | Unverified |
| Marker.io / BugHerd (team contrast) | Visual bug reporting | From $39/mo and ~$50/mo [snippet, [Toolradar](https://toolradar.com/tools/marker-io/pricing), [Capterra](https://www.capterra.com/p/224784/BugHerd/pricing/)] | Marker.io 30,000 [snippet, [store](https://chromewebstore.google.com/detail/markerio-visual-bug-repor/jofhoojcehdmaiibilpcoofpdbbddkkl)] | Unverified | Unverified |

Not found: ColorZilla monetisation, Awesome Screenshot pricing, Glasp, Motion DevTools. Listing
tactics (screenshots, video) could not be observed. The one visible pattern is the title format
"Brand - keyword phrase", which the 3.1.0 title already follows.

**What separates the earners (my inference from the table):**
1. **Scale or niche.** GoFullPage earns because a fraction of a percent of millions pay. Closet
   Tools earns because the tool makes its users money. 660 general users is neither.
2. **Price follows the buyer.** Work tools sit at $30–89, consumer utilities at $9–40. Nothing in
   the set earns meaningfully at $2.99.
3. **Prices were raised on evidence.** CSS Scan began at $1.99 and climbed as buyers kept paying.
4. **Distribution happened off-store.** Product Hunt, YouTube, Twitter, SEO. Nobody credits store
   search alone.
5. **Teams pay for workflow, not overlays.** Marker.io charges for tracker integration and reports.

## 2. Use cases and where those people are

Ranked by evidence and reach. No Reddit thread or rule could be verified.

| # | Use case | Evidence of the need | Communities | Reach |
|---|---|---|---|---|
| 1 | **Alt-text and image SEO audits** | BOIA recommends a spreadsheet of every image URL and its alt text [snippet, [BOIA](https://boia.org/blog/perform-an-alt-text-audit-to-improve-accessibility-and-seo)]. Old threads asking for exactly this [snippet, [SitePoint](https://www.sitepoint.com/community/t/bookmarklet-to-check-alt-attributes/95370)]. A 30,000-user extension exists for it (see section 3). | web-a11y Slack ([join](https://accessibility.github.io/a11yslack)); dev.to [#a11y](https://dev.to/t/a11y); r/accessibility (unverified); r/seogrowth, one-link self-posts allowed [snippet, [rankhog](https://rankhog.com/subreddits/seogrowth)] | Medium. A useful how-to works; a product drop will not. |
| 2 | **Design review / client feedback** | Paid tools built on numbered pins have real installs: Marker.io 30,000, MarkUp 20,000 [snippet, [store](https://chromewebstore.google.com/detail/markup-for-chrome/llbkdcpbiogplgmefnkbgcdfiopfphbc)] | r/webdev ~3.3M, project posts limited to Showoff Saturday [snippet, [hiveindex](https://thehiveindex.com/communities/r-webdev/)]; r/web_design ~974K [snippet, [hiveindex](https://thehiveindex.com/communities/r-web-design/)] | Largest audience, hardest to reach. No thread found asking for image numbering. |
| 3 | **Photographers and client proofing** ("which photo do you want?") | The best real threads: [dgrin](https://dgrin.com/discussion/192754/proofing-numbers-on-thumbnails), [WordPress NextGEN](https://wordpress.org/support/topic/nextgen-gallery-order-client-numbered-photos/), [Adobe Lightroom](https://community.adobe.com/t5/lightroom/imsge-numbering/m-p/11868914), an open [Wix feature request](https://support.wix.com/en/article/wix-editor-request-displaying-page-numbers-on-galleries) [all snippet] | Those forums. Vendor forums rarely welcome third-party plugs (assumption). | Medium. Catch: the client sees the numbers only via a numbered screenshot or screen share, and screenshots are Pro. |
| 4 | **Visual feedback to AI tools** | Vibe Annotations 6,000 users [snippet, [store](https://chromewebstore.google.com/detail/vibe-annotations/gkofobaeeepjopdpahbicefmljcmpeof)]; WebMarker numbers elements for vision models [opened, [GitHub](https://github.com/reidbarber/webmarker)] | r/chrome_extensions ~50k [snippet, [rankhog](https://rankhog.com/subreddits/chrome_extensions)]; dev.to | Easiest to post to, but mostly developers, who rarely buy. |
| 5 | **QA / bug reporting** | Weak. Numbered-step screenshot tools sit at tens of users. | r/QualityAssurance (unverified) | Low. |

Dropped for lack of evidence: teachers/ESL, e-commerce catalog teams, virtual assistants.
Image-search comparison: nothing else numbers Google Images results. That is either a gap or
proof of no demand, and the data cannot say which.

## 3. Keyword demand and the name

| Phrase | Who is there [all snippet] |
|---|---|
| number / label images on a page | Your listing is the top general result. Otherwise [Imgur Numbering](https://chromewebstore.google.com/detail/imgur-numbering/ankgddgkcflpakdolgoijaimpoafpmie) (2 ratings). |
| image counter | [Image Counter For SEO Agency](https://chromewebstore.google.com/detail/ohdmakoaapfnhojbebmahpffahccobpe), ~341 users |
| image alt text checker | [Image Alt Text Viewer](https://chromewebstore.google.com/detail/image-alt-text-viewer/nhmihbneenlkbjjpbimhegikadfleccd) ~30,000; [WAVE](https://chromewebstore.google.com/detail/jbbplnpkjmmeebjpijfedlgcdilocofh) 700,000; then a long tail under 200 users |
| list all images on page | Downloaders: [Imageye](https://chrome.google.com/webstore/detail/image-downloader-imageye/agionbommeaifngbhincahgmoflcikhm) 1–2M, [Image Downloader](https://chrome.google.com/webstore/detail/image-downloader/cnpniohnfphhjihaiiggeabnkjhpaldj) 1M |
| annotate images on web page | Feedback platforms (Marker.io, MarkUp) |

**Conclusion: the data does not support a rename.** You already own "number images" and nobody
else is there, which also means few people search for it. The only adjacent phrase with proven
installs is "alt text". Google says ranking uses ratings and usage and warns against keyword
stuffing [snippet, [Chrome docs](https://developer.chrome.com/docs/webstore/discovery)].

| Option | Trade-off |
|---|---|
| **A. Keep "Image Number Helper – Number & Label Images on Any Page"** (recommended) | No recognition lost. Will not create demand that is not there. |
| B. "Image Number Helper – Number Images & Check Alt Text" | Reaches the one phrase with a 30k-user incumbent. Dilutes the "say image 7" pitch, competes with free WAVE, and the alt-text report is Pro, so the title would promise a paid feature. |
| C. Full rename to an audit name ("Image Audit") | Not supported. Generic, crowded, discards 660 users' recognition. |

## 4. Pricing

Evidence [all snippet]:
- Self-reported free-to-paid conversion runs **0.2–2%**: GoFullPage ~0.2% (third-party estimate),
  one developer's five extensions 0.8% with "0.5–2% realistic"
  ([dev.to](https://dev.to/ktg0215/real-numbers-freemium-chrome-extension-monetization-after-6-months-5hga)).
- Guides put the one-time sweet spot at $9.99–29.99
  ([Dodo Payments](https://dodopayments.com/blogs/browser-extension-freemium-payments)). Marketing
  content, not data.
- CSS Scan buyers voluntarily paid $5–25 when the minimum was $1.99 (IH AMA above). Best evidence
  that a sub-$5 price leaves money on the table.
- Night Eye's founder reports users prefer paying once (IH interview above).
- ExtensionPay's founder says one-time sales "tend to fall off over time"
  ([IH](https://www.indiehackers.com/product/extensionpay)).
- No source gives a controlled test of under-$5 against $9–19.

**Revenue math at 1% conversion, 90 days, before payment fees.** Only new installs can pay
(founders have Pro free).

| Real installs/day | Installs in 90 days | Sales at 1% | $2.99 one-time | $9.99 one-time | $19 one-time | $2/mo subscription (90-day total, no churn) |
|---|---|---|---|---|---|---|
| 2 (today) | 180 | ~2 | $5 | $18 | $34 | ~$7 |
| 10 | 900 | 9 | $27 | $90 | $171 | ~$36 |
| 30 | 2,700 | 27 | $81 | $270 | $513 | ~$108 |

Reading: at today's traffic, price is irrelevant. Once traffic exists, $9.99 roughly triples
revenue against $2.99 if conversion holds, and the evidence suggests it mostly would for a work
tool. A subscription is the wrong shape for an occasional-use utility and would need a rebuilt
licence system.

**Recommendation: $9.99 one-time**, tested for 60 days once real installs reach about 10/day.
Not $19 until there are reviews to back it. No subscription.

## 5. ExtensionPay and WXT

**ExtensionPay: do not switch.** Maintained (v3.1.3, commit 16 Nov 2026) [opened,
[repo](https://github.com/Glench/ExtPay)], supports MV3 and one-time payments. But it adds a 5%
fee [snippet, [site](https://extensionpay.com/)], a runtime dependency on its server, and has an
open `onPaid` bug [opened, [issues](https://github.com/Glench/ExtPay/issues)]. Your Stripe link
plus offline-verified keys already works. Zero sales is a traffic and pricing problem, not a
checkout problem. Reconsider only if you ever want trials or subscriptions.

**WXT: do not migrate.** Active, v0.21.5, still pre-1.0 [opened,
[releases](https://github.com/wxt-dev/wxt/releases)]. It adds a build step and dependency tree to
a small vanilla extension and changes nothing a user or buyer sees. Worth it only if you port to
Firefox/Safari or adopt TypeScript.

## 6. Sister-extension ideas

| Idea | Demand evidence [snippet] | Competition | Effort | Verdict |
|---|---|---|---|---|
| Alt-text / image SEO audit (free, cross-promotes Pro) | Image Alt Text Viewer ~30,000; WAVE 700,000; long tail under 200 | Medium-high; listing alone will not bring installs | 3–5 days (report and export exist) | **Build later, low expectations.** Test demand first with an alt-text how-to article that uses the current extension. |
| List and download all images | Imageye 1–2M, Image Downloader 1M | Saturated | 4–6 days | **Don't build.** |
| Number any element for feedback / AI prompts | Vibe Annotations 6,000; bare numbering tools ~840 ([Click by Voice](https://chromewebstore.google.com/detail/click-by-voice/dleiijbbjajmfcaiiiadgjpgfjmfdfen)) | Winners are SaaS-backed | 7–10 days | **Don't build separately.** A "copy numbered screenshot + image list for AI" action inside the current extension is 2–3 days. |

Also rejected: link-hint numbering (Vimium, 500,000 users, free) and a standalone numbered
screenshot annotator (long tail at tens of users).

## Phase 2 summary
1. Evidence is thin: most sources are search snippets and no keyword volumes were obtainable.
2. Nothing comparable earns at $2.99; earners have either huge scale or a niche that pays for workflow.
3. Alt-text auditing is the one adjacent use case with proven demand; photographers' proofing has the best real threads.
4. No rename. Keep the 3.1.0 title. Do not adopt ExtensionPay or WXT.
5. Raise the price to $9.99 only once real traffic exists; sister extensions wait until an article proves demand.

## Handoff prompt for the next session
> Read `marketing/research.md` and `marketing/plan.md`. Before acting on any number in
> research.md, re-verify it live: allow chromewebstore.google.com, reddit.com,
> www.indiehackers.com, extensionpay.com and wxt.dev in the environment's network settings, then
> re-check the user counts, community rules and prices marked [snippet].
