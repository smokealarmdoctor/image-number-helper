# Privacy policy — Image Number Helper

Last updated: November 12, 2026

Image Number Helper is a Chrome extension that overlays numbered badges on images in the page you are viewing so you can refer to them in reviews, QA, and meetings.

This policy is the public URL for the Chrome Web Store listing.

## Data we collect

We do not create accounts, run analytics, or send page contents to a server.

Settings (label style, colors, the sites you choose to auto-number, and your license key) are stored in Chrome’s sync storage on your Google account so they follow you between browsers. That storage never leaves your Google account except as Chrome already syncs it.

The “copy report” and “screenshot” actions (Pro) write image alt text, dimensions, file names, or a picture of the visible page to your clipboard and, for screenshots, your downloads folder. That data never leaves your device unless you paste or share it somewhere.

A small usage counter (how many times you have used a feature and the date you first did) is kept only on your device, in Chrome’s local storage, to decide when to show a one-time invitation to rate the extension. It is never sent anywhere.

We do not collect:
- browsing history
- passwords or form data
- names or accounts (beyond the purchase email described below)
- analytics or advertising identifiers

## Permissions

- **storage**: save preferences and your license key in Chrome sync storage.
- **activeTab**: talk to the tab you have open when you use the popup, and capture a numbered screenshot when you ask for one.
- **contextMenus**: add “Copy image number” and “Show / hide image numbers” to the right-click menu.
- **scripting**: add the numbering script to tabs that were already open before the extension was installed or updated.
- **Host access (http/https)**: read the position of `<img>` elements on the current page so badges can be drawn over them. The extension does not inject ads, read forms, or collect browsing history. On our license page only, it reads the license key shown to you so Pro unlocks without copy and paste.

## Payments

The optional Pro unlock costs **$2.99 USD once** and is paid through Stripe’s hosted checkout. [Stripe’s privacy policy](https://stripe.com/privacy) applies to that purchase. We never see card numbers.

After payment, our license server creates a license key. The key contains the email you used at checkout so you can recover it later. We store the key with your payment record in Stripe and email it to you once (via our email provider, Resend). Afterwards the extension checks the key offline, and no data is sent when you use the extension. You can ask us to email your key again from the “Lost your key?” page.


## Sharing

We do not sell data. We do not use it for advertising, credit, or anything unrelated to labeling images.

## Contact

Questions about this policy: open an issue at [github.com/smokealarmdoctor/image-number-helper](https://github.com/smokealarmdoctor/image-number-helper/issues).
