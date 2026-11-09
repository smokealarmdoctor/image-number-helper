# Image Number Helper

Chrome extension that numbers images on a webpage so reviews, QA, and meetings can say “image 7” instead of “the one on the left.”

![Say “image 7”, not “the one on the left”](marketing/store/01-say-image-7.png)

▶️ **[Watch the 34-second demo](marketing/video/image-number-helper-demo.mp4)**

## Features

**Free**
- Numbers the first 8 images on any page. Press `Alt+Shift+N` or use the popup switch.
- Click a badge to copy “Image 7”, or right-click any image → *Copy image number*.
- **Go to image #**: scrolls to the image and spotlights it.
- Stable numbering while lazy images load. **Renumber** resets the order.
- Skips icons and tracking pixels (adjustable minimum size), with an “Always number on this site” option.

**Pro: $4.99 once** (secure checkout by Stripe)
- Unlimited numbers.
- **Meeting report**: alt text, natural/displayed size and file for every number, as Markdown, plain text or CSV. Missing alt text is flagged.
- **Numbered screenshots**, copied to the clipboard and saved.
- 6 colors, 5 positions and a custom start number.

## Repository layout

| Path | What |
|---|---|
| `extension/` | Manifest V3 extension (load unpacked from here) |
| `license-server/` | Cloudflare Worker that issues Pro keys from Stripe payments |
| `scripts/` | `keys`, `stripe:setup`, `issue-key`, `package` |
| `test/` | `npm test`: license crypto, webhook signatures, Worker routes |
| `marketing/` | Demo site, capture/compose/video scripts, store graphics and video |
| `docs/STRATEGY.md` | Review, UX, revenue and growth plan |
| `docs/STRIPE-SETUP.md` | Stripe + Worker setup and go-live checklist |

## Development

```bash
npm test                      # unit + Worker tests (Node 20+)
# chrome://extensions → Developer mode → Load unpacked → extension/
node marketing/capture.cjs    # real screenshots of the extension (Playwright)
node marketing/compose.cjs    # Chrome Web Store graphics → marketing/store/
node marketing/video.cjs      # demo video → marketing/video/ (needs ffmpeg)
npm run package               # dist/*.zip for the Web Store
```

## Privacy policy

Chrome Web Store privacy policy URL:

https://github.com/smokealarmdoctor/image-number-helper/blob/main/PRIVACY.md

## Support

Open an issue on this repository.
